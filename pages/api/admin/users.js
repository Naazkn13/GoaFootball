import { supabaseAdmin } from '../../../services/database';
import { requireAdmin } from '../../../services/session.service';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = requireAdmin(req, res);
    if (!session) return;

    try {
        const { search, role, status, inactive } = req.query;

        let query = supabaseAdmin
            .from('users')
            .select('id, email, name, phone, role, registration_completed, approval_status, football_id, is_paid, is_admin, is_super_admin, is_active, created_at, profile_photo_url, club_flag_reason, clubs(name)')
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
            if (status === 'approved') {
                query = query.eq('is_active', true);
            }
        }
        if (inactive === 'true') {
            query = query.eq('is_active', false);
        }

        const { data, error } = await query;

        if (error) throw error;

        const filteredUsers = (data || []).filter(u => 
            !((u.is_admin || u.is_super_admin) && (!u.role || u.role.trim() === ''))
        );

        res.status(200).json({
            success: true,
            users: filteredUsers,
            count: filteredUsers.length,
        });
    } catch (error) {
        console.error('Users fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
}
