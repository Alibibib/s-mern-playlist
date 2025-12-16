import { gql } from '@apollo/client';

export const SONGS_QUERY = gql`
  query Songs {
    songs {
      id
      title
      artist
      duration
      fileId
      uploadedBy {
        id
        username
      }
      createdAt
      updatedAt
    }
  }
`;

export const SONG_QUERY = gql`
  query Song($id: ID!) {
    song(id: $id) {
      id
      title
      artist
      duration
      fileId
      uploadedBy {
        id
        username
        firstName
        lastName
      }
      createdAt
      updatedAt
    }
  }
`;
