import database from '../../../services/database';
import { createSession } from '../../../services/session.service';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { email, otp } = req.body;

        // Validation
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        // Verify OTP in database
        let otpRecord;
        try {
            otpRecord = await database.verifyOTP(email, otp, 'login');
        } catch (error) {
            // Increment failed attempts
            try {
                await database.incrementOTPAttempts(email, 'login');
            } catch (e) {
                // Ignore increment errors
            }
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Get user
        const user = await database.getUserByEmail(email);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        // Mark email as verified
        await database.updateUser(user.id, {
            email_verified: true,
            updated_at: new Date().toISOString(),
        });

        // Create session (access JWT + refresh token + DB record)
        await createSession(res, user, req);

        // Determine redirect based on user type
        let redirectTo = '/register'; // default: new user
        if (user.is_admin) {
            redirectTo = '/admin';
        } else if (user.registration_completed) {
            redirectTo = '/profile';
        }

        const isNewUser = !user.registration_completed && !user.is_admin;

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                football_id: user.football_id,
                role: user.role,
                is_admin: user.is_admin,
                is_super_admin: user.is_super_admin,
                registration_completed: user.registration_completed,
                approval_status: user.approval_status,
            },
            isNewUser: isNewUser,
            redirectTo: redirectTo,
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'OTP verification failed. Please try again.'
        });
    }
}
