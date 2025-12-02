import database from '../../../services/database';

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
      const otpRecord = await database.verifyOTP(email, otp, 'signup');

      if (!otpRecord) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid or expired OTP' 
        });
      }

      // Update user as verified
      const user = await database.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      await database.updateUser(user.id, {
        email_verified: true,
      });

      res.status(200).json({ 
        success: true, 
        message: 'Email verified successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          footballId: user.football_id,
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
