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
      <Card className="hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-semibold mb-2">{playlist.title}</h3>
        {playlist.description && (
          <p className="text-gray-600 mb-2 line-clamp-2">
            {playlist.description}
          </p>
        )}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {playlist.songs.length} song{playlist.songs.length !== 1 ? 's' : ''}
          </span>
          <span>{formatDate(playlist.createdAt)}</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-gray-500">
            by {playlist.owner.firstName} {playlist.owner.lastName}
          </span>
          {playlist.isPublic && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
              Public
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}
