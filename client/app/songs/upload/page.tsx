'use client';

import { SongUploadForm } from '@/components/songs/song-upload-form';
import { ProtectedRoute } from '@/components/ui/protected-route';

export default function UploadSongPage() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen pt-24 pb-12 px-4">
                <SongUploadForm />
            </div>
        </ProtectedRoute>
    );
}
