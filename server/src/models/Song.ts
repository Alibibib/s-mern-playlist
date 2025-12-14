import mongoose, { Schema, Document } from 'mongoose';

export interface ISong extends Document {
    title: string;
    artist: string;
    duration: number; // in seconds
    fileId: mongoose.Types.ObjectId; // GridFS file reference
    uploadedBy: mongoose.Types.ObjectId;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SongSchema: Schema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 200
    },
    artist: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    duration: {
        type: Number,
        required: true,
        min: 1,
        max: 7200 // max 2 hours
    },
    fileId: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true
    },
    uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    }
}, { timestamps: true });

// Index for efficient queries
SongSchema.index({ uploadedBy: 1, isDeleted: 1 });
SongSchema.index({ title: 'text', artist: 'text' }); // Text search

export default mongoose.model<ISong>('Song', SongSchema);
