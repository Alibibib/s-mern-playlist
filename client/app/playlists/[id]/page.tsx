'use client';

import { useMutation } from '@apollo/client/react';
import { useRouter, useParams } from 'next/navigation';
import { usePlaylist } from '@/hooks/use-playlist';
import { REMOVE_SONG_FROM_PLAYLIST_MUTATION } from '@/lib/graphql/mutations/playlist.mutations';
import { useAuth } from '@/hooks/use-auth';
import { SongList } from '@/components/song/song-list';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { Error } from '@/components/ui/error';
import { Card } from '@/components/ui/card';
import { useUIStore } from '@/lib/store/ui-store';
import { PlaylistDetail } from '@/components/playlist/playlist-detail';

function getErrorMessage(error: unknown, fallback = 'Unknown error'): string {
  if (error instanceof Error) {
    return (error as Error).message || fallback;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message;
    return typeof message === 'string' ? message : fallback;
  }
  return fallback;
}

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playlistId = params.id as string;
  const { playlist, loading, error, refetch } = usePlaylist(playlistId);
  const { user } = useAuth();
  const { addNotification } = useUIStore();
  const [removeSong] = useMutation(REMOVE_SONG_FROM_PLAYLIST_MUTATION);

  const isOwner = playlist?.owner.id === user?.id;

  const handleRemoveSong = async (songId: string) => {
    try {
      await removeSong({
        variables: {
          playlistId,
          songId,
        },
      });
      addNotification({
        message: 'Song removed from playlist',
        type: 'success',
      });
      refetch();
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Failed to remove song');
      addNotification({
        message: errorMessage,
        type: 'error',
      });
    }
  };

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
        <Error message={error.message || 'Failed to load playlist'} />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Error message="Playlist not found" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <PlaylistDetail playlist={playlist} />
            {isOwner && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/playlists/${playlistId}/edit`)}
                >
                  Edit
                </Button>
              </div>
            )}
          </div>
        </Card>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            Songs ({playlist.songs.length})
          </h2>
          <SongList
            songs={playlist.songs}
            onRemove={handleRemoveSong}
            canRemove={isOwner}
          />
        </div>
      </div>
    </div>
  );
}
