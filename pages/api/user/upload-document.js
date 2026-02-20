import { IncomingForm } from 'formidable';
import { readFileSync } from 'fs';
import { requireSession } from '../../../services/session.service';
import { supabaseAdmin } from '../../../services/database';

// Disable Next.js body parser for file uploads
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = requireSession(req, res);
    if (!session) return;

    try {
        // Parse multipart form data
        const form = new IncomingForm({
            maxFileSize: 5 * 1024 * 1024, // 5MB max
            keepExtensions: true,
        });

        const { fields, files } = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                resolve({ fields, files });
            });
        });

        const file = files.file?.[0] || files.file;
        const documentType = fields.documentType?.[0] || fields.documentType || 'document';

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid file type. Allowed: JPEG, PNG, PDF',
            });
        }

        // Validate file size
        const maxSize = documentType === 'photo' ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return res.status(400).json({
                success: false,
                message: `File too large. Max size: ${maxSize / (1024 * 1024)}MB`,
            });
        }

        // Read file contents
        const fileBuffer = readFileSync(file.filepath);
        const ext = file.originalFilename?.split('.').pop() || 'jpg';
        const fileName = `${session.id}/${documentType}_${Date.now()}.${ext}`;

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabaseAdmin.storage
            .from('documents')
            .upload(fileName, fileBuffer, {
                contentType: file.mimetype,
                upsert: true,
            });

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            return res.status(500).json({
                success: false,
                message: 'Failed to upload file',
            });
        }

        // Get the file URL (using signed URL for private bucket)
        const { data: urlData } = await supabaseAdmin.storage
            .from('documents')
            .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year signed URL

        res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            url: urlData?.signedUrl || fileName,
            filename: fileName,
            path: data?.path || fileName,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'File upload failed. Please try again.',
        });
    }
}
