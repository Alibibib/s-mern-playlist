import type { Playlist } from '@/types';
import { formatDate } from '@/lib/utils/format';

interface PlaylistDetailProps {
  playlist: Playlist;
}

export function PlaylistDetail({ playlist }: PlaylistDetailProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{playlist.title}</h1>
      {playlist.description && (
        <p className="text-gray-600 mb-4">{playlist.description}</p>
      )}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>
          Created by {playlist.owner.firstName} {playlist.owner.lastName}
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
  );
}
