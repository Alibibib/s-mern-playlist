'use client';

import { useQuery } from '@apollo/client/react';
import { useParams, useRouter } from 'next/navigation';
import { SONG_QUERY } from '@/lib/graphql/queries/song.queries';
import { ProtectedRoute } from '@/components/ui/protected-route';
import { SongPlayer } from '@/components/song/song-player';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { Error } from '@/components/ui/error';
import { Button } from '@/components/ui/button';
import { formatDuration, formatDate } from '@/lib/utils/format';
import type { Song } from '@/types';

interface SongQueryData {
  song: Song;
}

interface SongQueryVariables {
  id: string;
}

export default function SongDetailPage() {
  const params = useParams();
  const router = useRouter();
  const songId = params.id as string;

  const { data, loading, error } = useQuery<SongQueryData, SongQueryVariables>(SONG_QUERY, {
    variables: { id: songId },
    skip: !songId,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Error message={error.message || 'Failed to load song'} />
      </div>
    );
  }

  if (!data?.song) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Error message="Song not found" />
      </div>
    );
  }

  const song = data.song;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-6"
          >
            ← Back
          </Button>
          <Card className="mb-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">{song.title}</h1>
              <p className="text-xl text-gray-600 mb-4">{song.artist}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Duration: {formatDuration(song.duration)}</span>
                <span>•</span>
                <span>
                  Uploaded by {song.uploadedBy.firstName} {song.uploadedBy.lastName} (
                  {song.uploadedBy.username})
                </span>
                <span>•</span>
                <span>{formatDate(song.createdAt)}</span>
              </div>
            </div>
            <SongPlayer song={song} autoPlay={false} />
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
