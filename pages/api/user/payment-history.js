import database from '../../../services/database';
import { requireSession } from '../../../services/session.service';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const session = requireSession(req, res);
    if (!session) return;

    try {
      const payments = await database.getPaymentHistory(session.id);

      res.status(200).json({
        success: true,
        payments: payments,
        total: payments.length,
      });
    } catch (error) {
      console.error('Payment history error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred'
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
