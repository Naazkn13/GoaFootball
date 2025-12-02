import database from '../../../services/database';
import paymentService from '../../../services/payment.service';
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
  if (req.method === 'POST') {
    try {
      // Verify authentication
      const user = verifyToken(req);

      const { amount } = req.body;

      // Validation
      if (!amount || amount <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Valid amount is required' 
        });
      }

      // Check if user already paid
      const userProfile = await database.getUserByEmail(user.email);
      if (userProfile.is_paid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Payment already completed' 
        });
      }

      // Create Razorpay order
      const receipt = `receipt_${user.footballId}_${Date.now()}`;
      const order = await paymentService.createOrder(amount, 'INR', receipt);

      // Store payment record in database
      const payment = await database.createPayment({
        user_id: user.id,
        razorpay_order_id: order.orderId,
        amount: amount,
        currency: order.currency,
        status: 'created',
      });

      // Create payment history entry
      await database.createPaymentHistory({
        user_id: user.id,
        payment_id: payment.id,
        amount: amount,
        status: 'created',
        razorpay_payment_id: null,
      });

      res.status(200).json({ 
        success: true, 
        order: {
          id: order.orderId,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
        },
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_xxxxxx',
      });
    } catch (error) {
      console.error('Create order error:', error);
      
      if (error.message === 'No token provided' || error.message === 'Invalid token') {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized' 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create payment order' 
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
