import database from '../../../services/database';
import { requireSession } from '../../../services/session.service';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = requireSession(req, res);
    if (!session) return;

    try {
        const { partnerId, subject } = req.body;

        if (!partnerId) {
            return res.status(400).json({
                success: false,
                message: 'partnerId is required'
            });
        }

        // Determine user_id and admin_id based on who initiates
        let userId, adminId;
        if (session.is_admin) {
            adminId = session.id;
            userId = partnerId;
        } else {
            userId = session.id;
            adminId = partnerId;
        }

        const conversation = await database.getOrCreateConversation(
            userId,
            adminId,
            subject || null
        );

        res.status(200).json({
            success: true,
            conversation,
        });
    } catch (error) {
        console.error('Create conversation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create conversation'
        });
    }
}
