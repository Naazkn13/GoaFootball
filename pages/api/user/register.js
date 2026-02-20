import database from '../../../services/database';
import { requireSession } from '../../../services/session.service';
import { createSession } from '../../../services/session.service';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = requireSession(req, res);
    if (!session) return;

    try {
        const {
            name, date_of_birth, gender, phone, aadhaar,
            role, role_details, address, documents, profile_photo_url,
        } = req.body;

        // Validation
        if (!name || !date_of_birth || !gender || !phone || !aadhaar || !role) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be filled',
            });
        }

        // Update user record with registration data
        const updates = {
            name,
            date_of_birth,
            gender,
            phone,
            aadhaar,
            role,
            role_details: role_details || {},
            address: address || {},
            documents: documents || [],
            profile_photo_url: profile_photo_url || null,
            registration_completed: true,
            approval_status: 'pending',
            updated_at: new Date().toISOString(),
        };

        const updatedUser = await database.updateUser(session.id, updates);

        // Re-create session with updated data
        createSession(res, updatedUser);

        // Remove sensitive data
        delete updatedUser.password_hash;

        res.status(200).json({
            success: true,
            message: 'Registration completed successfully',
            user: updatedUser,
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.',
        });
    }
}
