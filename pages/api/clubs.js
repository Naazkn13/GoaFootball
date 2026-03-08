import database from '../../services/database';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const clubs = await database.getClubs();
            // Only return what's necessary, not the full club details
            const safeClubs = clubs.map(c => ({
                id: c.id,
                name: c.name,
            }));
            return res.status(200).json({ success: true, clubs: safeClubs });
        } catch (error) {
            console.error('Error fetching clubs for registration:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch clubs' });
        }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
}
