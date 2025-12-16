import { gql } from '@apollo/client';

export const CREATE_PLAYLIST_MUTATION = gql`
  mutation CreatePlaylist($input: CreatePlaylistInput!) {
    createPlaylist(input: $input) {
      id
      title
      description
      isPublic
      owner {
        username
      }
      createdAt
    }
  }
`;

export const UPDATE_PLAYLIST_MUTATION = gql`
  mutation UpdatePlaylist($id: ID!, $input: UpdatePlaylistInput!) {
    updatePlaylist(id: $id, input: $input) {
      id
      title
      description
      isPublic
      updatedAt
    }
  }
`;

export const DELETE_PLAYLIST_MUTATION = gql`
  mutation DeletePlaylist($id: ID!) {
    deletePlaylist(id: $id)
  }
`;

export const ADD_SONG_TO_PLAYLIST_MUTATION = gql`
  mutation AddSongToPlaylist($playlistId: ID!, $songId: ID!) {
    addSongToPlaylist(playlistId: $playlistId, songId: $songId) {
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

export const REMOVE_SONG_FROM_PLAYLIST_MUTATION = gql`
  mutation RemoveSongFromPlaylist($playlistId: ID!, $songId: ID!) {
    removeSongFromPlaylist(playlistId: $playlistId, songId: $songId)
  }
`;
