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
        try {
          otpRecord = await database.verifyOTP(email, otp, 'login');
        } catch (error) {
          console.error('❌ verifyOTP failed:', error.message, error.code, error.details);
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
      }

      if (!otpRecord) {
        return res.status(400).json({
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
            logo_url: club.logo_url || null,
            location: club.location || null,
            is_admin: false,
            is_super_admin: false,
            registration_completed: true, // Bypass reg check
            approval_status: 'approved',
            must_change_password: club.must_change_password || false,
          };

          await database.client.from('clubs').update({ updated_at: new Date().toISOString() }).eq('id', club.id);
        } else {
          // New user — auto-create a minimal account so they can proceed to registration
          const bcrypt = require('bcryptjs');
          const dummyPassword = Math.random().toString(36).slice(-8);
          const passwordHash = await bcrypt.hash(dummyPassword, 10);

          user = await database.createUser({
            name: email.split('@')[0], // temporary name from email
            email: email,
            password_hash: passwordHash,
            phone: '0000000000',
            aadhaar: null,
            football_id: null,
            email_verified: true,
            is_paid: false,
          });
        }
      } else {
        // Block inactive users from logging in
        if (user.is_active === false) {
          return res.status(403).json({
            success: false,
            message: 'Your account has been inactivated. Please contact support at goafootballfestival.info@gmail.com'
          });
        }

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
          role: user.role || 'athlete',
          logo_url: user.logo_url || null,
          location: user.location || null,
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
