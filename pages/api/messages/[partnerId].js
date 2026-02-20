import { supabaseAdmin } from '../../../services/database';
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

        // Fetch all messages between current user and partner
        const { data, error } = await supabaseAdmin
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${session.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${session.id})`)
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Mark messages as read
        await supabaseAdmin
            .from('messages')
            .update({ is_read: true })
            .eq('sender_id', partnerId)
            .eq('receiver_id', session.id)
            .eq('is_read', false);

        res.status(200).json({
            success: true,
            messages: data || [],
        });
    } catch (error) {
        console.error('Fetch messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages'
        });
    }
}
