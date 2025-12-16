'use client';

import { useQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { MY_PLAYLISTS_QUERY } from '@/lib/graphql/queries/playlist.queries';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/ui/protected-route';
import { PlaylistList } from '@/components/playlist/playlist-list';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { Error } from '@/components/ui/error';
import type { Playlist } from '@/types';

interface MyPlaylistsQueryData {
  myPlaylists: Playlist[];
}

export default function PlaylistsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data, loading, error } = useQuery<MyPlaylistsQueryData>(MY_PLAYLISTS_QUERY, {
    skip: !isAuthenticated,
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Playlists</h1>
            <Button onClick={() => router.push('/playlists/new')}>
              Create Playlist
            </Button>
          </div>
          {loading ? (
            <Loading />
          ) : error ? (
            <Error message={error.message || 'Failed to load playlists'} />
          ) : (
            <PlaylistList playlists={data?.myPlaylists} />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
