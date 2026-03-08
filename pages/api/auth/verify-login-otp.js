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
      let user = await database.getUserByEmail(email);
      let isClub = false;

      if (!user) {
        // Check if it's a club logging in
        const club = await database.getClubByEmail(email);
        if (club) {
          isClub = true;
          // Format club as a pseudo-user for the session
          user = {
            id: club.id,
            name: club.name,
            email: club.email,
            role: 'club', // important for permissions
            is_admin: false,
            is_super_admin: false,
            registration_completed: true, // Bypass reg check
            approval_status: 'approved'
          };

          await database.client.from('clubs').update({ updated_at: new Date().toISOString() }).eq('id', club.id);
        } else {
          return res.status(404).json({
            success: false,
            message: 'User/Club not found'
          });
        }
      } else {
        // Update last login
        await database.updateUser(user.id, {
          last_login: new Date().toISOString(),
        });
      }

      // Create session (access JWT + refresh token + DB record)
      await createSession(res, user, req);

      // Determine redirect path
      let redirectTo = '/profile';
      const isSuperAdminEmail = SUPER_ADMIN_EMAILS.includes(email.toLowerCase());

      if (user.is_admin || user.is_super_admin || isSuperAdminEmail) {
        redirectTo = '/admin';
      } else if (isClub) {
        redirectTo = '/club/dashboard';
      } else if (!user.registration_completed) {
      } else if (!user.registration_completed) {
        redirectTo = '/register';
      }

      res.status(200).json({
        success: true,
        message: 'Login successful',
        redirectTo,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || null,
          football_id: user.football_id || null,
          is_paid: user.is_paid || false,
          is_admin: user.is_admin || false,
          is_super_admin: user.is_super_admin || isSuperAdminEmail || false,
          registration_completed: user.registration_completed || false,
          approval_status: user.approval_status || 'approved',
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
