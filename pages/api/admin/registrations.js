import database from '../../../services/database';
import { requireAdmin } from '../../../services/session.service';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = requireAdmin(req, res);
    if (!session) return;

    try {
        const { status = 'pending' } = req.query;

        // Fetch registrations by approval status
        let query = database.client
            .from('users')
            .select('id, email, name, phone, role, role_details, registration_completed, approval_status, approval_reason, date_of_birth, gender, address, documents, profile_photo_url, football_id, is_paid, created_at, updated_at, club_flag_reason, clubs(name)')
            .eq('registration_completed', true)
            .order('created_at', { ascending: false });

        if (status === 'inactive') {
            query = query.eq('is_active', false);
        } else {
            query = query.eq('approval_status', status);
            if (status === 'approved') {
                query = query.eq('is_active', true);
            }
        }

        const { data, error } = await query;

        if (error) throw error;

        const filteredRegistrations = (data || []).filter(u => 
            !((u.is_admin || u.is_super_admin) && (!u.role || u.role.trim() === ''))
        );

        res.status(200).json({
            success: true,
            registrations: filteredRegistrations,
            count: filteredRegistrations.length,
        });
    } catch (error) {
        console.error('Registrations fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch registrations'
        });
    }
}
