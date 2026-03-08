// Admin API: Upload images for site content sections
import { supabaseAdmin } from '@/services/database';
import { requireSession } from '../../../services/session.service';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const session = requireSession(req, res);
        if (!session) return;
        if (!session.is_super_admin) {
            return res.status(403).json({ message: 'Super admin access required' });
        }

        const form = formidable({ maxFileSize: 2 * 1024 * 1024 });
        const [fields, files] = await form.parse(req);

        const file = files.file?.[0];
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const section = fields.section?.[0] || 'hero';
        const ext = path.extname(file.originalFilename || '.jpg');
        const fileName = `site-images/${section}/${Date.now()}${ext}`;

        const fileBuffer = fs.readFileSync(file.filepath);

        const { error: uploadError } = await supabaseAdmin.storage
            .from('documents')
            .upload(fileName, fileBuffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (uploadError) throw uploadError;

        const { data: urlData, error: urlError } = await supabaseAdmin.storage
            .from('documents')
            .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year signed URL

        if (urlError) throw urlError;

        return res.status(200).json({
            success: true,
            url: urlData.signedUrl,
        });
    } catch (err) {
        console.error('Image upload error:', err);
        return res.status(500).json({ message: err.message || 'Upload failed' });
    }
}
