import { supabaseAdmin } from '../../../services/database';
import { requireAdmin } from '../../../services/session.service';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = requireAdmin(req, res);
    if (!session) return;

    try {
        const { search, role, status } = req.query;

        let query = supabaseAdmin
            .from('users')
            .select('id, email, name, phone, role, registration_completed, approval_status, football_id, is_paid, is_admin, is_super_admin, created_at, profile_photo_url, club_flag_reason, clubs(name)')
            .order('created_at', { ascending: false });

        // Apply filters
        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,football_id.ilike.%${search}%`);
        }
        if (role) {
            query = query.eq('role', role);
        }
        if (status) {
            query = query.eq('approval_status', status);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.status(200).json({
            success: true,
            users: data || [],
            count: data?.length || 0,
        });
    } catch (error) {
        console.error('Users fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
}
