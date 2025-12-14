// src/graphql/typeDefs.ts
export const typeDefs = `#graphql
  # User Types
  type User {
    id: ID!
    username: String!
    email: String!
    firstName: String!
    lastName: String!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    user: User!
    token: String!
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
    firstName: String!
    lastName: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  # Playlist Types
  type Playlist {
    id: ID!
    title: String!
    description: String!
    owner: User!
    isPublic: Boolean!
    songs: [PlaylistSong!]!
    contributors: [Contributor!]!
    createdAt: String!
    updatedAt: String!
  }

  input CreatePlaylistInput {
    title: String!
    description: String
    isPublic: Boolean
  }

  input UpdatePlaylistInput {
    title: String
    description: String
    isPublic: Boolean
  }

  # Song Types
  type Song {
    id: ID!
    title: String!
    artist: String!
    duration: Int!
    fileId: String!
    uploadedBy: User!
    createdAt: String!
    updatedAt: String!
  }

  input CreateSongInput {
    title: String!
    artist: String!
    duration: Int!
    fileId: String!
  }

  # PlaylistSong Types (Junction)
  type PlaylistSong {
    id: ID!
    playlist: Playlist!
    song: Song!
    addedBy: User!
    order: Int!
    createdAt: String!
  }

  # Contributor Types
  enum ContributorRole {
    VIEWER
    EDITOR
    ADMIN
  }

  type Contributor {
    id: ID!
    playlist: Playlist!
    user: User!
    role: ContributorRole!
    invitedBy: User!
    createdAt: String!
  }

  input AddContributorInput {
    playlistId: ID!
    userId: ID!
    role: ContributorRole!
  }

  # Queries (6+)
  type Query {
    # User queries
    hello: String!
    me: User
    users: [User!]!
    user(id: ID!): User

    # Playlist queries
    playlists: [Playlist!]!
    playlist(id: ID!): Playlist
    myPlaylists: [Playlist!]!
    publicPlaylists: [Playlist!]!

    # Song queries
    songs: [Song!]!
    song(id: ID!): Song
    playlistSongs(playlistId: ID!): [PlaylistSong!]!
  }

  # Mutations (6+)
  type Mutation {
    # User mutations
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    updateUser(id: ID!, firstName: String, lastName: String): User!
    deleteUser(id: ID!): Boolean!

    # Playlist mutations
    createPlaylist(input: CreatePlaylistInput!): Playlist!
    updatePlaylist(id: ID!, input: UpdatePlaylistInput!): Playlist!
    deletePlaylist(id: ID!): Boolean!

    # Song mutations
    createSong(input: CreateSongInput!): Song!
    addSongToPlaylist(playlistId: ID!, songId: ID!): PlaylistSong!
    removeSongFromPlaylist(playlistId: ID!, songId: ID!): Boolean!
    reorderPlaylistSongs(playlistId: ID!, songIds: [ID!]!): [PlaylistSong!]!

    # Contributor mutations
    addContributor(input: AddContributorInput!): Contributor!
    removeContributor(playlistId: ID!, userId: ID!): Boolean!
    updateContributorRole(playlistId: ID!, userId: ID!, role: ContributorRole!): Contributor!
  }

  # Subscriptions (Real-time updates)
  type Subscription {
    serverTime: String!
    userCreated: User!
    
    # Playlist subscriptions
    playlistUpdated(playlistId: ID!): Playlist!
    songAddedToPlaylist(playlistId: ID!): PlaylistSong!
    songRemovedFromPlaylist(playlistId: ID!): ID!
    contributorAdded(playlistId: ID!): Contributor!
  }
`;