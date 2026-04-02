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

        // Look up user by email
        const user = await database.getUserByEmail(email.toLowerCase().trim());
        if (!user?.is_super_admin) { // Only super admins can use this
            return res.status(401).json({
                success: false,
                message: 'Invalid administrative privileges'
            });
        }

        // Check if user has a password set
        if (!user.password_hash) {
            return res.status(401).json({
                success: false,
                message: 'This admin account has not been set up with a password. Please use OTP login first.'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login timestamp
        await database.updateUser(user.id, { updated_at: new Date().toISOString() });

        // Clean user object for session
        const sessionUser = { ...user };
        delete sessionUser.password_hash;
        
        // Create session
        await createSession(res, sessionUser, req);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            redirectTo: '/admin',
            user: sessionUser,
        });
    } catch (error) {
        console.error('Admin login error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during login'
        });
    }
}
