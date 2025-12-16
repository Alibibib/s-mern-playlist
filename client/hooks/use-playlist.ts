'use client';

import { useQuery } from '@apollo/client/react';
import { PLAYLIST_QUERY } from '@/lib/graphql/queries/playlist.queries';
import { useSubscription } from './use-subscription';
import {
  SONG_ADDED_TO_PLAYLIST_SUBSCRIPTION,
  PLAYLIST_UPDATED_SUBSCRIPTION,
} from '@/lib/graphql/subscriptions/playlist.subscriptions';
import { useUIStore } from '@/lib/store/ui-store';
import type { PlaylistSong, Playlist } from '@/types';

interface PlaylistQueryData {
  playlist: Playlist;
}

interface PlaylistQueryVariables {
  id: string;
}

export function usePlaylist(playlistId: string) {
  const { addNotification } = useUIStore();

  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery<PlaylistQueryData, PlaylistQueryVariables>(PLAYLIST_QUERY, {
    variables: { id: playlistId },
    skip: !playlistId,
  });

  // Подписка на добавление песен
  useSubscription(SONG_ADDED_TO_PLAYLIST_SUBSCRIPTION, {
    variables: { playlistId },
    skip: !playlistId,
    onData: (data: { songAddedToPlaylist: PlaylistSong }) => {
      addNotification({
        message: `New song "${data.songAddedToPlaylist.song.title}" added to playlist`,
        type: 'success',
      });
      // Обновляем данные плейлиста
      refetch();
    },
  });

  // Подписка на обновление плейлиста
  useSubscription(PLAYLIST_UPDATED_SUBSCRIPTION, {
    variables: { playlistId },
    skip: !playlistId,
    onData: (data: { playlistUpdated: Pick<Playlist, 'id' | 'title' | 'description' | 'isPublic' | 'updatedAt'> }) => {
      addNotification({
        message: `Playlist "${data.playlistUpdated.title}" was updated`,
        type: 'info',
      });
      // Обновляем данные плейлиста
      refetch();
    },
  });

  return {
    playlist: data?.playlist as Playlist | undefined,
    loading,
    error,
    refetch,
  };
}
