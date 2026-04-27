import database from '../../../services/database';
import { requireSession } from '../../../services/session.service';
import emailService from '../../../services/email.service';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Authenticate user
        const session = requireSession(req, res);
        if (!session) return;

        const userId = session.id;
        const { payment_proof_url } = req.body;

        if (!payment_proof_url) {
            return res.status(400).json({
                success: false,
                message: 'Payment screenshot is required'
            });
        }

        let upi_transaction_id = null;
        try {
            const { createWorker } = require('tesseract.js');
            const os = require('os');
            const worker = await createWorker('eng', 1, {
                cachePath: os.tmpdir(), // Use /tmp for Vercel read-only filesystem
                logger: m => {} // suppress logs
            });
            const { data: { text } } = await worker.recognize(payment_proof_url);
            await worker.terminate();
            
            // Try to find a 12 digit UPI transaction ID
            const match = text.match(/\b\d{12}\b/);
            if (match) {
                upi_transaction_id = match[0];
            }
        } catch (ocrErr) {
            console.error('OCR failed:', ocrErr);
        }

        // Check if this user already has an active or pending payment
        // We'll trust the UPI id constraint to avoid duplicates from different users.
        try {
           await database.createPayment({
              user_id: userId,
              upi_transaction_id, // can be null if extraction failed
              payment_proof_url,
              amount: 100, // Or whatever format, we'll just put 100 representing INR 1.00 since we're testing with 1 Rs ok
              currency: 'INR',
              status: 'pending' // important: pending status wait for admin
           });
        } catch(error) {
           if (error.code === '23505') { // postgres unique violation
               return res.status(400).json({
                   success: false,
                   message: 'This UPI Transaction ID has already been submitted.'
               });
            }
            throw error;
        }

        // After record creates reliably, ensure the user record indicates we don't need them to pay again
        // Actually we just wait for admin. The client checks if there's a payment record with status 'pending'.

        // Fetch user data for email
        const user = await database.getUserById(userId);

        // Send a waiting email
        try {
            await emailService.sendGenericEmail(
                user.email,
                'Payment Submitted - Verification Pending',
                `Hi ${user?.name || 'User'},\n\nWe have received your payment screenshot.\nOur team is verifying the payment and will allocate your GFF Football ID shortly.\n\nThank you!`
            );
        } catch (emailErr) {
            console.error('Failed to send pending payment email:', emailErr);
        }

        res.status(200).json({
            success: true,
            message: 'Payment details submitted successfully. Awaiting verification.'
        });

    } catch (error) {
        console.error('Manual payment submit error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit payment details. Please try again.'
        });
    }
}
