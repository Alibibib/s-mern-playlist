'use client';

import { useQuery } from '@apollo/client';
import { PLAYLIST_QUERY } from '@/lib/graphql/queries/playlist.queries';
import { useSubscription } from './use-subscription';
import { SONG_ADDED_TO_PLAYLIST_SUBSCRIPTION } from '@/lib/graphql/subscriptions/playlist.subscriptions';
import { useUIStore } from '@/lib/store/ui-store';
import type { PlaylistSong } from '@/types';

export function usePlaylist(playlistId: string) {
  const { addNotification } = useUIStore();

  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery(PLAYLIST_QUERY, {
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

  return {
    playlist: data?.playlist,
    loading,
    error,
    refetch,
  };
}
