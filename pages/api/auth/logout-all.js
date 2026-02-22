import { getSession, revokeAllSessions, clearSession } from '../../../services/session.service';
import database from '../../../services/database';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const session = getSession(req);
        if (!session) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized — please log in'
            });
        }

        // Revoke all sessions for this user
        await revokeAllSessions(session.id);

        // Log the revoke_all action
        const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || null;
        await database.logLoginAction({
            user_id: session.id,
            action: 'revoke_all',
            ip_address: ipAddress,
            device_info: req.headers['user-agent'] || null,
        });

        // Clear current cookies
        await clearSession(req, res);

        res.status(200).json({
            success: true,
            message: 'All sessions have been revoked. You have been logged out from all devices.'
        });
    } catch (error) {
        console.error('Logout all error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to revoke all sessions'
        });
    }
}
