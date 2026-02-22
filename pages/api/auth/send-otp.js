import database from '../../../services/database';
import otpService from '../../../services/otp.service';

// Super admin emails — these users get is_super_admin: true automatically
const SUPER_ADMIN_EMAILS = [
    'knuzhat137@gmail.com',
    'goafootballfestival.info@gmail.com',
];

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

        // Validation
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Check if user exists
        let user = await database.getUserByEmail(email);
        let isNewUser = false;

        const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email.toLowerCase());

        // If user doesn't exist, create a minimal record
        if (!user) {
            isNewUser = true;
            user = await database.createUser({
                email: email,
                name: '',
                phone: '',
                aadhaar: '',
                registration_completed: false,
                approval_status: isSuperAdmin ? 'approved' : 'pending',
                is_admin: isSuperAdmin,
                is_super_admin: isSuperAdmin,
            });
        } else {
            isNewUser = !user.registration_completed;
        }

        // Generate OTP
        const otp = otpService.generateOTP();

        // Store OTP in database
        await database.storeOTP({
            email: email,
            otp: otp,
            purpose: 'login',
            expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            is_verified: false,
            attempts: 0,
        });

        // Send OTP via email
        await otpService.sendOTPEmail(email, otp, 'login');

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email',
            email: email,
            isNewUser: isNewUser,
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP. Please try again.'
        });
    }
}
