import { supabaseAdmin } from '../../../services/database';
import database from '../../../services/database';
import { requireSession } from '../../../services/session.service';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = requireSession(req, res);
    if (!session) return;

    try {
        const { partnerId } = req.query;

        if (!partnerId) {
            return res.status(400).json({
                success: false,
                message: 'partnerId is required'
            });
        }

        // Check if partnerId is a conversation ID or a user ID
        // Try to get it as a conversation first
        const conversation = await database.getConversationById(partnerId);

        let messages;

        if (conversation) {
            // partnerId is actually a conversationId
            messages = await database.getMessagesByConversation(partnerId);

            // Mark messages as read
            await database.markMessagesAsRead(partnerId, session.id);
        } else {
            // Legacy behavior: partnerId is a user ID, fetch messages by sender/receiver
            const { data, error } = await supabaseAdmin
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${session.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${session.id})`)
                .order('created_at', { ascending: true });

            if (error) throw error;
            messages = data || [];

            // Mark messages as read (legacy)
            await supabaseAdmin
                .from('messages')
                .update({ is_read: true })
                .eq('sender_id', partnerId)
                .eq('receiver_id', session.id)
                .eq('is_read', false);
        }

        res.status(200).json({
            success: true,
            messages: messages,
        });
    } catch (error) {
        console.error('Fetch messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages'
        });
    }
}
