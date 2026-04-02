import database from '../../../services/database';
import { requireSuperAdmin } from '../../../services/session.service';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = requireSuperAdmin(req, res);
    if (!session) return;

    try {
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(newPassword, salt);

        // Update the user's password
        await database.updateUser(session.id, {
            password_hash,
            updated_at: new Date().toISOString()
        });

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Set superadmin password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update password'
        });
    }
}
