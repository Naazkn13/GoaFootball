import database from '../../../services/database';
import otpService from '../../../services/otp.service';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { email, purpose } = req.body;

      // Validation
      if (!email || !purpose) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and purpose are required' 
        });
      }

      // Check if user exists for login purpose
      if (purpose === 'login') {
        const user = await database.getUserByEmail(email);
        if (!user) {
          return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
          });
        }
      }

      // Generate new OTP
      const otp = otpService.generateOTP();

      // Store OTP in database
      await database.storeOTP({
        email: email,
        otp: otp,
        purpose: purpose,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        is_verified: false,
        attempts: 0,
      });

      // Send OTP via email
      await otpService.sendOTPEmail(email, otp, purpose);

      res.status(200).json({ 
        success: true, 
        message: 'OTP resent successfully',
      });
    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to resend OTP' 
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
