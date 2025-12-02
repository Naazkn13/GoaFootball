import database from '../../../services/database';
import otpService from '../../../services/otp.service';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and password are required' 
        });
      }

      // Check if user exists
      const user = await database.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
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
        requiresOTP: true,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'An error occurred during login' 
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
