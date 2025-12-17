'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Loader2 } from 'lucide-react';
import { useUIStore } from '@/lib/store/ui-store';
import { SONGS_QUERY } from '@/lib/graphql/queries/song.queries';
import type { Song } from '@/types';

const ADD_SONG_TO_PLAYLIST_MUTATION = gql`
  mutation AddSongToPlaylist($playlistId: ID!, $songId: ID!) {
    addSongToPlaylist(playlistId: $playlistId, songId: $songId) {
      id
      song {
        id
        title
      }
    }
  }
`;

interface AddSongModalProps {
    playlistId: string;
    existingSongIds: string[];
}

export function AddSongModal({ playlistId, existingSongIds }: AddSongModalProps) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { addNotification } = useUIStore();

    const { data, loading } = useQuery<{ songs: Song[] }>(SONGS_QUERY);
    const [addSong, { loading: adding }] = useMutation(ADD_SONG_TO_PLAYLIST_MUTATION);

    const handleAdd = async (songId: string) => {
        try {
            await addSong({
                variables: { playlistId, songId },
                refetchQueries: ['Playlist'], // Refetch playlist detail
            });
            addNotification({ message: 'Song added to playlist', type: 'success' });
        } catch (error) {
            addNotification({
                message: error instanceof Error ? error.message : 'Failed to add song',
                type: 'error'
            });
        }
    };

    const filteredSongs = data?.songs.filter(song =>
        !existingSongIds.includes(song.id) &&
        (song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            song.artist.toLowerCase().includes(searchTerm.toLowerCase()))
    ) || [];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="glow" className="gap-2">
                    <Plus size={16} /> Add Songs
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl glass-panel border-violet-500/20">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Add Songs to Playlist
                    </DialogTitle>
                </DialogHeader>

                <div className="relative mt-4 mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <Input
                        placeholder="Search by title or artist..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="h-[300px] overflow-y-auto pr-2 space-y-2">
                    {loading ? (
                        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-violet-500" /></div>
                    ) : filteredSongs.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {searchTerm ? 'No matching songs found' : 'All available songs are already in this playlist'}
                        </div>
                    ) : (
                        filteredSongs.map(song => (
                            <div key={song.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                <div>
                                    <p className="text-white font-medium">{song.title}</p>
                                    <p className="text-xs text-gray-400">{song.artist} • {Math.floor(song.duration / 60)}:{Math.floor(song.duration % 60).toString().padStart(2, '0')}</p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleAdd(song.id)}
                                    disabled={adding}
                                >
                                    <Plus size={14} /> Add
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
