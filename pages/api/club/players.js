import database from '../../../services/database';
import { requireSession } from '../../../services/session.service';

export default async function handler(req, res) {
    const session = requireSession(req, res);
    if (!session) return;

    if (session.role !== 'club') {
        return res.status(403).json({ success: false, message: 'Forbidden: Club access only' });
    }

    if (req.method === 'GET') {
        try {
            const players = await database.getUsersByClub(session.id);
            return res.status(200).json({ success: true, players });
        } catch (error) {
            console.error('Error fetching club players:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch players' });
        }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
}
