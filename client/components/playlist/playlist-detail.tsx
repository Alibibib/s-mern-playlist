'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useSubscription } from '@apollo/client';
import { gql } from '@apollo/client';
import type { Playlist, Song, PlaylistSong, Contributor } from '@/types';
import { formatDate } from '@/lib/utils/format';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { usePlayerStore } from '@/lib/store/use-player-store';
import { useUIStore } from '@/lib/store/ui-store';
import { Play, Pause, Trash2, GripVertical, Clock } from 'lucide-react';
import { AddSongModal } from './add-song-modal';
import { ContributorManager } from './contributor-manager';
import {
  SONG_ADDED_TO_PLAYLIST_SUBSCRIPTION
} from '@/lib/graphql/subscriptions/playlist.subscriptions';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const REMOVE_SONG_FROM_PLAYLIST_MUTATION = gql`
  mutation RemoveSongFromPlaylist($playlistId: ID!, $songId: ID!) {
    removeSongFromPlaylist(playlistId: $playlistId, songId: $songId) {
      id
      songs { id }
    }
  }
`;

const REORDER_SONG_MUTATION = gql`
  mutation ReorderPlaylistSongs($playlistId: ID!, $songId: ID!, $newPosition: Int!) {
    reorderPlaylistSongs(playlistId: $playlistId, songId: $songId, newPosition: $newPosition) {
      id
      songs { id title }
    }
  }
`;

interface PlaylistDetailProps {
  playlist: Playlist;
}

function SortableSongItem({
  playlistSong,
  index,
  onPlay,
  isCurrent,
  isPlaying,
  onRemove,
  canEdit
}: {
  playlistSong: PlaylistSong;
  index: number;
  onPlay: () => void;
  isCurrent: boolean;
  isPlaying: boolean;
  onRemove: () => void;
  canEdit: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: playlistSong.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent ${isCurrent ? 'bg-violet-500/10 border-violet-500/10' : ''}`}
    >
      <div className="flex items-center gap-4 flex-1">
        {canEdit && (
          <button {...attributes} {...listeners} className="text-gray-600 hover:text-white cursor-grab active:cursor-grabbing">
            <GripVertical size={16} />
          </button>
        )}

        <div onClick={onPlay} className="cursor-pointer flex-shrink-0 w-8 flex justify-center">
          {isCurrent && isPlaying ? (
            <Pause size={16} className="text-violet-400" />
          ) : (
            <span className="text-gray-500 text-sm font-mono group-hover:hidden">{index + 1}</span>
          )}
          <Play size={16} className={`text-white hidden ${!isCurrent || !isPlaying ? 'group-hover:block' : ''}`} />
        </div>

        <div className="flex-1 min-w-0">
          <p className={`font-medium truncate ${isCurrent ? 'text-violet-400' : 'text-white'}`}>{playlistSong.song.title}</p>
          <p className="text-xs text-gray-400 truncate">{playlistSong.song.artist}</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <span className="text-xs text-gray-500 font-mono hidden sm:block">
          {Math.floor(playlistSong.song.duration / 60)}:{Math.floor(playlistSong.song.duration % 60).toString().padStart(2, '0')}
        </span>

        {canEdit && (
          <button
            onClick={onRemove}
            className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export function PlaylistDetail({ playlist }: PlaylistDetailProps) {
  const { user } = useAuth();
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();
  const { addNotification } = useUIStore();

  const [songs, setSongs] = useState<PlaylistSong[]>(playlist.songs || []);

  // Update local state if prop changes (e.g. from pagination or refetch)
  useEffect(() => {
    // eslint-disable-next-line
    setSongs(playlist.songs || []);
  }, [playlist.songs]);

  const isOwner = user?.id === playlist.owner.id;
  const isEditor = isOwner || playlist.contributors?.some((c: Contributor) => c.user.id === user?.id && ['EDITOR', 'ADMIN'].includes(c.role));

  const [removeSong] = useMutation(REMOVE_SONG_FROM_PLAYLIST_MUTATION);
  const [reorderSongs] = useMutation(REORDER_SONG_MUTATION);

  useSubscription(SONG_ADDED_TO_PLAYLIST_SUBSCRIPTION, {
    variables: { playlistId: playlist.id },
    onData: ({ data: { data } }) => {
      if (data?.songAddedToPlaylist) {
        setSongs(prev => {
          const exists = prev.some(s => s.id === data.songAddedToPlaylist.id);
          if (exists) return prev;
          return [...prev, data.songAddedToPlaylist];
        });
      }
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handlePlay = (song: Song) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playSong(song);
    }
  };

  const handleRemoveSong = async (songId: string) => {
    try {
      await removeSong({
        variables: { playlistId: playlist.id, songId },
        refetchQueries: ['Playlist']
      });
      // Optimistic remove?
      // Usually better to wait for subscription or refetch, but UI feels faster with optimistic
      // Note: songId passed here must be the one expected by mutation.
      // If we encounter issues, we might need to adjust.
    } catch {
      // console.error(error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setSongs((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over?.id);

        reorderSongs({
          variables: {
            playlistId: playlist.id,
            songId: active.id,
            newPosition: newIndex
          }
        }).catch(() => {
          addNotification({ message: 'Failed to reorder', type: 'error' });
        });

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card variant="glass" className="relative overflow-hidden border-white/5 p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-violet-800 to-fuchsia-800 flex items-center justify-center shadow-2xl shadow-violet-900/50 shrink-0">
            <span className="text-6xl">🎵</span>
          </div>

          <div className="flex-1 space-y-4 pt-2">
            <div>
              <span className="text-xs uppercase tracking-wider font-medium text-violet-400">Playlist</span>
              <h1 className="text-5xl font-bold text-white mb-2">{playlist.title}</h1>
              <p className="text-gray-400 text-lg max-w-2xl">{playlist.description}</p>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white">
                  {playlist.owner.firstName[0]}
                </div>
                <span className="text-white hover:underline cursor-pointer">{playlist.owner.firstName} {playlist.owner.lastName}</span>
              </div>
              <span>•</span>
              <span>{songs.length} songs</span>
              <span>•</span>
              <span>{formatDate(playlist.createdAt)}</span>
            </div>

            <div className="flex items-center gap-4 mt-6">
              {songs.length > 0 && (
                <Button
                  variant="glow"
                  size="lg"
                  className="rounded-full px-8"
                  onClick={() => playSong(songs[0].song)}
                >
                  <Play fill="currentColor" className="mr-2" /> Play All
                </Button>
              )}

              {isEditor && (
                <>
                  <AddSongModal playlistId={playlist.id} existingSongIds={songs.map(s => s.song.id)} />
                  {isOwner && <ContributorManager playlistId={playlist.id} contributors={playlist.contributors || []} isOwner={isOwner} />}
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="px-2">
        {songs.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl font-light">This playlist is empty</p>
            {isEditor && <p className="text-sm mt-2">Add some songs to get the party started</p>}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-4 px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-white/5 mb-2">
              <span className="w-8 text-center">#</span>
              <span className="flex-1">Title</span>
              <span className="w-16 text-right"><Clock size={14} /></span>
              {isEditor && <span className="w-8"></span>}
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={songs.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {songs.map((playlistSong, index) => (
                  <SortableSongItem
                    key={playlistSong.id}
                    playlistSong={playlistSong}
                    index={index}
                    onPlay={() => handlePlay(playlistSong.song)}
                    isCurrent={currentSong?.id === playlistSong.song.id}
                    isPlaying={isPlaying}
                    onRemove={() => handleRemoveSong(playlistSong.song.id)}
                    canEdit={isEditor}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>
    </div>
  );
}
