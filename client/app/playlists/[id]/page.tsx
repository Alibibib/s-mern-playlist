'use client';

import { useMutation } from '@apollo/client/react';
import { useRouter, useParams } from 'next/navigation';
import { usePlaylist } from '@/hooks/use-playlist';
import {
  REMOVE_SONG_FROM_PLAYLIST_MUTATION,
  DELETE_PLAYLIST_MUTATION,
  ADD_SONG_TO_PLAYLIST_MUTATION,
} from '@/lib/graphql/mutations/playlist.mutations';
import { useAuth } from '@/hooks/use-auth';
import { SongList } from '@/components/song/song-list';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { Error } from '@/components/ui/error';
import { Card } from '@/components/ui/card';
import { useUIStore } from '@/lib/store/ui-store';
import { PlaylistDetail } from '@/components/playlist/playlist-detail';
import { useQuery } from '@apollo/client/react';
import { SONGS_QUERY } from '@/lib/graphql/queries/song.queries';
import type { Song } from '@/types';
import { useState } from 'react';
import { getErrorMessage } from '@/lib/utils/error';

interface SongsQueryData {
  songs: Song[];
}

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playlistId = params.id as string;
  const { playlist, loading, error, refetch } = usePlaylist(playlistId);
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useUIStore();
  const [removeSong] = useMutation(REMOVE_SONG_FROM_PLAYLIST_MUTATION);
  const [deletePlaylist] = useMutation(DELETE_PLAYLIST_MUTATION);
  const [addSong] = useMutation(ADD_SONG_TO_PLAYLIST_MUTATION);
  const [showAddSong, setShowAddSong] = useState(false);
  const { data: songsData } = useQuery<SongsQueryData>(SONGS_QUERY, {
    skip: !isAuthenticated || !showAddSong,
  });

  const isOwner = playlist?.owner.id === user?.id;

  const handleRemoveSong = async (songId: string) => {
    try {
      await removeSong({
        variables: {
          playlistId,
          songId,
        },
      });
      addNotification({
        message: 'Song removed from playlist',
        type: 'success',
      });
      refetch();
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Failed to remove song');
      addNotification({
        message: errorMessage,
        type: 'error',
      });
    }
  };

  const handleDeletePlaylist = async () => {
    if (!confirm('Are you sure you want to delete this playlist?')) {
      return;
    }
    try {
      await deletePlaylist({
        variables: { id: playlistId },
      });
      addNotification({
        message: 'Playlist deleted successfully',
        type: 'success',
      });
      router.push('/playlists');
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Failed to delete playlist');
      addNotification({
        message: errorMessage,
        type: 'error',
      });
    }
  };

  const handleAddSong = async (songId: string) => {
    try {
      await addSong({
        variables: {
          playlistId,
          songId,
        },
      });
      addNotification({
        message: 'Song added to playlist',
        type: 'success',
      });
      setShowAddSong(false);
      refetch();
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Failed to add song');
      addNotification({
        message: errorMessage,
        type: 'error',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Error message={error.message || 'Failed to load playlist'} />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Error message="Playlist not found" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <PlaylistDetail playlist={playlist} />
            {isOwner && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/playlists/${playlistId}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeletePlaylist}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        </Card>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">
              Songs ({playlist.songs.length})
            </h2>
            {isOwner && (
              <Button
                variant="outline"
                onClick={() => setShowAddSong(!showAddSong)}
              >
                {showAddSong ? 'Cancel' : 'Add Song'}
              </Button>
            )}
          </div>
          {showAddSong && songsData?.songs && (
            <Card className="mb-4 p-4">
              <h3 className="text-lg font-semibold mb-3">Select a song to add</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {songsData.songs
                  .filter(
                    (song) =>
                      !playlist.songs.some(
                        (playlistSong) => playlistSong.song.id === song.id
                      )
                  )
                  .map((song) => (
                    <div
                      key={song.id}
                      className="flex justify-between items-center p-2 hover:bg-gray-100 rounded"
                    >
                      <div>
                        <div className="font-medium">{song.title}</div>
                        <div className="text-sm text-gray-600">{song.artist}</div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddSong(song.id)}
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                {songsData.songs.filter(
                  (song) =>
                    !playlist.songs.some(
                      (playlistSong) => playlistSong.song.id === song.id
                    )
                ).length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      All available songs are already in this playlist
                    </div>
                  )}
              </div>
            </Card>
          )}
          <SongList
            songs={playlist.songs}
            onRemove={handleRemoveSong}
            canRemove={isOwner}
          />
        </div>
      </div>
    </div>
  );
}
