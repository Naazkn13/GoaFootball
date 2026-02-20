import database from '../../../services/database';
import { requireSession } from '../../../services/session.service';

export default async function handler(req, res) {
  // Verify session via cookie
  const session = requireSession(req, res);
  if (!session) return; // 401 already sent

  try {
    if (req.method === 'GET') {
      // Get user profile
      const profile = await database.getUserByEmail(session.email);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Remove sensitive data
      delete profile.password_hash;

      res.status(200).json({
        success: true,
        user: profile,
      });
    } else if (req.method === 'PUT') {
      // Update user profile
      const { name, phone, aadhaar } = req.body;

      const updates = {};
      if (name) updates.name = name;
      if (phone) updates.phone = phone;
      if (aadhaar) updates.aadhaar = aadhaar;
      updates.updated_at = new Date().toISOString();

      const updatedUser = await database.updateUser(session.id, updates);

      // Remove sensitive data
      delete updatedUser.password_hash;

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Profile API error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred'
    });
  }
}
