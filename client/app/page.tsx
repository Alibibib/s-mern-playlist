'use client';

import { useQuery } from '@apollo/client/react';
import { PUBLIC_PLAYLISTS_QUERY } from '@/lib/graphql/queries/playlist.queries';
import { PlaylistList } from '@/components/playlist/playlist-list';
import { Loading } from '@/components/ui/loading';
import { Error } from '@/components/ui/error';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import type { Playlist } from '@/types';

interface PublicPlaylist {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  owner: {
    username: string;
    firstName: string;
    lastName: string;
  };
  songs: {
    id: string;
    song: {
      title: string;
      artist: string;
    };
  }[];
  contributors: never[];
  createdAt: string;
  updatedAt: string;
}

interface PublicPlaylistsQueryData {
  publicPlaylists: PublicPlaylist[];
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data, loading, error } = useQuery<PublicPlaylistsQueryData>(PUBLIC_PLAYLISTS_QUERY);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Public Playlists</h1>
          {isAuthenticated ? (
            <Link href="/playlists">
              <Button>My Playlists</Button>
            </Link>
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Register</Button>
              </Link>
            </div>
          )}
        </div>
        {loading ? (
          <Loading />
        ) : error ? (
          <Error message={error.message || 'Failed to load playlists'} />
        ) : (
          <PlaylistList
            playlists={
              data?.publicPlaylists
                ? (data.publicPlaylists.map((p) => ({
                  ...p,
                  isPublic: true,
                  contributors: [],
                  updatedAt: p.createdAt,
                })) as unknown as Playlist[])
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
