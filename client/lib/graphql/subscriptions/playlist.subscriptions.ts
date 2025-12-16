import { gql } from '@apollo/client';

export const SONG_ADDED_TO_PLAYLIST_SUBSCRIPTION = gql`
  subscription SongAddedToPlaylist($playlistId: ID!) {
    songAddedToPlaylist(playlistId: $playlistId) {
      id
      order
      playlist {
        id
        title
      }
      song {
        id
        title
        artist
        duration
        fileId
      }
      addedBy {
        id
        username
      }
      createdAt
    }
  }
`;

export const PLAYLIST_UPDATED_SUBSCRIPTION = gql`
  subscription PlaylistUpdated($playlistId: ID!) {
    playlistUpdated(playlistId: $playlistId) {
      id
      title
      description
      isPublic
      updatedAt
    }
  }
`;
