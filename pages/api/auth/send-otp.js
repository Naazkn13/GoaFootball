import database from '../../../services/database';
import otpService from '../../../services/otp.service';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { email, purpose } = req.body;

            if (!email || !purpose) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and purpose are required'
                });
            }

            // Always generate and send OTP regardless of whether the user exists.
            // New users will be auto-created when they verify the OTP.
            const otp = otpService.generateOTP();

            await database.storeOTP({
                email: email,
                otp: otp,
                purpose: purpose,
                expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            });

            await otpService.sendOTPEmail(email, otp, purpose);

            res.status(200).json({
                success: true,
                message: 'OTP sent successfully'
            });
        } catch (error) {
            console.error('Send OTP error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send OTP'
            });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
