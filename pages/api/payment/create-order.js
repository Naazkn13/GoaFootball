import database from '../../../services/database';
import paymentService from '../../../services/payment.service';
import instamojoService from '../../../services/instamojo.service';
import { requireSession } from '../../../services/session.service';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const session = requireSession(req, res);
    if (!session) return;

    try {
      const { userId } = req.body || {};
      const targetUserId = userId || session.id;

      // Amount is hardcoded server-side — NOT sent from client
      const amount = 10; // ₹10 (TESTING ONLY — change back to 500 before going live! Minimum for Instamojo is ₹9)

      // Check if user already paid
      const userProfile = await database.getUserById(targetUserId);

      if (!userProfile) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (userProfile.is_paid) {
        return res.status(400).json({
          success: false,
          message: 'Payment already completed'
        });
      }

      const gateway = process.env.PAYMENT_GATEWAY || 'instamojo';

      // ===== INSTAMOJO FLOW =====
      if (gateway === 'instamojo') {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

        const result = await instamojoService.createPaymentRequest({
          amount,
          purpose: 'National Sports Academy Registration Fee',
          buyerName: userProfile.name || '',
          email: userProfile.email || '',
          phone: userProfile.phone || '',
          redirectUrl: `${baseUrl}/api/payment/instamojo-callback`,
          webhookUrl: `${baseUrl}/api/payment/instamojo-webhook`,
        });

        // Store payment record in database (reuse razorpay columns)
        await database.createPayment({
          user_id: targetUserId,
          razorpay_order_id: result.paymentRequestId, // reuse for instamojo request ID
          amount: amount,
          currency: 'INR',
          status: 'created',
        });

        // Create payment history entry
        await database.createPaymentHistory({
          user_id: targetUserId,
          payment_id: null,
          amount: amount,
          status: 'created',
          razorpay_payment_id: null,
        });

        return res.status(200).json({
          success: true,
          gateway: 'instamojo',
          redirectUrl: result.longUrl,
        });
      }

      // ===== RAZORPAY FLOW (backup) =====
      const shortId = (userProfile.football_id || userProfile.id).slice(-8);
      const receipt = `rcpt_${shortId}_${Date.now()}`;
      const order = await paymentService.createOrder(amount, 'INR', receipt);

      const payment = await database.createPayment({
        user_id: targetUserId,
        razorpay_order_id: order.orderId,
        amount: amount,
        currency: order.currency,
        status: 'created',
      });

      await database.createPaymentHistory({
        user_id: targetUserId,
        payment_id: payment.id,
        amount: amount,
        status: 'created',
        razorpay_payment_id: null,
      });

      res.status(200).json({
        success: true,
        gateway: 'razorpay',
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
        message: error.message || 'Failed to create payment order'
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

