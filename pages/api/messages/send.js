import { supabaseAdmin } from '../../../services/database';
import { requireSession } from '../../../services/session.service';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = requireSession(req, res);
    if (!session) return;

    try {
        const { receiverId, message } = req.body;

        if (!receiverId || !message) {
            return res.status(400).json({
                success: false,
                message: 'receiverId and message are required'
            });
        }

        const { data, error } = await supabaseAdmin
            .from('messages')
            .insert({
                sender_id: session.id,
                receiver_id: receiverId,
                message: message.trim(),
                is_read: false,
            })
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({
            success: true,
            message: data,
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message'
        });
    }
}
