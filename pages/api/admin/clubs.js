import database from '../../../services/database';
import { requireSuperAdmin } from '../../../services/session.service';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    // Only super admins can manage clubs globally
    const session = requireSuperAdmin(req, res);
    if (!session) return;

    if (req.method === 'GET') {
        try {
            const clubs = await database.getClubs();
            // Enrich each club with active player count
            const enrichedClubs = await Promise.all(clubs.map(async (club) => {
                const activeCount = await database.getActivePlayerCountByClub(club.id);
                return { ...club, active_player_count: activeCount };
            }));
            return res.status(200).json({ success: true, clubs: enrichedClubs });
        } catch (error) {
            console.error('Error fetching clubs:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch clubs' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { name, email, location, logo_url, password } = req.body;

            if (!name || !email || !location || !password) {
                return res.status(400).json({ success: false, message: 'Name, email, location, and password are required' });
            }

            if (password.length < 6) {
                return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
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

            const password_hash = await bcrypt.hash(password, 10);

            const newClub = await database.createClub({
                name,
                email,
                location,
                logo_url: logo_url || null,
                password_hash,
                must_change_password: true,
            });

            return res.status(201).json({ success: true, club: newClub });
        } catch (error) {
            console.error('Error creating club:', error);
            return res.status(500).json({ success: false, message: 'Failed to create club' });
        }
    }

    if (req.method === 'PUT') {
        try {
            const { id, name, email, location, logo_url } = req.body;

            if (!id || !name || !email || !location) {
                return res.status(400).json({ success: false, message: 'ID, name, email, and location are required' });
            }

            // Check if email collides
            const existingClub = await database.getClubByEmail(email);
            if (existingClub && existingClub.id !== id) {
                return res.status(400).json({ success: false, message: 'Another club with this email already exists' });
            }

            const existingUser = await database.getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'This email is already registered to a user' });
            }

            const updates = { name, email, location };
            if (logo_url !== undefined) {
                updates.logo_url = logo_url || null; // allow empty strings to null out
            }

            const updatedClub = await database.updateClub(id, updates);

            return res.status(200).json({ success: true, club: updatedClub });
        } catch (error) {
            console.error('Error updating club:', error);
            return res.status(500).json({ success: false, message: 'Failed to update club' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({ success: false, message: 'Club ID is required' });
            }

            const club = await database.getClubById(id);
            if (!club) {
                return res.status(404).json({ success: false, message: 'Club not found' });
            }

            // GUARD: Cannot delete club if it still has active players
            const activeCount = await database.getActivePlayerCountByClub(id);
            if (activeCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot delete club "${club.name}". It still has ${activeCount} active player(s). Please inactivate all players first.`
                });
            }

            await database.deleteClub(id);

            return res.status(200).json({ success: true, message: `Club "${club.name}" deleted successfully` });
        } catch (error) {
            console.error('Error deleting club:', error);
            return res.status(500).json({ success: false, message: 'Failed to delete club' });
        }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
}
