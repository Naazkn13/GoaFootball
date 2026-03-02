import database from '../../../services/database';
import crypto from 'crypto';
import { requireAdmin } from '../../../services/session.service';

// Generate football UID — must fit varchar(20) column
function generateFootballId() {
    const prefix = 'FT';
    const timestamp = Date.now().toString(36).slice(-6).toUpperCase();
    const random = crypto.randomInt(1000, 10000).toString();
    return `${prefix}-${timestamp}-${random}`;
}

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

        // If approving, generate football ID
        if (action === 'approve') {
            updates.football_id = generateFootballId();
        }

        const updatedUser = await database.updateUser(userId, updates);

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
