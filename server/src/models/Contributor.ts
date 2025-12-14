import mongoose, { Schema, Document } from 'mongoose';

export enum ContributorRole {
    VIEWER = 'VIEWER',
    EDITOR = 'EDITOR',
    ADMIN = 'ADMIN'
}

export interface IContributor extends Document {
    playlistId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    role: ContributorRole;
    invitedBy: mongoose.Types.ObjectId;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ContributorSchema: Schema = new Schema({
    playlistId: {
        type: Schema.Types.ObjectId,
        ref: 'Playlist',
        required: true,
        index: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    role: {
        type: String,
        enum: Object.values(ContributorRole),
        default: ContributorRole.VIEWER,
        required: true
    },
    invitedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    }
}, { timestamps: true });

// Compound indexes
ContributorSchema.index({ playlistId: 1, userId: 1 }, { unique: true });
ContributorSchema.index({ playlistId: 1, isDeleted: 1 });
ContributorSchema.index({ userId: 1, isDeleted: 1 });

export default mongoose.model<IContributor>('Contributor', ContributorSchema);
