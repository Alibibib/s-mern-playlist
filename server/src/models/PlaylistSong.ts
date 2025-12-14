import mongoose, { Schema, Document } from 'mongoose';

export interface IPlaylistSong extends Document {
    playlistId: mongoose.Types.ObjectId;
    songId: mongoose.Types.ObjectId;
    addedBy: mongoose.Types.ObjectId;
    order: number;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PlaylistSongSchema: Schema = new Schema({
    playlistId: {
        type: Schema.Types.ObjectId,
        ref: 'Playlist',
        required: true,
        index: true
    },
    songId: {
        type: Schema.Types.ObjectId,
        ref: 'Song',
        required: true,
        index: true
    },
    addedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    order: {
        type: Number,
        required: true,
        min: 0
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    }
}, { timestamps: true });

// Compound indexes for efficient queries
PlaylistSongSchema.index({ playlistId: 1, isDeleted: 1, order: 1 });
PlaylistSongSchema.index({ playlistId: 1, songId: 1 }, { unique: true }); // Prevent duplicate songs

export default mongoose.model<IPlaylistSong>('PlaylistSong', PlaylistSongSchema);
