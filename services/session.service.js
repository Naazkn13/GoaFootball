// Session Service — HTTP-Only Cookie JWT Management
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const COOKIE_NAME = 'session_token';
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Create a session: sign JWT and set HttpOnly cookie on response
 */
export function createSession(res, user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role || null,
    is_admin: user.is_admin || false,
    is_super_admin: user.is_super_admin || false,
    approval_status: user.approval_status || 'pending',
    registration_completed: user.registration_completed || false,
    football_id: user.football_id || null,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: `${MAX_AGE}s` });

  // Set HttpOnly cookie
  const cookieOptions = [
    `${COOKIE_NAME}=${token}`,
    `Max-Age=${MAX_AGE}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
  ];

  // Add Secure flag in production
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.push('Secure');
  }

  res.setHeader('Set-Cookie', cookieOptions.join('; '));
  return payload;
}

/**
 * Get the current session from the request cookie
 * Returns the decoded JWT payload or null if no valid session
 */
export function getSession(req) {
  try {
    const cookies = parseCookies(req);
    const token = cookies[COOKIE_NAME];

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Require a valid session — throws if not authenticated
 * Use in API routes: const session = requireSession(req, res);
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
 * Require admin session — throws if not admin
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
 * Require super-admin session — throws if not super admin
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
 * Clear the session cookie (logout)
 */
export function clearSession(res) {
  const cookieOptions = [
    `${COOKIE_NAME}=`,
    `Max-Age=0`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
  ];

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.push('Secure');
  }

  res.setHeader('Set-Cookie', cookieOptions.join('; '));
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

export default {
  createSession,
  getSession,
  requireSession,
  requireAdmin,
  requireSuperAdmin,
  clearSession,
};
