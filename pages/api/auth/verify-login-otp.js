import database from '../../../services/database';
import jwt from 'jsonwebtoken';

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

      // Verify OTP
      const otpRecord = await database.verifyOTP(email, otp, 'login');

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

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          footballId: user.football_id 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // Update last login
      await database.updateUser(user.id, {
        last_login: new Date().toISOString(),
      });

      res.status(200).json({ 
        success: true, 
        message: 'Login successful',
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          footballId: user.football_id,
          isPaid: user.is_paid,
          isVerified: user.is_verified,
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
