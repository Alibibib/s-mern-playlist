import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';

let bucket: GridFSBucket;

export const initGridFS = () => {
    if (!mongoose.connection.db) {
        throw new Error('MongoDB connection not established');
    }

    bucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'songs'
    });

    console.log('✅ GridFS initialized');
    return bucket;
};

export const getGridFSBucket = (): GridFSBucket => {
    if (!bucket) {
        return initGridFS();
    }
    return bucket;
};

export const uploadFileToGridFS = (
    fileBuffer: Buffer,
    filename: string,
    metadata?: any
): Promise<ObjectId> => {
    return new Promise((resolve, reject) => {
        const bucket = getGridFSBucket();
        const uploadStream = bucket.openUploadStream(filename, {
            metadata
        });

        uploadStream.on('error', reject);
        uploadStream.on('finish', () => {
            resolve(uploadStream.id as ObjectId);
        });

        uploadStream.end(fileBuffer);
    });
};

export const downloadFileFromGridFS = (fileId: string): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const bucket = getGridFSBucket();
        const chunks: Buffer[] = [];

        const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));

        downloadStream.on('data', (chunk) => {
            chunks.push(chunk);
        });

        downloadStream.on('error', reject);

        downloadStream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
    });
};

export const deleteFileFromGridFS = async (fileId: string): Promise<void> => {
    const bucket = getGridFSBucket();
    await bucket.delete(new ObjectId(fileId));
};

export const getFileMetadata = async (fileId: string) => {
    const bucket = getGridFSBucket();
    const files = await bucket.find({ _id: new ObjectId(fileId) }).toArray();
    return files[0] || null;
};
