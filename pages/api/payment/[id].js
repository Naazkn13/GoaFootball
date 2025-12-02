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
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      // Verify authentication
      verifyToken(req);

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Payment ID is required' 
        });
      }

      // Get payment by Razorpay order ID or payment ID
      let payment = await database.getPaymentByRazorpayOrderId(id);
      
      if (!payment) {
        // Try to find by ID
        const { data } = await database.client
          .from('payments')
          .select('*')
          .eq('id', id)
          .single();
        
        payment = data;
      }

      if (!payment) {
        return res.status(404).json({ 
          success: false, 
          message: 'Payment not found' 
        });
      }

      res.status(200).json({ 
        success: true, 
        payment: payment,
      });
    } catch (error) {
      console.error('Get payment details error:', error);
      
      if (error.message === 'No token provided' || error.message === 'Invalid token') {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized' 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch payment details' 
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
