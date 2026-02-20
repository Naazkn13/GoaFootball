import database from '../../../services/database';
import { requireSession } from '../../../services/session.service';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const session = requireSession(req, res);
    if (!session) return;

    try {
      // Get user profile with payment status
      const profile = await database.getUserByEmail(session.email);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get latest payment
      const payments = await database.getPaymentsByUserId(session.id);
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
      res.status(500).json({
        success: false,
        message: 'An error occurred'
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
