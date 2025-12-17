import Link from 'next/link';
import type { Playlist } from '@/types';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils/format';

interface PlaylistCardProps {
  playlist: Playlist;
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <Link href={`/playlists/${playlist.id}`}>
      <Card variant="glass" className="hover:shadow-lg transition-all duration-300 h-full border-white/5 hover:border-violet-500/30 group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2 text-white group-hover:text-glow transition-all">{playlist.title}</h3>
          {playlist.description && (
            <p className="text-gray-400 mb-4 line-clamp-2 text-sm font-light">
              {playlist.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-4 border-t border-white/10">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-violet-500" />
              {playlist.songs.length} song{playlist.songs.length !== 1 ? 's' : ''}
            </span>
            <span>{formatDate(playlist.createdAt)}</span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
              by <span className="text-violet-400 font-medium">{playlist.owner.firstName}</span>
            </span>
            {playlist.isPublic && (
              <span className="px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] uppercase tracking-wider rounded font-medium">
                Public
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
