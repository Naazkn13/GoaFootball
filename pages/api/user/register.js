import database from '../../../services/database';
import { requireSession } from '../../../services/session.service';
import { createSession } from '../../../services/session.service';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = requireSession(req, res);
    if (!session) return;

    try {
        const {
            name, first_name, middle_name, last_name,
            email, date_of_birth, gender, phone,
            role, club_id, role_details, address, documents, profile_photo_url,
        } = req.body;

        // Build combined name from parts (backward compatibility)
        const fullName = name || [first_name, middle_name, last_name].filter(Boolean).join(' ');

        // Base Validation
        if ((!name && !first_name) || !date_of_birth || !gender || !phone || !role) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be filled',
            });
        }

        // Require club_id for athletes, coaches, and managers
        if (['athlete', 'coach', 'manager'].includes(role) && !club_id) {
            return res.status(400).json({ success: false, message: 'Club selection is mandatory' });
        }

        let updatedUser;

        // If a CLUB is trying to register an entity, block it
        if (session.role === 'club') {
            return res.status(403).json({
                success: false,
                message: 'Clubs are no longer permitted to add entities. Please contact the administrator.'
            });
        }

        // STANDARD individual user registration (they already signed up and are completing their profile)
        const updates = {
            name: fullName,
            first_name: first_name || '',
            middle_name: middle_name || '',
            last_name: last_name || '',
            date_of_birth,
            gender,
            phone,
            role,
            club_id: club_id || null,
            role_details: role_details || {},
            address: address || {},
            documents: documents || [],
            profile_photo_url: profile_photo_url || null,
            registration_completed: true,
            approval_status: 'pending',
            updated_at: new Date().toISOString(),
        };

        updatedUser = await database.updateUser(session.id, updates);

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
