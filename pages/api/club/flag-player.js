import database from '../../../services/database';
import { requireSession } from '../../../services/session.service';

export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = requireSession(req, res);
    if (!session) return;

    if (session.role !== 'club') {
        return res.status(403).json({ success: false, message: 'Forbidden: Club access only' });
    }

    try {
        const { playerId, reason } = req.body;

        if (!playerId) {
            return res.status(400).json({ success: false, message: 'Player ID is required' });
        }

        // Verify the player belongs to this club
        const player = await database.getUserById(playerId);
        if (!player || player.club_id !== session.id) {
            return res.status(403).json({ success: false, message: 'Player does not belong to your club' });
        }

        // Update the flag reason (null to clear the flag)
        await database.updateUser(playerId, {
            club_flag_reason: reason || null
        });

        res.status(200).json({
            success: true,
            message: reason ? 'Player flagged successfully' : 'Player flag cleared'
        });
    } catch (error) {
        console.error('Error flagging player:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to flag player'
        });
    }
}
