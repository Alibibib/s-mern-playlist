import { Router, Request, Response } from 'express';
import multer from 'multer';
import { uploadFileToGridFS, downloadFileFromGridFS, getFileMetadata } from '../utils/gridfs';
import { getContextUser } from '../middleware/auth';

const router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max file size
    },
    fileFilter: (req, file, cb) => {
        // Accept only audio files
        const allowedMimes = [
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/ogg',
            'audio/flac',
            'audio/aac',
            'audio/m4a'
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only audio files are allowed.'));
        }
    }
});

// Upload audio file
router.post('/upload', upload.single('audio'), async (req: Request, res: Response) => {
    try {
        // Check authentication
        const user = getContextUser(req);
        if (!user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { title, artist, duration } = req.body;

        if (!title || !artist || !duration) {
            return res.status(400).json({
                error: 'Missing required fields: title, artist, duration'
            });
        }

        // Upload to GridFS
        const fileId = await uploadFileToGridFS(
            req.file.buffer,
            req.file.originalname,
            {
                contentType: req.file.mimetype,
                uploadedBy: user.id,
                title,
                artist,
                uploadedAt: new Date()
            }
        );

        res.status(200).json({
            success: true,
            fileId: fileId.toString(),
            filename: req.file.originalname,
            size: req.file.size,
            message: 'File uploaded successfully'
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            error: 'Failed to upload file',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Download/Stream audio file
router.get('/stream/:fileId', async (req: Request, res: Response) => {
    try {
        const { fileId } = req.params;

        // Get file metadata
        const metadata = await getFileMetadata(fileId);

        if (!metadata) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Download file
        const fileBuffer = await downloadFileFromGridFS(fileId);

        // Set headers for audio streaming
        res.setHeader('Content-Type', metadata.metadata?.contentType || 'audio/mpeg');
        res.setHeader('Content-Length', fileBuffer.length);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Disposition', `inline; filename="${metadata.filename}"`);

        res.send(fileBuffer);
    } catch (error) {
        console.error('Stream error:', error);
        res.status(500).json({
            error: 'Failed to stream file',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Get file metadata
router.get('/metadata/:fileId', async (req: Request, res: Response) => {
    try {
        const { fileId } = req.params;
        const metadata = await getFileMetadata(fileId);

        if (!metadata) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.status(200).json({
            fileId: metadata._id.toString(),
            filename: metadata.filename,
            length: metadata.length,
            uploadDate: metadata.uploadDate,
            metadata: metadata.metadata
        });
    } catch (error) {
        console.error('Metadata error:', error);
        res.status(500).json({
            error: 'Failed to get metadata',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;
