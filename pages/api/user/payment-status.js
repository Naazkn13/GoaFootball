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

      // Get user profile with payment status
      const profile = await database.getUserByEmail(user.email);

      if (!profile) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      // Get latest payment
      const payments = await database.getPaymentsByUserId(user.id);
      const latestPayment = payments.length > 0 ? payments[0] : null;

      res.status(200).json({ 
        success: true, 
        isPaid: profile.is_paid,
        footballId: profile.football_id,
        latestPayment: latestPayment ? {
          id: latestPayment.id,
          amount: latestPayment.amount,
          status: latestPayment.status,
          createdAt: latestPayment.created_at,
        } : null,
      });
    } catch (error) {
      console.error('Payment status error:', error);
      
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
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
