// Instamojo Webhook Handler
// Server-to-server notification — Instamojo POSTs payment data here
// This is a reliability backup: even if user closes browser, payment is recorded
import database from '../../../services/database';
import instamojoService from '../../../services/instamojo.service';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    console.log('Instamojo webhook received:', JSON.stringify(payload));

    const {
      payment_id,
      payment_request_id,
      status,
      mac,
    } = payload;

    if (!payment_id || !payment_request_id) {
      console.error('Webhook missing required fields');
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // 1. Verify webhook signature using private salt
    const isValid = instamojoService.verifyWebhookSignature(payload, mac);
    if (!isValid) {
      console.error('Webhook MAC verification failed');
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    // 2. Only process successful payments
    if (status !== 'Credit') {
      console.log('Webhook received non-credit status:', status);
      return res.status(200).json({ success: true, message: 'Non-credit status noted' });
    }

    // 3. Find payment record
    const payment = await database.getPaymentByRazorpayOrderId(payment_request_id);
    if (!payment) {
      console.error('Webhook: payment record not found for:', payment_request_id);
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    // 4. Check idempotency — skip if already processed
    if (payment.status === 'success') {
      console.log('Webhook: payment already processed');
      return res.status(200).json({ success: true, message: 'Already processed' });
    }

    // 5. Update payment
    await database.updatePayment(payment.id, {
      razorpay_payment_id: payment_id,
      status: 'success',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // 6. Mark user as paid
    await database.updateUser(payment.user_id, {
      is_paid: true,
      payment_date: new Date().toISOString(),
    });

    // 7. Create payment history
    await database.createPaymentHistory({
      user_id: payment.user_id,
      payment_id: payment.id,
      amount: payment.amount,
      status: 'success',
      razorpay_payment_id: payment_id,
    });

    console.log('✅ Webhook: payment processed for user:', payment.user_id);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Instamojo webhook error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
