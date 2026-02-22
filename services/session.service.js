// Session Service — Access Token + Refresh Token + DB Sessions
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import database from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';
const ACCESS_MAX_AGE = 15 * 60; // 15 minutes
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

/**
 * Hash a token using SHA-256
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a random refresh token (64-char hex)
 */
function generateRefreshToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Get client IP from request
 */
function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.connection?.remoteAddress || null;
}

/**
 * Build cookie string with security options
 */
function buildCookie(name, value, maxAge) {
  const parts = [
    `${name}=${value}`,
    `Max-Age=${maxAge}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
  ];
  if (process.env.NODE_ENV === 'production') {
    parts.push('Secure');
  }
  return parts.join('; ');
}

/**
 * Parse cookies from request headers
 */
function parseCookies(req) {
  const cookieHeader = req.headers.cookie || '';
  const cookies = {};
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts[0]?.trim();
    const value = parts.slice(1).join('=').trim();
    if (name) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  return cookies;
}

/**
 * Create a new session: access JWT + refresh token + DB record + cookies
 */
export async function createSession(res, user, req) {
  const deviceInfo = req?.headers?.['user-agent'] || null;
  const ipAddress = req ? getClientIP(req) : null;

  // 1. Create short-lived access JWT
  const accessPayload = {
    id: user.id,
    email: user.email,
    role: user.role || null,
    is_admin: user.is_admin || false,
    is_super_admin: user.is_super_admin || false,
    approval_status: user.approval_status || 'pending',
    registration_completed: user.registration_completed || false,
    football_id: user.football_id || null,
  };

  const accessToken = jwt.sign(accessPayload, JWT_SECRET, { expiresIn: `${ACCESS_MAX_AGE}s` });

  // 2. Generate random refresh token
  const rawRefreshToken = generateRefreshToken();
  const hashedRefreshToken = hashToken(rawRefreshToken);

  // 3. Store session in DB
  const expiresAt = new Date(Date.now() + REFRESH_MAX_AGE * 1000).toISOString();
  const dbSession = await database.createDBSession({
    user_id: user.id,
    refresh_token: hashedRefreshToken,
    device_info: deviceInfo,
    ip_address: ipAddress,
    expires_at: expiresAt,
  });

  // 4. Log the login action
  await database.logLoginAction({
    user_id: user.id,
    session_id: dbSession.id,
    action: 'login',
    ip_address: ipAddress,
    device_info: deviceInfo,
  });

  // 5. Set both cookies
  const cookies = [
    buildCookie(ACCESS_COOKIE, accessToken, ACCESS_MAX_AGE),
    buildCookie(REFRESH_COOKIE, rawRefreshToken, REFRESH_MAX_AGE),
  ];
  res.setHeader('Set-Cookie', cookies);

  return accessPayload;
}

/**
 * Get the current session from the access token cookie
 * Returns decoded JWT payload or null (does NOT auto-refresh)
 */
export function getSession(req) {
  try {
    const cookies = parseCookies(req);
    const token = cookies[ACCESS_COOKIE];
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Require a valid session — returns null and sends 401 if not authenticated
 */
export function requireSession(req, res) {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ success: false, message: 'Unauthorized — please log in' });
    return null;
  }
  return session;
}

/**
 * Require admin session
 */
export function requireAdmin(req, res) {
  const session = requireSession(req, res);
  if (!session) return null;

  if (!session.is_admin) {
    res.status(403).json({ success: false, message: 'Forbidden — admin access required' });
    return null;
  }

  return session;
}

/**
 * Require super-admin session
 */
export function requireSuperAdmin(req, res) {
  const session = requireSession(req, res);
  if (!session) return null;

  if (!session.is_super_admin) {
    res.status(403).json({ success: false, message: 'Forbidden — super admin access required' });
    return null;
  }

  return session;
}

/**
 * Refresh session: validate refresh token → rotate → issue new access JWT
 * Returns { accessPayload } on success, null on failure
 */
export async function refreshSession(req, res) {
  try {
    const cookies = parseCookies(req);
    const rawRefreshToken = cookies[REFRESH_COOKIE];

    if (!rawRefreshToken) return null;

    const hashedToken = hashToken(rawRefreshToken);
    const dbSession = await database.getSessionByRefreshToken(hashedToken);

    if (!dbSession) return null;

    // Check expiration
    if (new Date(dbSession.expires_at) < new Date()) {
      await database.deactivateSession(dbSession.id);
      return null;
    }

    // Fetch FRESH user data from DB
    const user = await database.getUserById(dbSession.user_id);
    if (!user) {
      await database.deactivateSession(dbSession.id);
      return null;
    }

    // Generate new tokens
    const accessPayload = {
      id: user.id,
      email: user.email,
      role: user.role || null,
      is_admin: user.is_admin || false,
      is_super_admin: user.is_super_admin || false,
      approval_status: user.approval_status || 'pending',
      registration_completed: user.registration_completed || false,
      football_id: user.football_id || null,
    };

    const newAccessToken = jwt.sign(accessPayload, JWT_SECRET, { expiresIn: `${ACCESS_MAX_AGE}s` });

    // Rotate refresh token
    const newRawRefreshToken = generateRefreshToken();
    const newHashedRefreshToken = hashToken(newRawRefreshToken);
    const newExpiresAt = new Date(Date.now() + REFRESH_MAX_AGE * 1000).toISOString();

    await database.updateSession(dbSession.id, {
      refresh_token: newHashedRefreshToken,
      last_activity: new Date().toISOString(),
      expires_at: newExpiresAt,
    });

    // Log refresh
    const ipAddress = getClientIP(req);
    const deviceInfo = req.headers['user-agent'] || null;
    await database.logLoginAction({
      user_id: user.id,
      session_id: dbSession.id,
      action: 'refresh',
      ip_address: ipAddress,
      device_info: deviceInfo,
    });

    // Set new cookies
    const cookieHeaders = [
      buildCookie(ACCESS_COOKIE, newAccessToken, ACCESS_MAX_AGE),
      buildCookie(REFRESH_COOKIE, newRawRefreshToken, REFRESH_MAX_AGE),
    ];
    res.setHeader('Set-Cookie', cookieHeaders);

    return accessPayload;
  } catch (error) {
    console.error('Refresh session error:', error);
    return null;
  }
}

/**
 * Revoke a specific session by ID
 */
export async function revokeSession(sessionId) {
  return database.deactivateSession(sessionId);
}

/**
 * Revoke ALL sessions for a user (force logout everywhere)
 */
export async function revokeAllSessions(userId) {
  return database.deactivateAllUserSessions(userId);
}

/**
 * Get active sessions for a user
 */
export async function getActiveSessions(userId) {
  return database.getActiveSessions(userId);
}

/**
 * Clear both session cookies + mark DB session inactive
 */
export async function clearSession(req, res) {
  try {
    const cookies = parseCookies(req);
    const rawRefreshToken = cookies[REFRESH_COOKIE];

    if (rawRefreshToken) {
      const hashedToken = hashToken(rawRefreshToken);
      const dbSession = await database.getSessionByRefreshToken(hashedToken);

      if (dbSession) {
        await database.deactivateSession(dbSession.id);

        const ipAddress = getClientIP(req);
        const deviceInfo = req.headers['user-agent'] || null;
        await database.logLoginAction({
          user_id: dbSession.user_id,
          session_id: dbSession.id,
          action: 'logout',
          ip_address: ipAddress,
          device_info: deviceInfo,
        });
      }
    }
  } catch (error) {
    console.error('Clear session DB error:', error);
  }

  // Always clear cookies regardless of DB errors
  const clearCookies = [
    buildCookie(ACCESS_COOKIE, '', 0),
    buildCookie(REFRESH_COOKIE, '', 0),
  ];
  res.setHeader('Set-Cookie', clearCookies);
}

/**
 * Cleanup expired sessions (call periodically)
 */
export async function cleanupExpiredSessions() {
  return database.deleteExpiredSessions();
}

export default {
  createSession,
  getSession,
  requireSession,
  requireAdmin,
  requireSuperAdmin,
  refreshSession,
  revokeSession,
  revokeAllSessions,
  getActiveSessions,
  clearSession,
  cleanupExpiredSessions,
};
