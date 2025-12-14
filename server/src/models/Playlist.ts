import mongoose, { Schema, Document } from 'mongoose';

export interface IPlaylist extends Document {
    title: string;
    description: string;
    ownerId: mongoose.Types.ObjectId;
    isPublic: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PlaylistSchema: Schema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ''
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    isPublic: {
        type: Boolean,
        default: true,
        index: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    }
}, { timestamps: true });

// Compound index for efficient queries
PlaylistSchema.index({ ownerId: 1, isDeleted: 1 });
PlaylistSchema.index({ isPublic: 1, isDeleted: 1 });

export default mongoose.model<IPlaylist>('Playlist', PlaylistSchema);
