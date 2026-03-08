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
            name, email, date_of_birth, gender, phone,
            role, club_id, role_details, address, documents, profile_photo_url,
        } = req.body;

        // Base Validation (Aadhaar removed)
        if (!name || !date_of_birth || !gender || !phone || !role) {
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

        // If a CLUB is registering an entity, we must create a brand new user row for them
        if (session.role === 'club') {
            if (!email) {
                return res.status(400).json({ success: false, message: 'Email address is required for new entity registrations' });
            }

            // Check if email already exists
            const existingUser = await database.getUserByEmail(email);
            if (existingUser) {
                return res.status(409).json({ success: false, message: 'An account with this email already exists' });
            }

            // Generate a dummy password since they will login via OTP
            const dummyPassword = Math.random().toString(36).slice(-8);
            const passwordHash = await bcrypt.hash(dummyPassword, 10);

            // Create new user and populate registration details immediately
            const newUser = await database.createUser({
                name: name,
                email: email,
                password_hash: passwordHash,
                phone: phone,
                aadhaar: null,
                football_id: null,
                email_verified: false,
                is_paid: false,
            });

            // Now update the newly created user with their registration payload
            const updates = {
                date_of_birth,
                gender,
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

            updatedUser = await database.updateUser(newUser.id, updates);
            delete updatedUser.password_hash;

        } else {
            // STANDARD individual user registration (they already signed up and are completing their profile)
            const updates = {
                name,
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
        }

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
