import { supabaseAdmin } from '../../../services/database';
import { requireSession } from '../../../services/session.service';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = requireSession(req, res);
    if (!session) return;

    try {
        // Count unread messages for the current user
        const { count, error } = await supabaseAdmin
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', session.id)
            .eq('is_read', false);

        if (error) throw error;

        res.status(200).json({
            success: true,
            unreadCount: count || 0,
        });
    } catch (error) {
        console.error('Unread count error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get unread count'
        });
    }
}
