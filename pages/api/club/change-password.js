import database from '../../../services/database';
import { requireSession } from '../../../services/session.service';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = requireSession(req, res);
    if (!session) return;

    if (session.role !== 'club') {
        return res.status(403).json({ success: false, message: 'This endpoint is for club accounts only' });
    }

    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from the current password'
            });
        }

        // Get the club from DB
        const club = await database.getClubByEmail(session.email);
        if (!club) {
            return res.status(404).json({ success: false, message: 'Club not found' });
        }

        // Verify current password
        if (!club.password_hash) {
            return res.status(400).json({ success: false, message: 'No password set for this club. Contact admin.' });
        }

        const isCurrentValid = await bcrypt.compare(currentPassword, club.password_hash);
        if (!isCurrentValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password and update
        const newHash = await bcrypt.hash(newPassword, 10);
        await database.updateClub(club.id, {
            password_hash: newHash,
            must_change_password: false,
            updated_at: new Date().toISOString(),
        });

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
}
