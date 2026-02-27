import database from '../../../services/database';
import { requireSession } from '../../../services/session.service';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const user = requireSession(req, res);
    if (!user) return;

    try {

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

      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment details'
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
