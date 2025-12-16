import type { PlaylistSong } from '@/types';
import { SongPlayer } from './song-player';
import { formatDuration } from '@/lib/utils/format';

interface SongListProps {
  songs: PlaylistSong[];
  onRemove?: (songId: string) => void;
  canRemove?: boolean;
}

export function SongList({ songs, onRemove, canRemove = false }: SongListProps) {
  if (songs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No songs in this playlist
      </div>
    );
  }

  // Сортируем по order
  const sortedSongs = [...songs].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {sortedSongs.map((playlistSong, index) => (
        <div key={playlistSong.id} className="border-b pb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-medium">
                {index + 1}. {playlistSong.song.title}
              </div>
              <div className="text-sm text-gray-600">
                {playlistSong.song.artist} • {formatDuration(playlistSong.song.duration)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Added by {playlistSong.addedBy.username}
              </div>
            </div>
            {canRemove && onRemove && (
              <button
                onClick={() => onRemove(playlistSong.song.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            )}
          </div>
          <SongPlayer song={playlistSong.song} />
        </div>
      ))}
    </div>
  );
}
