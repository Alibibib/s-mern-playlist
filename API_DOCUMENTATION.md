# 📖 API Documentation

Complete API reference for the MERN Music Playlist Manager.

## Table of Contents

- [Authentication](#authentication)
- [GraphQL API](#graphql-api)
  - [Queries](#queries)
  - [Mutations](#mutations)
  - [Subscriptions](#subscriptions)
- [REST API](#rest-api)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Getting a Token

Register or login to receive a JWT token:

```graphql
mutation Login {
  login(input: {
    email: "user@example.com"
    password: "password123"
  }) {
    token
    user {
      id
      username
    }
  }
}
```

### Using the Token

Include the token in your HTTP headers:

**HTTP Header:**
```json
{
  "authorization": "Bearer YOUR_JWT_TOKEN_HERE"
}
```

**WebSocket Connection Params:**
```json
{
  "authorization": "Bearer YOUR_JWT_TOKEN_HERE"
}
```

### Token Expiration

- Tokens are valid for **7 days**
- After expiration, login again to get a new token

---

## GraphQL API

**Endpoint:** `http://localhost:4000/graphql`
**WebSocket:** `ws://localhost:4000/graphql`

### Queries

#### Get Current User

```graphql
query Me {
  me {
    id
    username
    email
    firstName
    lastName
    createdAt
    updatedAt
  }
}
```

**Auth Required:** Yes

---

#### Get All Users

```graphql
query Users {
  users {
    id
    username
    email
    firstName
    lastName
    createdAt
  }
}
```

**Auth Required:** Yes

---

#### Get All Songs

```graphql
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
```

**Auth Required:** Yes

**Returns:** List of all songs (non-deleted)

---

#### Get All Playlists

```graphql
query Playlists {
  playlists {
    id
    title
    description
    isPublic
    owner {
      id
      username
    }
    createdAt
    updatedAt
  }
}
```

**Auth Required:** Yes

**Returns:** All playlists accessible to the current user

---

#### Get Playlist by ID

```graphql
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
      }
      addedBy {
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
```

**Variables:**
```json
{
  "id": "playlist_id_here"
}
```

**Auth Required:** Yes

**Access Control:**
- Public playlists: Everyone
- Private playlists: Owner and contributors only

---

#### Get My Playlists

```graphql
query MyPlaylists {
  myPlaylists {
    id
    title
    description
    isPublic
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
```

**Auth Required:** Yes

**Returns:** Playlists owned by the current user

---

#### Get Public Playlists

```graphql
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
```

**Auth Required:** No

**Returns:** All public playlists

---

### Mutations

#### Register User

```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    token
    user {
      id
      username
      email
      firstName
      lastName
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Auth Required:** No

**Validations:**
- Username: Required, unique
- Email: Required, valid email format, unique
- Password: Minimum 6 characters
- First Name: Required
- Last Name: Required

---

#### Login User

```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      username
      email
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "email": "john@example.com",
    "password": "SecurePass123"
  }
}
```

**Auth Required:** No

---

#### Create Song

```graphql
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
```

**Variables:**
```json
{
  "input": {
    "title": "Bohemian Rhapsody",
    "artist": "Queen",
    "duration": 354,
    "fileId": "674d8f9a1234567890abcdef"
  }
}
```

**Auth Required:** Yes

**Note:** You must first upload the audio file via REST API to get the `fileId`

---

#### Create Playlist

```graphql
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
```

**Variables:**
```json
{
  "input": {
    "title": "My Rock Classics",
    "description": "Best rock songs ever",
    "isPublic": true
  }
}
```

**Auth Required:** Yes

**Defaults:**
- `description`: Empty string if not provided
- `isPublic`: `false` if not provided

---

#### Update Playlist

```graphql
mutation UpdatePlaylist($id: ID!, $input: UpdatePlaylistInput!) {
  updatePlaylist(id: $id, input: $input) {
    id
    title
    description
    isPublic
    updatedAt
  }
}
```

**Variables:**
```json
{
  "id": "playlist_id_here",
  "input": {
    "title": "Updated Title",
    "description": "Updated description",
    "isPublic": false
  }
}
```

**Auth Required:** Yes

**Permissions:** Only owner or contributors with ADMIN role

---

#### Delete Playlist

```graphql
mutation DeletePlaylist($id: ID!) {
  deletePlaylist(id: $id)
}
```

**Variables:**
```json
{
  "id": "playlist_id_here"
}
```

**Auth Required:** Yes

**Permissions:** Only owner

**Returns:** `true` on success

**Note:** This is a soft delete (sets `isDeleted: true`)

---

#### Add Song to Playlist

```graphql
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
    }
    addedBy {
      username
    }
    createdAt
  }
}
```

**Variables:**
```json
{
  "playlistId": "playlist_id_here",
  "songId": "song_id_here"
}
```

**Auth Required:** Yes

**Permissions:** Owner or contributors with EDITOR/ADMIN role

**Note:** Automatically assigns the next order number

---

#### Remove Song from Playlist

```graphql
mutation RemoveSongFromPlaylist($playlistId: ID!, $songId: ID!) {
  removeSongFromPlaylist(playlistId: $playlistId, songId: $songId)
}
```

**Variables:**
```json
{
  "playlistId": "playlist_id_here",
  "songId": "song_id_here"
}
```

**Auth Required:** Yes

**Permissions:** Owner or contributors with EDITOR/ADMIN role

**Returns:** `true` on success

---

#### Reorder Playlist Songs

```graphql
mutation ReorderPlaylistSongs($playlistId: ID!, $songIds: [ID!]!) {
  reorderPlaylistSongs(playlistId: $playlistId, songIds: $songIds) {
    id
    order
    song {
      title
    }
  }
}
```

**Variables:**
```json
{
  "playlistId": "playlist_id_here",
  "songIds": ["song_id_1", "song_id_3", "song_id_2"]
}
```

**Auth Required:** Yes

**Permissions:** Owner or contributors with EDITOR/ADMIN role

**Note:** The array defines the new order of songs

---

#### Add Contributor

```graphql
mutation AddContributor($input: AddContributorInput!) {
  addContributor(input: $input) {
    id
    user {
      username
      email
    }
    role
    playlist {
      title
    }
    invitedBy {
      username
    }
    createdAt
  }
}
```

**Variables:**
```json
{
  "input": {
    "playlistId": "playlist_id_here",
    "userId": "user_id_here",
    "role": "EDITOR"
  }
}
```

**Auth Required:** Yes

**Permissions:** Owner or contributors with ADMIN role

**Roles:**
- `VIEWER`: Read-only access
- `EDITOR`: Can add/remove songs
- `ADMIN`: Can manage contributors

---

#### Remove Contributor

```graphql
mutation RemoveContributor($playlistId: ID!, $userId: ID!) {
  removeContributor(playlistId: $playlistId, userId: $userId)
}
```

**Variables:**
```json
{
  "playlistId": "playlist_id_here",
  "userId": "user_id_here"
}
```

**Auth Required:** Yes

**Permissions:** Owner or contributors with ADMIN role

**Returns:** `true` on success

---

#### Update Contributor Role

```graphql
mutation UpdateContributorRole($playlistId: ID!, $userId: ID!, $role: ContributorRole!) {
  updateContributorRole(playlistId: $playlistId, userId: $userId, role: $role) {
    id
    user {
      username
    }
    role
    updatedAt
  }
}
```

**Variables:**
```json
{
  "playlistId": "playlist_id_here",
  "userId": "user_id_here",
  "role": "ADMIN"
}
```

**Auth Required:** Yes

**Permissions:** Owner or contributors with ADMIN role

---

### Subscriptions

#### Song Added to Playlist

```graphql
subscription OnSongAdded($playlistId: ID!) {
  songAddedToPlaylist(playlistId: $playlistId) {
    id
    order
    song {
      id
      title
      artist
      duration
    }
    addedBy {
      username
    }
    createdAt
  }
}
```

**Variables:**
```json
{
  "playlistId": "playlist_id_here"
}
```

**Auth Required:** Yes

**Permissions:** Owner or contributors

**Trigger:** When a song is added to the specified playlist

**Use Case:** Real-time updates for collaborative playlists

---

## REST API

### Upload Audio File

**Endpoint:** `POST /api/upload/upload`

**Content-Type:** `multipart/form-data`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Form Data:**
- `audio` (file): Audio file (MP3, WAV, OGG, FLAC, AAC, M4A)
- `title` (text): Song title
- `artist` (text): Artist name
- `duration` (text): Duration in seconds

**Example with cURL:**
```bash
curl -X POST http://localhost:4000/api/upload/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@/path/to/song.mp3" \
  -F "title=Bohemian Rhapsody" \
  -F "artist=Queen" \
  -F "duration=354"
```

**Success Response (200):**
```json
{
  "success": true,
  "fileId": "674d8f9a1234567890abcdef",
  "filename": "song.mp3",
  "size": 5242880,
  "message": "File uploaded successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid file type. Only audio files are allowed."
}
```

**Limitations:**
- Maximum file size: 50MB
- Supported formats: MP3, WAV, OGG, FLAC, AAC, M4A

---

### Stream Audio File

**Endpoint:** `GET /api/upload/stream/:fileId`

**Parameters:**
- `fileId` (path): The file ID returned from upload

**Example:**
```
GET http://localhost:4000/api/upload/stream/674d8f9a1234567890abcdef
```

**Response:** Audio stream

**Headers:**
- `Content-Type`: `audio/mpeg` (or appropriate MIME type)
- `Accept-Ranges`: `bytes`

**Auth Required:** No

**Use in HTML:**
```html
<audio controls>
  <source src="http://localhost:4000/api/upload/stream/674d8f9a1234567890abcdef" type="audio/mpeg">
  Your browser does not support the audio element.
</audio>
```

---

### Health Check

**Endpoint:** `GET /health`

**Example:**
```
GET http://localhost:4000/health
```

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-12-16T10:30:45.123Z"
}
```

**Auth Required:** No

---

## Error Handling

### GraphQL Errors

GraphQL errors follow this format:

```json
{
  "errors": [
    {
      "message": "Not authenticated",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ],
  "data": null
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHENTICATED` | No valid authentication token provided |
| `FORBIDDEN` | User doesn't have permission for this action |
| `BAD_USER_INPUT` | Invalid input data |
| `NOT_FOUND` | Resource not found |
| `INTERNAL_SERVER_ERROR` | Server error |

### REST API Errors

REST errors follow this format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not Found |
| `500` | Internal Server Error |

---

## Rate Limiting

Currently, there is no rate limiting implemented. In production, consider implementing:

- Authentication rate limiting (login attempts)
- File upload rate limiting
- GraphQL query complexity limiting

---

## Best Practices

### 1. Always Include Required Fields

When querying, include all required fields to avoid errors:

```graphql
query Playlist {
  playlist(id: "123") {
    id  # Always required for GraphQL types
    title
  }
}
```

### 2. Use Variables for Dynamic Values

Instead of inline values:

```graphql
# Good
mutation CreatePlaylist($input: CreatePlaylistInput!) {
  createPlaylist(input: $input) {
    id
  }
}

# Avoid
mutation CreatePlaylist {
  createPlaylist(input: { title: "Hardcoded Title" }) {
    id
  }
}
```

### 3. Handle Errors Gracefully

Always check for errors in responses:

```javascript
const response = await fetch('/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ query, variables })
});

const result = await response.json();

if (result.errors) {
  console.error('GraphQL Errors:', result.errors);
  // Handle errors
}
```

### 4. Use Subscriptions for Real-time Updates

For collaborative features, use subscriptions instead of polling:

```javascript
// WebSocket connection
const client = new WebSocket('ws://localhost:4000/graphql', 'graphql-ws');

// Subscribe to playlist updates
const subscription = {
  query: `
    subscription {
      songAddedToPlaylist(playlistId: "123") {
        id
        song { title }
      }
    }
  `
};
```

---

## Testing the API

### Using GraphQL Playground

1. Start the server: `npm run dev`
2. Open `http://localhost:4000/graphql`
3. Use the Docs tab to explore the schema
4. Add authentication header in HTTP HEADERS tab

### Using Postman/Insomnia

1. Create a new GraphQL request
2. Set URL to `http://localhost:4000/graphql`
3. Add authentication header
4. Write your query/mutation
5. Add variables in the Variables section

### Using cURL

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "query { me { id username email } }"
  }'
```

---

## Support

For issues or questions:
1. Check the [main README](README.md)
2. Check the [Music Upload Guide](MUSIC_UPLOAD_GUIDE.md)
3. Open an issue on GitHub

---

**Last Updated:** December 2024
