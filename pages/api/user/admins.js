import database from '../../../services/database';
import { requireSession } from '../../../services/session.service';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = requireSession(req, res);
    if (!session) return;

    try {
        // Query users table for all admins or super_admins
        const { data, error } = await database.client
            .from('users')
            .select('id, name, email')
            .or('is_admin.eq.true,is_super_admin.eq.true')
            .limit(10);

        if (error) throw error;

        res.status(200).json({
            success: true,
            admins: data || [],
        });
    } catch (error) {
        console.error('Fetch admins error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admin list',
        });
    }
}
