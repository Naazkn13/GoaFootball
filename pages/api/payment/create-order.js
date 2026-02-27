import database from '../../../services/database';
import paymentService from '../../../services/payment.service';
import { requireSession } from '../../../services/session.service';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const session = requireSession(req, res);
    if (!session) return;

    try {
      // Amount is hardcoded server-side — NOT sent from client
      const amount = 500; // ₹500

      // Check if user already paid
      const userProfile = await database.getUserByEmail(session.email);
      if (userProfile.is_paid) {
        return res.status(400).json({
          success: false,
          message: 'Payment already completed'
        });
      }

      // Create Razorpay order
      // Razorpay limits receipt to 40 chars
      const shortId = (session.football_id || session.id).slice(-8);
      const receipt = `rcpt_${shortId}_${Date.now()}`;
      const order = await paymentService.createOrder(amount, 'INR', receipt);

      // Store payment record in database
      const payment = await database.createPayment({
        user_id: session.id,
        razorpay_order_id: order.orderId,
        amount: amount,
        currency: order.currency,
        status: 'created',
      });

      // Create payment history entry
      await database.createPaymentHistory({
        user_id: session.id,
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
      res.status(500).json({
        success: false,
        message: 'Failed to create payment order'
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
