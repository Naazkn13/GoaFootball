import database from '../../../services/database';
import { requireSuperAdmin } from '../../../services/session.service';

export default async function handler(req, res) {
    const session = requireSuperAdmin(req, res);
    if (!session) return;

    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { userId, is_active } = req.body;

        if (!userId || typeof is_active !== 'boolean') {
            return res.status(400).json({ success: false, message: 'userId and is_active (boolean) are required' });
        }

        const targetUser = await database.getUserById(userId);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Don't allow inactivating admins
        if (targetUser.is_admin || targetUser.is_super_admin) {
            return res.status(403).json({ success: false, message: 'Cannot change status of admin accounts' });
        }

        const updated = await database.updateUser(userId, {
            is_active,
            updated_at: new Date().toISOString()
        });

        return res.status(200).json({
            success: true,
            message: `User ${is_active ? 'activated' : 'inactivated'} successfully`,
            user: updated
        });
    } catch (error) {
        console.error('Error toggling player status:', error);
        return res.status(500).json({ success: false, message: 'Failed to update player status' });
    }
}
