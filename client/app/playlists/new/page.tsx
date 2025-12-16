'use client';

import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { CREATE_PLAYLIST_MUTATION } from '@/lib/graphql/mutations/playlist.mutations';
import { ProtectedRoute } from '@/components/ui/protected-route';
import { PlaylistForm } from '@/components/playlist/playlist-form';
import type { CreatePlaylistInput } from '@/lib/validation/schemas';
import { useUIStore } from '@/lib/store/ui-store';

interface CreatePlaylistMutationData {
  createPlaylist: {
    id: string;
    title: string;
    description?: string;
    isPublic: boolean;
    owner: {
      username: string;
    };
    createdAt: string;
  };
}

interface CreatePlaylistMutationVariables {
  input: CreatePlaylistInput;
}

export default function NewPlaylistPage() {
  const router = useRouter();
  const { addNotification } = useUIStore();
  const [createPlaylist, { loading }] = useMutation<CreatePlaylistMutationData, CreatePlaylistMutationVariables>(CREATE_PLAYLIST_MUTATION);

  const handleSubmit = async (data: CreatePlaylistInput) => {
    try {
      const result = await createPlaylist({
        variables: { input: data },
      });

      if (result.data?.createPlaylist) {
        const createdPlaylist = result.data.createPlaylist;
        addNotification({
          message: 'Playlist created successfully!',
          type: 'success',
        });
        router.push(`/playlists/${createdPlaylist.id}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create playlist';
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
          <h1 className="text-3xl font-bold mb-8">Create New Playlist</h1>
          <PlaylistForm onSubmit={handleSubmit} isLoading={loading} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
