import database from '../../../services/database';
import { createSession } from '../../../services/session.service';

// Super admin emails
const SUPER_ADMIN_EMAILS = [
  'knuzhat137@gmail.com',
  'goafootballfestival.info@gmail.com',
];

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { email, otp } = req.body;

      // Validation
      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Email and OTP are required'
        });
      }

      // Hardcoded OTP for Razorpay verification account
      const RAZORPAY_TEST_EMAIL = 'kachreomkar8@gmail.com';
      const RAZORPAY_TEST_OTP = '1234';

      let otpRecord = null;

      // Check if this is the Razorpay test account with hardcoded OTP
      if (email.toLowerCase() === RAZORPAY_TEST_EMAIL.toLowerCase() && otp === RAZORPAY_TEST_OTP) {
        console.log('✅ Razorpay test account - using hardcoded OTP');
        otpRecord = { verified: true };
      } else {
        otpRecord = await database.verifyOTP(email, otp, 'login');
      }

      if (!otpRecord) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired OTP'
        });
      }

      // Get user details
      const user = await database.getUserByEmail(email);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update last login
      await database.updateUser(user.id, {
        last_login: new Date().toISOString(),
      });

      // Create session (access JWT + refresh token + DB record)
      await createSession(res, user, req);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          football_id: user.football_id,
          is_paid: user.is_paid,
          is_admin: user.is_admin,
          is_super_admin: user.is_super_admin,
          registration_completed: user.registration_completed,
          approval_status: user.approval_status,
        },
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred during verification'
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
