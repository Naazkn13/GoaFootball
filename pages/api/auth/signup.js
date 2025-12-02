import database from '../../../services/database';
import otpService from '../../../services/otp.service';
import uuidService from '../../../services/uuid.service';
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

      // Check if user already exists
      const existingUser = await database.getUserByEmail(email);
      
      if (existingUser) {
        return res.status(409).json({ 
          success: false, 
          message: 'User already exists with this email' 
        });
      }

      // Generate unique Football ID
      let footballId = uuidService.generateFootballID();
      let isUnique = false;
      let attempts = 0;

      // Ensure unique Football ID
      while (!isUnique && attempts < 10) {
        const existingFootballId = await database.getUserByFootballId(footballId);
        if (!existingFootballId) {
          isUnique = true;
        } else {
          footballId = uuidService.generateFootballID();
          attempts++;
        }
      }

      if (!isUnique) {
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to generate unique ID. Please try again.' 
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

      // Store user data temporarily (will be activated after OTP verification)
      // For now, create the user but mark as not verified
      await database.createUser({
        name: name,
        email: email,
        password_hash: passwordHash,
        phone: phone,
        aadhaar: aadhaar || null,
        football_id: footballId,
        email_verified: false,
        is_paid: false,
      });

      // Send OTP via email
      await otpService.sendOTPEmail(email, otp, 'signup');

      res.status(200).json({ 
        success: true, 
        message: 'Verification OTP sent to your email',
        email: email,
        footballId: footballId,
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
