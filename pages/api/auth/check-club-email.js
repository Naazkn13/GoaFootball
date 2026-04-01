import database from '../../../services/database';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const club = await database.getClubByEmail(email.toLowerCase().trim());

        return res.status(200).json({
            success: true,
            isClub: !!club
        });
    } catch (error) {
        console.error('Check club email error:', error);
        return res.status(500).json({ success: false, message: 'Failed to check email' });
    }
}
