import database from '../../../services/database';
import { requireSuperAdmin } from '../../../services/session.service';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = requireSuperAdmin(req, res);
    if (!session) return;

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Check if user exists
        let user = await database.getUserByEmail(email);

        if (!user) {
            // Create user with admin flag
            user = await database.createUser({
                email,
                name: 'Admin',
                phone: '',
                aadhaar: '',
                is_admin: true,
                is_super_admin: false,
                registration_completed: false,
                approval_status: 'approved',
            });
        } else {
            // Update existing user to admin
            user = await database.updateUser(user.id, {
                is_admin: true,
                updated_at: new Date().toISOString(),
            });
        }

        delete user.password_hash;

        res.status(200).json({
            success: true,
            message: `${email} has been granted admin access`,
            user,
        });
    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create admin'
        });
    }
}
