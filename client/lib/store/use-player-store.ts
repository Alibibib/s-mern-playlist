import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Song, Playlist } from '@/types';

interface PlayerState {
    currentSong: Song | null;
    isPlaying: boolean;
    queue: Song[];
    queueIndex: number;
    volume: number;
    isExpanded: boolean;
    // Actions
    setQueue: (songs: Song[], startIndex?: number) => void;
    playSong: (song: Song) => void;
    togglePlay: () => void;
    playNext: () => void;
    playPrevious: () => void;
    setVolume: (volume: number) => void;
    toggleExpanded: () => void;
    addToQueue: (song: Song) => void;
    seek: (time: number) => void; // Placeholder for UI updates
}

export const usePlayerStore = create<PlayerState>()(
    persist(
        (set, get) => ({
            currentSong: null,
            isPlaying: false,
            queue: [],
            queueIndex: -1,
            volume: 1,
            isExpanded: false,

            setQueue: (songs, startIndex = 0) => {
                set({
                    queue: songs,
                    queueIndex: startIndex,
                    currentSong: songs[startIndex] || null,
                    isPlaying: true,
                });
            },

            playSong: (song) => {
                set({
                    currentSong: song,
                    isPlaying: true,
                    queue: [song], // Replace queue or append? For now, simplistic single play
                    queueIndex: 0,
                });
            },

            togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

            playNext: () => {
                const { queue, queueIndex } = get();
                if (queueIndex < queue.length - 1) {
                    set({
                        queueIndex: queueIndex + 1,
                        currentSong: queue[queueIndex + 1],
                        isPlaying: true,
                    });
                }
            },

            playPrevious: () => {
                const { queue, queueIndex } = get();
                if (queueIndex > 0) {
                    set({
                        queueIndex: queueIndex - 1,
                        currentSong: queue[queueIndex - 1],
                        isPlaying: true,
                    });
                }
            },

            setVolume: (volume) => set({ volume }),

            toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),

            addToQueue: (song) => set((state) => ({ queue: [...state.queue, song] })),

            seek: () => { }, // Handled by component logic mostly
        }),
        {
            name: 'player-storage',
            partialize: (state) => ({ volume: state.volume }), // Only persist volume
        }
    )
);
