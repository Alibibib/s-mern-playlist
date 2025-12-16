'use client';

import { useQuery } from '@apollo/client/react';
import { SONGS_QUERY } from '@/lib/graphql/queries/song.queries';
import { useAuth } from '@/hooks/use-auth';
import { SongCard } from '@/components/song/song-card';
import { UploadForm } from '@/components/song/upload-form';
import { Loading } from '@/components/ui/loading';
import { Error } from '@/components/ui/error';
import { Button } from '@/components/ui/button';
import type { Song } from '@/types';

interface SongsQueryData {
  songs: Song[];
}

export default function SongsPage() {
  const { isAuthenticated } = useAuth();
  const { data, loading, error } = useQuery<SongsQueryData>(SONGS_QUERY, {
    skip: !isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please login</h1>
          <Button onClick={() => window.location.href = '/login'}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">All Songs</h1>
        <div className="mb-8">
          <UploadForm />
        </div>
        {loading ? (
          <Loading />
        ) : error ? (
          <Error message={error.message || 'Failed to load songs'} />
        ) : !data?.songs || data.songs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No songs found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.songs.map((song) => (
              <SongCard key={song.id} song={song} showPlayer={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
