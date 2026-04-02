import database, { supabaseAdmin } from '../../../services/database';
import { requireAdmin } from '../../../services/session.service';
import emailService from '../../../services/email.service';

export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = requireAdmin(req, res);
    if (!session) return;

    try {
        const { userId, updates } = req.body;

        if (!userId || !updates) {
            return res.status(400).json({ success: false, message: 'Invalid payload' });
        }

        // Fetch original user to detect club transfer
        const { data: originalUser, error: fetchErr } = await supabaseAdmin
            .from('users')
            .select('*, clubs(*)')
            .eq('id', userId)
            .single();

        if (fetchErr || !originalUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isTransferring = originalUser.club_id && updates.club_id && originalUser.club_id !== updates.club_id;
        
        let oldClub = null;
        let newClub = null;

        if (isTransferring) {
            oldClub = originalUser.clubs; // Since we prefetched it via clubs(*)
            newClub = await database.getClubById(updates.club_id);
        } else if (originalUser.club_id) {
            oldClub = originalUser.clubs;
            newClub = originalUser.clubs;
        } else if (updates.club_id && !originalUser.club_id) {
            // Edge case: Assigning a club to someone who had none
            newClub = await database.getClubById(updates.club_id);
        }

        // Ensure we don't accidentally update restricted fields
        const safeUpdates = {
            first_name: updates.first_name,
            last_name: updates.last_name,
            name: `${updates.first_name || ''} ${updates.last_name || ''}`.trim(),
            date_of_birth: updates.date_of_birth || null,
            gender: updates.gender,
            phone: updates.phone,
            role: updates.role,
            club_id: updates.club_id || null, // Ensure empty string becomes null
            updated_at: new Date().toISOString()
        };

        const updatedUser = await database.updateUser(userId, safeUpdates);

        // Notify parties asynchronously 
        if (isTransferring && oldClub && newClub) {
            emailService.sendTransferEmail(updatedUser, oldClub, newClub).catch(console.error);
        } else {
            // Generic update email (Only send if they belong to a club currently or just got assigned)
            const currentClub = newClub || oldClub;
            if (currentClub) {
                emailService.sendUserUpdateEmail(updatedUser, currentClub).catch(console.error);
            }
        }

        return res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Update user error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update user'
        });
    }
}
