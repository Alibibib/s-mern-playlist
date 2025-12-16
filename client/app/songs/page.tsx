'use client';

import { useQuery } from '@apollo/client/react';
import { SONGS_QUERY } from '@/lib/graphql/queries/song.queries';
import { useAuth } from '@/hooks/use-auth';
import { SongPlayer } from '@/components/song/song-player';
import { Loading } from '@/components/ui/loading';
import { Error } from '@/components/ui/error';
import { Card } from '@/components/ui/card';
import { formatDuration } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';

export default function SongsPage() {
  const { isAuthenticated } = useAuth();
  const { data, loading, error } = useQuery(SONGS_QUERY, {
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
            {data.songs.map((song: any) => (
              <Card key={song.id}>
                <div className="mb-4">
                  <h3 className="text-xl font-semibold">{song.title}</h3>
                  <p className="text-gray-600">{song.artist}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDuration(song.duration)} • Uploaded by{' '}
                    {song.uploadedBy.username}
                  </p>
                </div>
                <SongPlayer song={song} />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
