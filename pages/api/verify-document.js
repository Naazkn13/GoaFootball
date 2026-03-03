import { IncomingForm } from 'formidable';
import { readFileSync } from 'fs';
// NOTE: tesseract.js is imported dynamically below to prevent module-level crash on Vercel
import { getSession, refreshSession } from '../../services/session.service';

// Disable Next.js body parser for file uploads
export const config = {
    api: {
        bodyParser: false,
    },
};

// Keywords expected per document type
const DOCUMENT_KEYWORDS = {
    id_proof: {
        keywords: ['aadhaar', 'uid', 'pan', 'income tax', 'govt', 'government', 'india', 'unique identification', 'permanent account'],
        minTextLength: 15,
        label: 'ID Proof (Aadhaar/PAN)',
    },
    birth_certificate: {
        keywords: ['birth', 'certificate', 'born', 'registration', 'municipal', 'hospital', 'date of birth', 'father', 'mother'],
        minTextLength: 15,
        label: 'Birth Certificate',
    },
    photo: {
        keywords: [],
        minTextLength: 0,
        label: 'Passport Photo',
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Try access token first, then refresh if expired
    let session = getSession(req);
    if (!session) {
        session = await refreshSession(req, res);
    }
    if (!session) {
        return res.status(401).json({ verified: false, reason: 'Unauthorized — please log in' });
    }

    let worker = null;

    try {
        // Parse multipart form data
        const form = new IncomingForm({
            maxFileSize: 5 * 1024 * 1024,
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
                verified: false,
                reason: 'No file uploaded',
            });
        }

        // Basic file type validation
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({
                verified: false,
                reason: 'Invalid file type. Only JPEG, PNG, and PDF are allowed.',
            });
        }

        // For passport photos, just validate it's an image (no OCR needed)
        if (documentType === 'photo') {
            const imageTypes = ['image/jpeg', 'image/png'];
            if (!imageTypes.includes(file.mimetype)) {
                return res.status(400).json({
                    verified: false,
                    reason: 'Passport photo must be a JPEG or PNG image.',
                });
            }
            return res.status(200).json({
                verified: true,
                reason: 'Photo file validated successfully.',
            });
        }

        // For PDFs, we can't run OCR easily, so just validate type
        if (file.mimetype === 'application/pdf') {
            return res.status(200).json({
                verified: true,
                reason: 'PDF document accepted.',
            });
        }

        // Run OCR on the image to detect text
        const docConfig = DOCUMENT_KEYWORDS[documentType];
        if (!docConfig) {
            return res.status(400).json({
                verified: false,
                reason: `Unknown document type: ${documentType}`,
            });
        }

        // Dynamically import tesseract.js to avoid module-level crash on Vercel serverless
        let createWorker;
        try {
            const tesseract = await import('tesseract.js');
            createWorker = tesseract.createWorker;
        } catch (importErr) {
            console.warn('⚠️ tesseract.js not available — skipping OCR, accepting document for manual review');
            return res.status(200).json({
                verified: true,
                reason: 'OCR not available in this environment. Document accepted pending manual review.',
                warning: true,
            });
        }

        worker = await createWorker('eng');
        const { data: { text } } = await worker.recognize(file.filepath);
        await worker.terminate();
        worker = null;

        const detectedText = text.trim().toLowerCase();
        const textLength = detectedText.replace(/\s+/g, '').length;

        // Check 1: Is there enough text in the image?
        if (textLength < docConfig.minTextLength) {
            return res.status(400).json({
                verified: false,
                reason: `This doesn't appear to be a valid ${docConfig.label}. No readable text was detected in the uploaded image. Please upload a clear image of your ${docConfig.label}.`,
            });
        }

        // Check 2: Does the text contain expected keywords?
        const foundKeywords = docConfig.keywords.filter(kw => detectedText.includes(kw));

        if (foundKeywords.length === 0) {
            return res.status(400).json({
                verified: false,
                reason: `The uploaded image does not appear to be a valid ${docConfig.label}. Please make sure you are uploading the correct document.`,
            });
        }

        return res.status(200).json({
            verified: true,
            reason: `${docConfig.label} verified successfully.`,
            detectedKeywords: foundKeywords,
        });

    } catch (error) {
        console.error('Document verification error:', error);
        if (worker) {
            try { await worker.terminate(); } catch (e) { /* ignore */ }
        }
        // If verification fails due to an error, allow the upload but log the issue
        return res.status(200).json({
            verified: true,
            reason: 'Verification could not be completed. Document accepted pending manual review.',
            warning: true,
        });
    }
}
