import database from '../../../services/database';
import { requireSession } from '../../../services/session.service';

export default async function handler(req, res) {
  // Verify session via cookie
  const session = requireSession(req, res);
  if (!session) return; // 401 already sent

  try {
    if (req.method === 'GET') {
      let safeProfile;

      if (session.role === 'club') {
        const club = await database.getClubByEmail(session.email);
        if (!club) {
          return res.status(404).json({ success: false, message: 'Club not found' });
        }

        safeProfile = {
          id: club.id,
          email: club.email,
          name: club.name,
          location: club.location,
          logo_url: club.logo_url,
          role: 'club',
          is_admin: false,
          is_super_admin: false,
          registration_completed: true,
          approval_status: 'approved',
          must_change_password: club.must_change_password || false,
        };
      } else {
        // Get user profile
        const profile = await database.getUserByEmail(session.email);

        if (!profile) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        // Whitelist response fields — never send raw DB objects to client
        safeProfile = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          phone: profile.phone,
          aadhaar: profile.aadhaar,
          role: profile.role,
          role_details: profile.role_details,
          date_of_birth: profile.date_of_birth,
          gender: profile.gender,
          address: profile.address,
          documents: profile.documents,
          profile_photo_url: profile.profile_photo_url,
          football_id: profile.football_id,
          registration_completed: profile.registration_completed,
          approval_status: profile.approval_status,
          approval_reason: profile.approval_reason,
          is_admin: profile.is_admin,
          is_super_admin: profile.is_super_admin,
          is_paid: profile.is_paid,
          email_verified: profile.email_verified,
          created_at: profile.created_at,
        };
      }

      res.status(200).json({
        success: true,
        user: safeProfile,
      });
    } else if (req.method === 'PUT') {
      // Update user profile or upload new document to fix rejected status
      const { name, phone, aadhaar, newDocument } = req.body;

      // Input validation
      const updates = {};

      // Auto-Pending feature: Any user edit resets status back to pending
      updates.approval_status = 'pending';
      updates.approval_reason = null;

      if (name) {
        if (typeof name !== 'string' || name.length < 2 || name.length > 100) {
          return res.status(400).json({ success: false, message: 'Name must be 2-100 characters' });
        }
        updates.name = name.trim();
      }
      if (phone) {
        if (!/^[0-9]{10}$/.test(phone)) {
          return res.status(400).json({ success: false, message: 'Phone must be a valid 10-digit number' });
        }
        updates.phone = phone;
      }
      if (aadhaar) {
        if (!/^[2-9][0-9]{11}$/.test(aadhaar)) {
          return res.status(400).json({ success: false, message: 'Aadhaar must be a valid 12-digit number' });
        }
        updates.aadhaar = aadhaar;
      }

      if (newDocument) {
        // Get current user to append document
        const currentUser = await database.getUserByEmail(session.email);
        if (!currentUser) return res.status(404).json({ success: false, message: 'User not found' });

        const currentDocuments = currentUser.documents || [];
        updates.documents = [...currentDocuments, newDocument];
      }

      updates.updated_at = new Date().toISOString();

      const updatedUser = await database.updateUser(session.id, updates);

      // Whitelist response fields
      const { password_hash, ...safeUser } = updatedUser;

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: safeUser,
      });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Profile API error:', error.message);
    res.status(500).json({
      success: false,
      message: 'An error occurred'
    });
  }
}
