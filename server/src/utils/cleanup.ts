import Song from '../models/Song';
import PlaylistSong from '../models/PlaylistSong';
import { deleteFileFromGridFS } from './gridfs';

export interface CleanupResult {
    songsDeleted: number;
    filesDeleted: number;
    errors: string[];
}

/**
 * Deletes soft-deleted songs older than the specified number of days.
 * Also removes related PlaylistSong entries and files from GridFS.
 */
export const cleanupOldDeletedSongs = async (daysOld: number = 30): Promise<CleanupResult> => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result: CleanupResult = {
        songsDeleted: 0,
        filesDeleted: 0,
        errors: []
    };

    const oldDeletedSongs = await Song.find({
        isDeleted: true,
        deletedAt: { $lt: cutoffDate }
    });

    console.log(`🧹 Found ${oldDeletedSongs.length} soft-deleted songs older than ${daysOld} days`);

    for (const song of oldDeletedSongs) {
        try {
            try {
                await deleteFileFromGridFS(song.fileId.toString());
                result.filesDeleted++;
            } catch (error) {
                result.errors.push(`Failed to delete file ${song.fileId}: ${error}`);
            }

            await PlaylistSong.deleteMany({ songId: song._id });
            await Song.findByIdAndDelete(song._id);
            result.songsDeleted++;
        } catch (error) {
            result.errors.push(`Failed to cleanup song ${song._id}: ${error}`);
        }
    }

    console.log(`✅ Cleanup complete: ${result.songsDeleted} songs, ${result.filesDeleted} files deleted`);
    if (result.errors.length > 0) {
        console.warn('⚠️ Cleanup errors:', result.errors);
    }

    return result;
};

/**
 * Starts a periodic cleanup scheduler. Runs every intervalHours.
 */
export const startCleanupScheduler = (daysOld: number = 30, intervalHours: number = 24) => {
    const intervalMs = intervalHours * 60 * 60 * 1000;

    const runCleanup = async () => {
        console.log('🕐 Starting scheduled cleanup...');
        try {
            await cleanupOldDeletedSongs(daysOld);
        } catch (error) {
            console.error('Scheduled cleanup failed:', error);
        }
    };

    setInterval(runCleanup, intervalMs);
    console.log(`📅 Cleanup scheduler started (every ${intervalHours}h, songs older than ${daysOld} days)`);
};
