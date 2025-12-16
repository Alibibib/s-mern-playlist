import type { Song } from '@/types';
import { Card } from '@/components/ui/card';
import { formatDuration } from '@/lib/utils/format';

interface SongCardProps {
  song: Song;
}

export function SongCard({ song }: SongCardProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold mb-1">{song.title}</h3>
      <p className="text-gray-600 mb-2">{song.artist}</p>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{formatDuration(song.duration)}</span>
        <span>Uploaded by {song.uploadedBy.username}</span>
      </div>
    </Card>
  );
}
