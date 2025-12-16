'use client';

import { useQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PLAYLISTS_QUERY, MY_PLAYLISTS_QUERY } from '@/lib/graphql/queries/playlist.queries';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/ui/protected-route';
import { PlaylistList } from '@/components/playlist/playlist-list';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { Error } from '@/components/ui/error';
import type { Playlist } from '@/types';

interface PlaylistsQueryData {
  playlists: Playlist[];
}

interface MyPlaylistsQueryData {
  myPlaylists: Playlist[];
}

export default function PlaylistsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  const { data: allData, loading: allLoading, error: allError } = useQuery<PlaylistsQueryData>(
    PLAYLISTS_QUERY,
    {
      skip: !isAuthenticated || showOnlyMine,
    }
  );

  const { data: myData, loading: myLoading, error: myError } = useQuery<MyPlaylistsQueryData>(
    MY_PLAYLISTS_QUERY,
    {
      skip: !isAuthenticated || !showOnlyMine,
    }
  );

  const data = showOnlyMine ? myData : allData;
  const loading = showOnlyMine ? myLoading : allLoading;
  const error = showOnlyMine ? myError : allError;
  const playlists = showOnlyMine
    ? (data as MyPlaylistsQueryData | undefined)?.myPlaylists
    : (data as PlaylistsQueryData | undefined)?.playlists;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">
                {showOnlyMine ? 'My Playlists' : 'All Playlists'}
              </h1>
              <div className="flex gap-2">
                <Button
                  variant={!showOnlyMine ? 'primary' : 'outline'}
                  onClick={() => setShowOnlyMine(false)}
                >
                  All
                </Button>
                <Button
                  variant={showOnlyMine ? 'primary' : 'outline'}
                  onClick={() => setShowOnlyMine(true)}
                >
                  Mine
                </Button>
              </div>
            </div>
            <Button onClick={() => router.push('/playlists/new')}>
              Create Playlist
            </Button>
          </div>
          {loading ? (
            <Loading />
          ) : error ? (
            <Error message={error.message || 'Failed to load playlists'} />
          ) : (
            <PlaylistList playlists={playlists} />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
