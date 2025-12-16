# 🔄 Real-time Subscriptions Testing Guide

This guide provides detailed instructions for testing real-time subscriptions in the MERN Music Playlist Manager application.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Testing Methods](#testing-methods)
  - [Method 1: GraphQL Playground](#method-1-graphql-playground)
  - [Method 2: Frontend Application](#method-2-frontend-application)
  - [Method 3: Multiple Browser Windows](#method-3-multiple-browser-windows)
- [Available Subscriptions](#available-subscriptions)
- [Troubleshooting](#troubleshooting)

## Overview

The application uses GraphQL Subscriptions over WebSocket to provide real-time updates. When one user makes a change (e.g., adds a song to a playlist), all other users viewing that playlist will see the update instantly without refreshing the page.

## Prerequisites

Before testing real-time subscriptions, ensure:

1. ✅ MongoDB and Redis are running (via Docker)
2. ✅ Backend server is running on `http://localhost:4000`
3. ✅ You have a valid JWT token (from login/register)
4. ✅ You have at least one playlist created

## Testing Methods

### Method 1: GraphQL Playground

This method is best for testing backend subscriptions directly.

#### Step 1: Start the Server

```bash
cd server
npm run dev
```

#### Step 2: Open GraphQL Playground

Navigate to `http://localhost:4000/graphql` in your browser.

#### Step 3: Get Authentication Token

**Option A: Register a new user**
```graphql
mutation Register {
  register(input: {
    username: "testuser"
    email: "test@example.com"
    password: "Test123!"
    firstName: "Test"
    lastName: "User"
  }) {
    token
    user {
      id
      username
    }
  }
}
```

**Option B: Login with existing user**
```graphql
mutation Login {
  login(input: {
    email: "alice@example.com"
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

**Copy the `token` from the response!**

#### Step 4: Create or Get a Playlist ID

**Get your playlists:**
```graphql
query MyPlaylists {
  myPlaylists {
    id
    title
  }
}
```

**Or create a new playlist:**
```graphql
mutation CreatePlaylist {
  createPlaylist(input: {
    title: "Test Playlist"
    description: "For testing subscriptions"
    isPublic: true
  }) {
    id
    title
  }
}
```

**Copy the playlist `id`!**

#### Step 5: Set Up Subscription

1. In GraphQL Playground, click on the **"Subscriptions"** tab (bottom left)
2. Add the authorization header:
   ```json
   {
     "authorization": "Bearer YOUR_TOKEN_HERE"
   }
   ```

#### Step 6: Subscribe to Events

**Subscribe to song additions:**
```graphql
subscription SongAdded {
  songAddedToPlaylist(playlistId: "YOUR_PLAYLIST_ID") {
    id
    order
    song {
      id
      title
      artist
      duration
    }
    addedBy {
      id
      username
    }
    createdAt
  }
}
```

**Subscribe to playlist updates:**
```graphql
subscription PlaylistUpdated {
  playlistUpdated(playlistId: "YOUR_PLAYLIST_ID") {
    id
    title
    description
    isPublic
    updatedAt
  }
}
```

**Subscribe to contributor additions:**
```graphql
subscription ContributorAdded {
  contributorAdded(playlistId: "YOUR_PLAYLIST_ID") {
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
}
```

#### Step 7: Trigger an Event

Open **another tab** with GraphQL Playground (or use the frontend) and perform an action:

**Add a song to the playlist:**
```graphql
mutation AddSong {
  addSongToPlaylist(
    playlistId: "YOUR_PLAYLIST_ID"
    songId: "YOUR_SONG_ID"
  ) {
    id
    song {
      title
      artist
    }
  }
}
```

**Update the playlist:**
```graphql
mutation UpdatePlaylist {
  updatePlaylist(
    id: "YOUR_PLAYLIST_ID"
    input: {
      title: "Updated Title"
      description: "Updated description"
    }
  ) {
    id
    title
    description
  }
}
```

#### Step 8: See Real-time Update

The subscription in the first tab should immediately show the new event data!

---

### Method 2: Frontend Application

This is the recommended method for testing the full user experience.

#### Step 1: Start Both Server and Client

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev
```

#### Step 2: Access the Frontend

Open `http://localhost:3000` in your browser.

#### Step 3: Login

Use test credentials:
- Email: `alice@example.com`
- Password: `password123`

#### Step 4: Navigate to a Playlist

1. Click on "My Playlists" in the navigation
2. Click on any playlist to view details
3. Note the URL: `/playlists/[id]`

#### Step 5: Test Real-time Updates

**Option A: Add a song**
1. Go to the Songs page (`/songs`)
2. If you have songs, note their IDs
3. Go back to the playlist
4. Add a song (if the UI supports it)
5. The song should appear in real-time

**Option B: Open in multiple tabs**
1. Open the same playlist in another browser tab
2. In one tab, add a song or make a change
3. Watch it appear automatically in the other tab!

---

### Method 3: Multiple Browser Windows

This method simulates multiple users collaborating.

#### Step 1: Prepare Two Browser Windows

1. **Window 1**: Login as `alice@example.com`
2. **Window 2**: Login as `bob@example.com` (or open in incognito)

#### Step 2: Open the Same Playlist

Both users navigate to the same playlist (must be public or shared).

#### Step 3: One User Makes a Change

- User 1 adds a song to the playlist
- User 1 updates the playlist title

#### Step 4: Other User Sees Update

- User 2 should see the changes appear automatically
- No page refresh needed!

---

## Available Subscriptions

The application supports the following real-time subscriptions:

### 1. `songAddedToPlaylist(playlistId: ID!)`

Triggers when a song is added to a playlist.

**Example:**
```graphql
subscription {
  songAddedToPlaylist(playlistId: "playlist_id") {
    id
    song {
      title
      artist
    }
    addedBy {
      username
    }
  }
}
```

### 2. `songRemovedFromPlaylist(playlistId: ID!)`

Triggers when a song is removed from a playlist.

**Example:**
```graphql
subscription {
  songRemovedFromPlaylist(playlistId: "playlist_id")
}
```

### 3. `playlistUpdated(playlistId: ID!)`

Triggers when playlist metadata is updated (title, description, isPublic).

**Example:**
```graphql
subscription {
  playlistUpdated(playlistId: "playlist_id") {
    id
    title
    description
    isPublic
  }
}
```

### 4. `contributorAdded(playlistId: ID!)`

Triggers when a new contributor is added to a playlist.

**Example:**
```graphql
subscription {
  contributorAdded(playlistId: "playlist_id") {
    id
    user {
      username
    }
    role
  }
}
```

### 5. `serverTime`

A simple subscription for testing WebSocket connectivity.

**Example:**
```graphql
subscription {
  serverTime
}
```

---

## Troubleshooting

### Subscription Not Receiving Updates

**Problem**: Subscription is set up but not receiving events.

**Solutions**:
1. ✅ Check that WebSocket connection is established (look for "WebSocket connection opened" in console)
2. ✅ Verify JWT token is valid and not expired
3. ✅ Ensure you have access to the playlist (it's public or you're a contributor)
4. ✅ Check that Redis is running (required for subscriptions)
5. ✅ Verify the playlist ID is correct

### WebSocket Connection Fails

**Problem**: Cannot establish WebSocket connection.

**Solutions**:
1. ✅ Check that server is running on port 4000
2. ✅ Verify WebSocket URL: `ws://localhost:4000/graphql`
3. ✅ Check browser console for connection errors
4. ✅ Ensure no firewall is blocking WebSocket connections
5. ✅ Try refreshing the page

### Events Not Triggering

**Problem**: Actions don't trigger subscription events.

**Solutions**:
1. ✅ Verify the mutation/query completed successfully
2. ✅ Check server logs for errors
3. ✅ Ensure Redis pub/sub is working
4. ✅ Verify the playlist ID matches in both subscription and mutation

### Frontend Not Showing Updates

**Problem**: Backend subscriptions work, but frontend doesn't update.

**Solutions**:
1. ✅ Check browser console for errors
2. ✅ Verify Apollo Client WebSocket link is configured
3. ✅ Check that `useSubscription` hook is properly implemented
4. ✅ Ensure component is re-rendering on data changes
5. ✅ Check network tab for WebSocket messages

---

## Example Test Scenario

### Complete Real-time Collaboration Test

1. **Setup**:
   - Start server and client
   - Login as Alice in Browser 1
   - Login as Bob in Browser 2 (or incognito)

2. **Alice creates a playlist**:
   - Navigate to `/playlists/new`
   - Create "Collaborative Playlist"
   - Make it public or add Bob as contributor

3. **Both open the playlist**:
   - Alice: `/playlists/[id]`
   - Bob: `/playlists/[id]`

4. **Bob adds a song**:
   - Bob navigates to songs page
   - Bob adds a song to the playlist
   - **Result**: Song appears in Alice's view automatically!

5. **Alice updates playlist**:
   - Alice edits the playlist title
   - **Result**: Bob sees the new title instantly!

6. **Success!** Real-time collaboration is working! 🎉

---

## Additional Resources

- [GraphQL Subscriptions Documentation](https://www.apollographql.com/docs/apollo-server/data/subscriptions/)
- [Apollo Client Subscriptions](https://www.apollographql.com/docs/react/data/subscriptions/)
- [WebSocket Protocol](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

---

**Happy Testing! 🚀**
