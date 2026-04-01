import database from '../../../services/database';
import { createSession } from '../../../services/session.service';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Look up club by email
        const club = await database.getClubByEmail(email.toLowerCase().trim());
        if (!club) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if club has a password set
        if (!club.password_hash) {
            return res.status(401).json({
                success: false,
                message: 'This club account has not been set up with a password. Please contact the administrator.'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, club.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Format club as pseudo-user for session
        const user = {
            id: club.id,
            name: club.name,
            email: club.email,
            role: 'club',
            logo_url: club.logo_url || null,
            location: club.location || null,
            is_admin: false,
            is_super_admin: false,
            registration_completed: true,
            approval_status: 'approved',
            must_change_password: club.must_change_password || false,
        };

        // Update last login timestamp
        await database.updateClub(club.id, { updated_at: new Date().toISOString() });

        // Create session
        await createSession(res, user, req);

        // Determine redirect
        let redirectTo = '/club/dashboard';
        if (club.must_change_password) {
            redirectTo = '/club/change-password';
        }

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            redirectTo,
            user,
        });
    } catch (error) {
        console.error('Club login error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during login'
        });
    }
}
