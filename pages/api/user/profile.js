import database from '../../../services/database';
import jwt from 'jsonwebtoken';

// Middleware to verify JWT token
function verifyToken(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export default async function handler(req, res) {
  try {
    // Verify authentication
    const user = verifyToken(req);

    if (req.method === 'GET') {
      // Get user profile
      const profile = await database.getUserByEmail(user.email);

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

      const updatedUser = await database.updateUser(user.id, updates);

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
    
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred' 
    });
  }
}
