'use client';

import { useMutation } from '@apollo/client';
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
import { formatDate } from '@/lib/utils/format';

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
    } catch (error: any) {
      addNotification({
        message: error.message || 'Failed to remove song',
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
            <div>
              <h1 className="text-3xl font-bold mb-2">{playlist.title}</h1>
              {playlist.description && (
                <p className="text-gray-600 mb-4">{playlist.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>
                  Created by {playlist.owner.firstName}{' '}
                  {playlist.owner.lastName}
                </span>
                <span>•</span>
                <span>{formatDate(playlist.createdAt)}</span>
                {playlist.isPublic && (
                  <>
                    <span>•</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                      Public
                    </span>
                  </>
                )}
              </div>
            </div>
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
