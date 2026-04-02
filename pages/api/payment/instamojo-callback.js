// Instamojo Callback Handler
// User is redirected here after completing payment on Instamojo's page
import database from '../../../services/database';
import instamojoService from '../../../services/instamojo.service';

export default async function handler(req, res) {
  // Instamojo redirects with GET params: payment_id, payment_request_id, payment_status
  const { payment_id, payment_request_id, payment_status } = req.query;

  console.log('Instamojo callback received:', { payment_id, payment_request_id, payment_status });

  if (!payment_id || !payment_request_id) {
    console.error('Missing payment params in Instamojo callback');
    return res.redirect('/payment-failed?reason=missing_params');
  }

  try {
    // 1. Verify payment with Instamojo API (don't trust client-side status)
    const verification = await instamojoService.verifyPayment(payment_request_id, payment_id);

    if (!verification.success) {
      console.error('Instamojo payment verification failed:', verification.status);
      return res.redirect(`/payment-failed?reason=verification_failed&status=${verification.status}`);
    }

    // 2. Find the payment record in our database
    // We stored payment_request_id in the razorpay_order_id column (reused)
    const payment = await database.getPaymentByRazorpayOrderId(payment_request_id);

    if (!payment) {
      console.error('Payment record not found for request:', payment_request_id);
      return res.redirect('/payment-failed?reason=record_not_found');
    }

    // 3. Check if already processed (idempotency)
    if (payment.status === 'success') {
      console.log('Payment already processed, redirecting to success');
      return res.redirect('/payment-success');
    }

    // 4. Update payment record
    await database.updatePayment(payment.id, {
      razorpay_payment_id: payment_id, // reuse column for instamojo payment_id
      status: 'success',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // 5. Mark user as paid
    await database.updateUser(payment.user_id, {
      is_paid: true,
      payment_date: new Date().toISOString(),
    });

    // 6. Create payment history entry
    await database.createPaymentHistory({
      user_id: payment.user_id,
      payment_id: payment.id,
      amount: payment.amount,
      status: 'success',
      razorpay_payment_id: payment_id,
    });

    console.log('✅ Instamojo payment processed successfully for user:', payment.user_id);

    // 7. Redirect to success page
    return res.redirect('/payment-success');
  } catch (error) {
    console.error('Instamojo callback error:', error);
    return res.redirect('/payment-failed?reason=server_error');
  }
}
