// Public API: Fetch site content for a page
import { supabaseAdmin } from '@/services/database';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { page } = req.query;

    if (!page || !['home', 'about', 'footer'].includes(page)) {
        return res.status(400).json({ message: 'Invalid page parameter' });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('site_content')
            .select('section, content')
            .eq('page', page);

        if (error) throw error;

        // Convert array to object keyed by section
        const content = {};
        (data || []).forEach(row => {
            content[row.section] = row.content;
        });

        return res.status(200).json({ success: true, content });
    } catch (err) {
        console.error('Error fetching site content:', err);
        return res.status(500).json({ message: 'Failed to fetch content' });
    }
}
