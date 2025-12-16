import { gql } from '@apollo/client';

export const CREATE_SONG_MUTATION = gql`
  mutation CreateSong($input: CreateSongInput!) {
    createSong(input: $input) {
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
    }
  }
`;
