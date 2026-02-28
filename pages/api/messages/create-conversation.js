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

        if (session.is_admin && !partnerId) {
            return res.status(400).json({
                success: false,
                message: 'partnerId (user_id) is required for admins'
            });
        }

        // If an admin is creating the chat, partnerId is the user. If the user is creating it, the user is the session.id
        let userId;
        let adminId;

        if (session.is_admin) {
            userId = partnerId;
            adminId = session.id;
        } else {
            userId = session.id;

            // Fetch any real admin ID from the database just to satisfy the Foreign Key constraint
            const { data: admins } = await database.client
                .from('users')
                .select('id')
                .or('is_admin.eq.true,is_super_admin.eq.true')
                .limit(1);

            adminId = (admins && admins.length > 0) ? admins[0].id : null;

            if (!adminId) {
                return res.status(500).json({ success: false, message: 'No admins exist in DB to satisfy constraints' });
            }
        }

        const conversation = await database.getOrCreateConversation(
            userId,
            adminId,
            subject || 'Support Chat'
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
