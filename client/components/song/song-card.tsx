import type { Song } from '@/types';
import { Card } from '@/components/ui/card';
import { formatDuration } from '@/lib/utils/format';
import { SongPlayer } from './song-player';

interface SongCardProps {
  song: Song;
  showPlayer?: boolean;
}

export function SongCard({ song, showPlayer = false }: SongCardProps) {
  return (
    <Card>
      <div className={showPlayer ? 'mb-4' : ''}>
        <h3 className="text-lg font-semibold mb-1">{song.title}</h3>
        <p className="text-gray-600 mb-2">{song.artist}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{formatDuration(song.duration)}</span>
          <span>Uploaded by {song.uploadedBy.username}</span>
        </div>
      </div>
      {showPlayer && <SongPlayer song={song} />}
    </Card>
  );
}
