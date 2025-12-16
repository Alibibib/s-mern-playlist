'use client';

import { useMutation } from '@apollo/client/react';
import { useRouter, useParams } from 'next/navigation';
import { usePlaylist } from '@/hooks/use-playlist';
import { UPDATE_PLAYLIST_MUTATION } from '@/lib/graphql/mutations/playlist.mutations';
import { ProtectedRoute } from '@/components/ui/protected-route';
import { PlaylistForm } from '@/components/playlist/playlist-form';
import { Loading } from '@/components/ui/loading';
import { Error } from '@/components/ui/error';
import { useUIStore } from '@/lib/store/ui-store';
import { useAuth } from '@/hooks/use-auth';
import type { UpdatePlaylistInput } from '@/lib/validation/schemas';
import { getErrorMessage } from '@/lib/utils/error';

interface UpdatePlaylistMutationData {
  updatePlaylist: {
    id: string;
    title: string;
    description?: string;
    isPublic: boolean;
    updatedAt: string;
  };
}

interface UpdatePlaylistMutationVariables {
  id: string;
  input: UpdatePlaylistInput;
}

export default function EditPlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const playlistId = params.id as string;
  const { playlist, loading, error } = usePlaylist(playlistId);
  const { user } = useAuth();
  const { addNotification } = useUIStore();
  const [updatePlaylist, { loading: updating }] = useMutation<
    UpdatePlaylistMutationData,
    UpdatePlaylistMutationVariables
  >(UPDATE_PLAYLIST_MUTATION);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Loading />
      </div>
    );
  }

  if (error) {
    const errorMessage = getErrorMessage(error, 'Failed to load playlist');
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Error message={errorMessage} />
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

  if (playlist.owner.id !== user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Error message="You don't have permission to edit this playlist" />
      </div>
    );
  }

  const handleSubmit = async (data: UpdatePlaylistInput) => {
    try {
      await updatePlaylist({
        variables: {
          id: playlistId,
          input: data,
        },
      });
      addNotification({
        message: 'Playlist updated successfully!',
        type: 'success',
      });
      router.push(`/playlists/${playlistId}`);
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Failed to update playlist');
      addNotification({
        message: errorMessage,
        type: 'error',
      });
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Edit Playlist</h1>
          <PlaylistForm
            onSubmit={handleSubmit}
            isLoading={updating}
            initialData={{
              title: playlist.title,
              description: playlist.description,
              isPublic: playlist.isPublic,
            }}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
