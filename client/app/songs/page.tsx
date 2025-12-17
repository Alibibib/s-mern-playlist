'use client';

import { useQuery } from '@apollo/client';
import { SONGS_QUERY } from '@/lib/graphql/queries/song.queries';
import { useAuth } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/ui/protected-route';
import { Loading } from '@/components/ui/loading';
import { Error } from '@/components/ui/error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePlayerStore } from '@/lib/store/use-player-store';
import { Play, Pause, Plus, Music } from 'lucide-react';
import Link from 'next/link';
import type { Song } from '@/types';

interface SongsQueryData {
  songs: Song[];
}

export default function SongsPage() {
  const { isAuthenticated } = useAuth();
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();

  const { data, loading, error } = useQuery<SongsQueryData>(SONGS_QUERY, {
    skip: !isAuthenticated,
  });

  const handlePlayClick = (song: Song) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playSong(song);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen pt-24 px-4 pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Library
              </h1>
              <p className="text-gray-400 text-sm mt-1">All your uploaded tracks</p>
            </div>

            <Link href="/songs/upload">
              <Button variant="glow" className="flex items-center gap-2">
                <Plus size={18} />
                Upload Song
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loading /></div>
          ) : error ? (
            <Error message={error.message || 'Failed to load songs'} />
          ) : !data?.songs || data.songs.length === 0 ? (
            <Card variant="glass" className="text-center py-16 border-dashed border-2 border-white/10 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <Music size={32} className="text-gray-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">No songs yet</h3>
                <p className="text-gray-400 mt-1 mb-4">Upload your first track to get started</p>
                <Link href="/songs/upload">
                  <Button variant="outline">Upload Music</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              <Card variant="glass" className="p-0 overflow-hidden border-white/5">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider font-medium">
                    <tr>
                      <th className="px-6 py-4 w-16">#</th>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Artist</th>
                      <th className="px-6 py-4 text-right">Duration</th>
                      <th className="px-6 py-4 w-20"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.songs.map((song, index) => {
                      const isCurrent = currentSong?.id === song.id;

                      return (
                        <tr
                          key={song.id}
                          className={`hover:bg-white/5 transition-colors group ${isCurrent ? 'bg-violet-500/10' : ''}`}
                        >
                          <td className="px-6 py-4 text-gray-500 group-hover:text-white transition-colors text-sm">
                            <span className="group-hover:hidden">{index + 1}</span>
                            <button
                              onClick={() => handlePlayClick(song)}
                              className="hidden group-hover:flex items-center justify-center text-violet-400 hover:text-white"
                            >
                              {isCurrent && isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`font-medium ${isCurrent ? 'text-violet-400' : 'text-white'}`}>
                              {song.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {song.artist}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-500 font-mono text-xs">
                            {Math.floor(song.duration / 60)}:{Math.floor(song.duration % 60).toString().padStart(2, '0')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {/* Actions dropdown can go here later */}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
