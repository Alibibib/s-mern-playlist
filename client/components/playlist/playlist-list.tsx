import type { Playlist } from '@/types';
import { PlaylistCard } from './playlist-card';
import { Loading } from '@/components/ui/loading';
import { Error } from '@/components/ui/error';

interface PlaylistListProps {
  playlists?: Playlist[];
  loading?: boolean;
  error?: Error | { message?: string } | null;
}

export function PlaylistList({ playlists, loading, error }: PlaylistListProps) {
  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error.message || 'Failed to load playlists'} />;
  }

  if (!playlists || playlists.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
        <p className="text-lg">No playlists found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {playlists.map((playlist) => (
        <PlaylistCard key={playlist.id} playlist={playlist} />
      ))}
    </div>
  );
}
