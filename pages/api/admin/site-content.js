// Admin API: Get/Update site content (super admin only)
import { supabaseAdmin } from '@/services/database';
import { requireSession } from '../../../services/session.service';

const SUPER_ADMIN_EMAILS = (process.env.SUPER_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

export default async function handler(req, res) {
    try {
        const session = await requireSession(req, res);
        if (!session) return;

        // Check super admin
        if (!SUPER_ADMIN_EMAILS.includes(session.email?.toLowerCase())) {
            return res.status(403).json({ message: 'Super admin access required' });
        }

        if (req.method === 'GET') {
            const { page } = req.query;
            const { data, error } = await supabaseAdmin
                .from('site_content')
                .select('*')
                .eq('page', page || 'home')
                .order('section');

            if (error) throw error;
            return res.status(200).json({ success: true, sections: data || [] });
        }

        if (req.method === 'PUT') {
            const { page, section, content } = req.body;

            if (!page || !section || !content) {
                return res.status(400).json({ message: 'page, section, and content are required' });
            }

            // Upsert: insert or update
            const { data, error } = await supabaseAdmin
                .from('site_content')
                .upsert(
                    {
                        page,
                        section,
                        content,
                        updated_at: new Date().toISOString(),
                        updated_by: session.id,
                    },
                    { onConflict: 'page,section' }
                )
                .select();

            if (error) throw error;
            return res.status(200).json({ success: true, data: data?.[0] });
        }

        return res.status(405).json({ message: 'Method not allowed' });
    } catch (err) {
        console.error('Site content admin error:', err);
        return res.status(500).json({ message: err.message || 'Server error' });
    }
}
