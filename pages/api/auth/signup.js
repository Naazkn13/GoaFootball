import database from '../../../services/database';
import otpService from '../../../services/otp.service';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { name, email, password, phone, aadhaar } = req.body;

      // Validation
      if (!name || !email || !password || !phone) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      // Phone validation
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number'
        });
      }

      // Aadhaar validation
      if (aadhaar) {
        const aadhaarDigits = aadhaar.replace(/\D/g, ''); // Remove hyphens and non-digits

        // Must be exactly 12 digits
        if (aadhaarDigits.length !== 12) {
          return res.status(400).json({
            success: false,
            message: 'Aadhaar must be exactly 12 digits'
          });
        }

        // First digit must be 2-9 (per UIDAI standards)
        if (!/^[2-9]{1}[0-9]{11}$/.test(aadhaarDigits)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid Aadhaar number format'
          });
        }
      }

      // Check if user already exists
      const existingUser = await database.getUserByEmail(email);

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Generate OTP
      const otp = otpService.generateOTP();

      // Store OTP in database
      await database.storeOTP({
        email: email,
        otp: otp,
        purpose: 'signup',
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      });

      // Store user data — football_id is null at signup, assigned on admin approval
      const cleanAadhaar = aadhaar ? aadhaar.replace(/\D/g, '') : null;

      await database.createUser({
        name: name,
        email: email,
        password_hash: passwordHash,
        phone: phone,
        aadhaar: cleanAadhaar,
        football_id: null,
        email_verified: false,
        is_paid: false,
      });

      // Send OTP via email
      await otpService.sendOTPEmail(email, otp, 'signup');

      res.status(200).json({
        success: true,
        message: 'Verification OTP sent to your email',
        email: email,
        requiresOTP: true,
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred during signup'
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

