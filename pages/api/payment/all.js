import database from '../../../services/database';
import { requireSession } from '../../../services/session.service';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Verify authentication
    const user = requireSession(req, res);
    if (!user) return;

    try {
      // Get all payments for user
      const payments = await database.getPaymentsByUserId(user.id);

      res.status(200).json({
        success: true,
        payments: payments,
        total: payments.length,
      });
    } catch (error) {
      console.error('Get payments error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to fetch payments'
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
