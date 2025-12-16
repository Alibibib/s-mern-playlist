import { Router, Request, Response } from 'express';
import multer from 'multer';
import { ObjectId } from 'mongodb';
import { uploadFileToGridFS, getFileMetadata, getGridFSBucket } from '@utils/gridfs';
import { getContextUser } from '@middleware/auth';

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

// Download/Stream audio file with Range support
router.get('/stream/:fileId', async (req: Request, res: Response) => {
    try {
        const { fileId } = req.params;
        const range = req.headers.range;

        // Get file metadata
        const metadata = await getFileMetadata(fileId);

        if (!metadata) {
            return res.status(404).json({ error: 'File not found' });
        }

        const fileSize = metadata.length;
        const contentType = metadata.metadata?.contentType || 'audio/mpeg';
        const bucket = getGridFSBucket();

        // No Range header — stream full file
        if (!range) {
            res.status(200);
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Length', fileSize);
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Content-Disposition', `inline; filename="${metadata.filename}"`);

            const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));
            downloadStream.on('error', (err) => {
                console.error('Stream error:', err);
                res.destroy(err);
            });
            downloadStream.pipe(res);
            return;
        }

        // Parse Range header
        const rangeMatch = /^bytes=(\d*)-(\d*)$/.exec(range);
        if (!rangeMatch) {
            res.setHeader('Content-Range', `bytes */${fileSize}`);
            return res.status(416).end();
        }

        const start = rangeMatch[1] ? parseInt(rangeMatch[1], 10) : 0;
        const end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : fileSize - 1;

        // Validate range
        if (isNaN(start) || isNaN(end) || start > end || start >= fileSize) {
            res.setHeader('Content-Range', `bytes */${fileSize}`);
            return res.status(416).end();
        }

        const chunkSize = end - start + 1;

        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Length', chunkSize);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="${metadata.filename}"`);

        const downloadStream = bucket.openDownloadStream(new ObjectId(fileId), {
            start,
            end: end + 1 // GridFS end is exclusive
        });

        downloadStream.on('error', (err) => {
            console.error('Range stream error:', err);
            res.destroy(err);
        });

        downloadStream.pipe(res);
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
