import database from '../../../services/database';
import { requireAdmin } from '../../../services/session.service';

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = requireAdmin(req, res);
    if (!session) return;

    if (!session.is_super_admin) {
        return res.status(403).json({ success: false, message: 'Forbidden: Super Admin access only' });
    }

    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        // Prevent self-deletion if desired (optional but good practice)
        if (id === session.id) {
            return res.status(400).json({ success: false, message: 'You cannot delete yourself' });
        }

        // Fetch user to check if they are a super admin
        const targetUser = await database.getUserById(id);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (targetUser.is_super_admin) {
            return res.status(403).json({ success: false, message: 'Forbidden: Cannot delete another Super Admin' });
        }

        await database.deleteUser(id);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
}
