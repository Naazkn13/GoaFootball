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
        const { data, error } = await database.client
            .from('users')
            .select('id, email, name, phone, role, role_details, registration_completed, approval_status, approval_reason, date_of_birth, gender, address, documents, profile_photo_url, football_id, is_paid, created_at, updated_at, club_flag_reason, clubs(name)')
            .eq('registration_completed', true)
            .eq('approval_status', status)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json({
            success: true,
            registrations: data || [],
            count: data?.length || 0,
        });
    } catch (error) {
        console.error('Registrations fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch registrations'
        });
    }
}
