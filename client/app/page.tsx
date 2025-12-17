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
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent tracking-tight text-glow">
            Discover Music
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8 font-light">
            Experience your playlists in a premium, collaborative environment.
            Real-time updates, crystal clear audio, and stunning visuals.
          </p>

          {!isAuthenticated && (
            <div className="flex justify-center gap-4">
              <Link href="/register">
                <Button variant="glow" size="lg" className="rounded-full">Get Started</Button>
              </Link>
              <Link href="/login">
                <Button variant="glass" size="lg" className="rounded-full">Sign In</Button>
              </Link>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-8 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full inline-block" />
            Trending Playlists
          </h2>
          {isAuthenticated && (
            <Link href="/playlists">
              <Button variant="glass" size="sm">My Playlists</Button>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-20">
            <Loading />
          </div>
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
