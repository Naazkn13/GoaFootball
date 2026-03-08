import database from '../../../services/database';
import { requireSuperAdmin } from '../../../services/session.service';

export default async function handler(req, res) {
    // Only super admins can manage clubs globally
    const session = requireSuperAdmin(req, res);
    if (!session) return;

    if (req.method === 'GET') {
        try {
            const clubs = await database.getClubs();
            return res.status(200).json({ success: true, clubs });
        } catch (error) {
            console.error('Error fetching clubs:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch clubs' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { name, email, location, logo_url } = req.body;

            if (!name || !email || !location) {
                return res.status(400).json({ success: false, message: 'Name, email, and location are required' });
            }

            // Check if email is already taken in users or clubs
            const existingClub = await database.getClubByEmail(email);
            if (existingClub) {
                return res.status(400).json({ success: false, message: 'A club with this email already exists' });
            }

            const existingUser = await database.getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'This email is already registered to a user' });
            }

            const newClub = await database.createClub({
                name,
                email,
                location,
                logo_url: logo_url || null,
            });

            return res.status(201).json({ success: true, club: newClub });
        } catch (error) {
            console.error('Error creating club:', error);
            return res.status(500).json({ success: false, message: 'Failed to create club' });
        }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
}
