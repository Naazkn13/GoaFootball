import database from '../../../services/database';
import paymentService from '../../../services/payment.service';
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Payment verification relies on Razorpay signature rather than user session,
    // which prevents 401 errors if the user's token expires during checkout.
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      } = req.body;

      // Validation
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Payment details are required'
        });
      }

      // Verify payment signature
      const isValid = paymentService.verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!isValid) {
        // Log failed verification - skip history since we don't have payment_id
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed'
        });
      }

      // Get payment record from database
      const payment = await database.getPaymentByRazorpayOrderId(razorpay_order_id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment record not found'
        });
      }

      // Update payment record
      await database.updatePayment(payment.id, {
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        status: 'success',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Update user's payment status
      await database.updateUser(payment.user_id, {
        is_paid: true,
        payment_date: new Date().toISOString(),
      });

      // Create payment history entry
      await database.createPaymentHistory({
        user_id: payment.user_id,
        payment_id: payment.id,
        amount: payment.amount,
        status: 'success',
        razorpay_payment_id: razorpay_payment_id,
      });

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        payment: {
          id: payment.id,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          amount: payment.amount,
          status: 'success',
        },
      });
    } catch (error) {
      console.error('Verify payment error:', error);

      res.status(500).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
