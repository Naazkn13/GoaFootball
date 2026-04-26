import database from '../../../services/database';
import uuidService from '../../../services/uuid.service';
import { requireAdmin } from '../../../services/session.service';
import emailService from '../../../services/email.service';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = requireAdmin(req, res);
    if (!session) return;

    try {
        const { userId, action, reason } = req.body;

        if (!userId || !action) {
            return res.status(400).json({
                success: false,
                message: 'userId and action are required'
            });
        }

        if (!['approve', 'reject', 'hold'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Must be: approve, reject, or hold'
            });
        }

        // Require reason for reject/hold
        if ((action === 'reject' || action === 'hold') && !reason) {
            return res.status(400).json({
                success: false,
                message: 'Reason is required for rejection or hold'
            });
        }

        // Map action to status
        const statusMap = { approve: 'approved', reject: 'rejected', hold: 'on_hold' };
        const messageMap = { approve: 'approved', reject: 'rejected', hold: 'put on hold' };

        // Build update object
        const updates = {
            approval_status: statusMap[action],
            approval_reason: reason || null,
            approved_by: session.id,
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        // If approving, generate GFF football ID based on the user's role
        if (action === 'approve') {
            updates.is_paid = true;
            // Fetch the user to get their role
            const user = await database.getUserById(userId);
            if (user && user.role) {
                updates.football_id = await uuidService.generateGFFId(user.role, database);
            }
            // If no role (e.g., super admin), skip UID assignment
        }

        const updatedUser = await database.updateUser(userId, updates);

        // Update payment record statuses
        if (action === 'approve') {
            try {
                await database.client.from('payments')
                    .update({ status: 'approved' })
                    .eq('user_id', userId)
                    .eq('status', 'pending');
            } catch(e) {}
        } else if (action === 'reject') {
            try {
                await database.client.from('payments')
                    .update({ status: 'failed' })
                    .eq('user_id', userId)
                    .eq('status', 'pending');
            } catch(e) {}
        }

        // Fetch club to send notification
        let club = null;
        if (updatedUser.club_id) {
            club = await database.getClubById(updatedUser.club_id).catch(() => null);
        }
        
        // Dispatch email notification (non-blocking)
        emailService.sendStatusUpdateEmail(updatedUser, club, action, reason).catch(err => {
            console.error('Error dispatching status email:', err);
        });

        // Whitelist response fields
        const { password_hash, ...safeUser } = updatedUser;

        res.status(200).json({
            success: true,
            message: `User ${messageMap[action]} successfully`,
            user: safeUser,
        });
    } catch (error) {
        console.error('Approve action error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Action failed. Please try again.'
        });
    }
}
