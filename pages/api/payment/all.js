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
  if (req.method === 'GET') {
    try {
      // Verify authentication
      const user = verifyToken(req);

      // Get all payments for user
      const payments = await database.getPaymentsByUserId(user.id);

      res.status(200).json({ 
        success: true, 
        payments: payments,
        total: payments.length,
      });
    } catch (error) {
      console.error('Get payments error:', error);
      
      if (error.message === 'No token provided' || error.message === 'Invalid token') {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized' 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch payments' 
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
