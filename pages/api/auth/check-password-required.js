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

        const normalizedEmail = email.toLowerCase().trim();

        // 1. Check if it's a club
        const club = await database.getClubByEmail(normalizedEmail);
        if (club) {
            return res.status(200).json({
                success: true,
                requiresPassword: true,
                userType: 'club'
            });
        }

        // 2. Check if it's a superadmin with a password
        const user = await database.getUserByEmail(normalizedEmail);
        if (user?.is_super_admin) {
            if (user.password_hash) {
                // Superadmin has set up their password, force password login
                return res.status(200).json({
                    success: true,
                    requiresPassword: true,
                    userType: 'superadmin'
                });
            } else {
                // Superadmin hasn't set password yet, fallback to OTP
                return res.status(200).json({
                    success: true,
                    requiresPassword: false,
                    userType: 'superadmin_otp'
                });
            }
        }

        // 3. Regular user (OTP login)
        return res.status(200).json({
            success: true,
            requiresPassword: false,
            userType: 'regular'
        });

    } catch (error) {
        console.error('Check password required error:', error);
        return res.status(500).json({ success: false, message: 'Failed to check email' });
    }
}
