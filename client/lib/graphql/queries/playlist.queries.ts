import { gql } from '@apollo/client';

export const PLAYLISTS_QUERY = gql`
  query Playlists {
    playlists {
      id
      title
      description
      isPublic
      owner {
        id
        username
        firstName
        lastName
      }
      songs {
        id
        order
        song {
          id
          title
          artist
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const PLAYLIST_QUERY = gql`
  query Playlist($id: ID!) {
    playlist(id: $id) {
      id
      title
      description
      isPublic
      owner {
        id
        username
        firstName
        lastName
      }
      songs {
        id
        order
        song {
          id
          title
          artist
          duration
          fileId
          uploadedBy {
            id
            username
          }
        }
        addedBy {
          id
          username
        }
        createdAt
      }
      contributors {
        id
        user {
          id
          username
          email
        }
        role
        invitedBy {
          username
        }
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`;

export const MY_PLAYLISTS_QUERY = gql`
  query MyPlaylists {
    myPlaylists {
      id
      title
      description
      isPublic
      owner {
        id
        username
      }
      songs {
        id
        song {
          title
          artist
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const PUBLIC_PLAYLISTS_QUERY = gql`
  query PublicPlaylists {
    publicPlaylists {
      id
      title
      description
      owner {
        username
        firstName
        lastName
      }
      songs {
        id
        song {
          title
          artist
        }
      }
      createdAt
    }
  }
`;
