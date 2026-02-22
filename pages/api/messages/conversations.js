import database from '../../../services/database';
import { requireSession } from '../../../services/session.service';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = requireSession(req, res);
    if (!session) return;

    try {
        // If admin, get ALL conversations; otherwise get only user's conversations
        let conversations;
        if (session.is_admin) {
            conversations = await database.getAllConversationsForAdmin();
        } else {
            conversations = await database.getConversationsByUser(session.id);
        }

        // For each conversation, get unread count and last message preview
        const enriched = await Promise.all(
            conversations.map(async (conv) => {
                // Get last message
                const messages = await database.getMessagesByConversation(conv.id);
                const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

                // Count unread messages for current user
                const unreadMessages = messages.filter(
                    m => m.receiver_id === session.id && !m.is_read
                );

                return {
                    ...conv,
                    lastMessage: lastMessage ? {
                        message: lastMessage.message,
                        sender_id: lastMessage.sender_id,
                        created_at: lastMessage.created_at,
                    } : null,
                    unreadCount: unreadMessages.length,
                };
            })
        );

        res.status(200).json({
            success: true,
            conversations: enriched,
        });
    } catch (error) {
        console.error('Fetch conversations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch conversations'
        });
    }
}
