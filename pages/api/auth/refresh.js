import { refreshSession, clearSession } from '../../../services/session.service';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const result = await refreshSession(req, res);

        if (!result) {
            // Refresh failed — clear cookies and return 401
            await clearSession(req, res);
            return res.status(401).json({
                success: false,
                message: 'Session expired — please log in again'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            user: result,
        });
    } catch (error) {
        console.error('Refresh error:', error);
        res.status(500).json({
            success: false,
            message: 'Token refresh failed'
        });
    }
}
