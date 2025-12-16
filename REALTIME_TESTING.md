# 🔄 Real-time Subscriptions Testing Guide

This guide provides step-by-step instructions for testing GraphQL Subscriptions (real-time updates) in the MERN Playlist Manager.

## Prerequisites

1. Server must be running (`npm run dev` in `server/` directory)
2. MongoDB and Redis must be running (via `docker-compose up -d`)
3. You need a valid JWT token (obtained via login or registration)

## WebSocket Connection

The application uses `graphql-ws` protocol for WebSocket connections.

**WebSocket URL**: `ws://localhost:4000/graphql`

## Testing Subscriptions

### Method 1: Using GraphQL Playground

1. **Open GraphQL Playground**: Navigate to `http://localhost:4000/graphql`

2. **Get Authentication Token**:
   ```graphql
   mutation Login {
     login(input: {
       email: "alice@example.com"
       password: "password123"
     }) {
       token
       user {
         id
         email
       }
     }
   }
   ```

3. **Copy the token** from the response

4. **Configure WebSocket Connection**:
   - In GraphQL Playground, look for connection settings
   - Add header: `Authorization: Bearer YOUR_TOKEN_HERE`
   - Or use the connection params in the subscription

5. **Subscribe to an Event**:

   **Example 1: Subscribe to Playlist Updates**
   ```graphql
   subscription {
     playlistUpdated(playlistId: "YOUR_PLAYLIST_ID") {
       id
       title
       description
       isPublic
       updatedAt
     }
   }
   ```

   **Example 2: Subscribe to Song Additions**
   ```graphql
   subscription {
     songAddedToPlaylist(playlistId: "YOUR_PLAYLIST_ID") {
       id
       order
       song {
         id
         title
         artist
         duration
       }
       playlist {
         id
         title
       }
       addedBy {
         id
         username
       }
     }
   }
   ```

6. **Trigger the Event** (in another tab or tool):
   - Update the playlist:
     ```graphql
     mutation {
       updatePlaylist(
         id: "YOUR_PLAYLIST_ID"
         input: { title: "Updated Title" }
       ) {
         id
         title
       }
     }
     ```
   - Or add a song to the playlist:
     ```graphql
     mutation {
       addSongToPlaylist(
         playlistId: "YOUR_PLAYLIST_ID"
         songId: "YOUR_SONG_ID"
       ) {
         id
       }
     }
     ```

7. **Observe Real-time Update**: The subscription should receive the update immediately!

### Method 2: Using Apollo Client (Frontend)

If you're using the frontend application:

1. **Open the application** in your browser
2. **Navigate to a playlist** you have access to
3. **Open browser DevTools** → Network tab → Filter by WS (WebSocket)
4. **In another browser tab/window**, make changes to the playlist
5. **Observe WebSocket messages** in the DevTools showing real-time updates

### Method 3: Using Node.js Script

Create a test script to verify subscriptions:

```javascript
import { createClient } from 'graphql-ws';
import WebSocket from 'ws';

const client = createClient({
  url: 'ws://localhost:4000/graphql',
  connectionParams: {
    authorization: 'Bearer YOUR_TOKEN_HERE',
  },
  webSocketImpl: WebSocket,
});

const unsubscribe = client.subscribe(
  {
    query: `
      subscription {
        songAddedToPlaylist(playlistId: "YOUR_PLAYLIST_ID") {
          id
          song {
            title
            artist
          }
        }
      }
    `,
  },
  {
    next: (data) => {
      console.log('📨 Received update:', data);
    },
    error: (err) => {
      console.error('❌ Subscription error:', err);
    },
    complete: () => {
      console.log('✅ Subscription completed');
    },
  }
);

// Keep script running
setTimeout(() => {
  unsubscribe();
  process.exit(0);
}, 60000); // Run for 60 seconds
```

## Available Subscriptions

### 1. `serverTime`
Simple subscription that emits server time every second (for testing WebSocket connection).

```graphql
subscription {
  serverTime
}
```

### 2. `userCreated`
Subscribe to new user registrations.

```graphql
subscription {
  userCreated {
    id
    username
    email
    createdAt
  }
}
```

### 3. `playlistUpdated(playlistId: ID!)`
Subscribe to updates for a specific playlist.

**Requirements**:
- Must be authenticated
- Must have access to the playlist (owner or contributor)

```graphql
subscription {
  playlistUpdated(playlistId: "PLAYLIST_ID") {
    id
    title
    description
    isPublic
    updatedAt
  }
}
```

### 4. `songAddedToPlaylist(playlistId: ID!)`
Subscribe to song additions in a specific playlist.

**Requirements**:
- Must be authenticated
- Must have VIEWER+ access to the playlist

```graphql
subscription {
  songAddedToPlaylist(playlistId: "PLAYLIST_ID") {
    id
    order
    song {
      id
      title
      artist
    }
    addedBy {
      id
      username
    }
  }
}
```

### 5. `songRemovedFromPlaylist(playlistId: ID!)`
Subscribe to song removals from a specific playlist.

```graphql
subscription {
  songRemovedFromPlaylist(playlistId: "PLAYLIST_ID")
}
```

### 6. `contributorAdded(playlistId: ID!)`
Subscribe to contributor additions for a specific playlist.

```graphql
subscription {
  contributorAdded(playlistId: "PLAYLIST_ID") {
    id
    user {
      id
      username
      email
    }
    role
    createdAt
  }
}
```

## Testing Scenarios

### Scenario 1: Multi-user Collaboration

1. **User A** subscribes to `playlistUpdated` for a playlist
2. **User B** (as contributor) updates the playlist
3. **User A** receives the update in real-time

### Scenario 2: Song Management

1. **User A** subscribes to `songAddedToPlaylist`
2. **User B** adds a song to the playlist
3. **User A** sees the new song appear immediately

### Scenario 3: Access Control

1. **User A** tries to subscribe to a private playlist they don't have access to
2. Subscription should be rejected or filtered out
3. Only authorized users receive updates

## Troubleshooting

### Subscription Not Receiving Updates

1. **Check Authentication**: Ensure you have a valid JWT token
2. **Check Access**: Verify you have access to the playlist (owner or contributor)
3. **Check WebSocket Connection**: Look for connection errors in browser console
4. **Check Server Logs**: Look for subscription-related errors

### WebSocket Connection Failed

1. **Verify Server is Running**: Check `http://localhost:4000/health`
2. **Check Redis**: If using Redis PubSub, ensure Redis is running
3. **Check Network**: Ensure no firewall is blocking WebSocket connections
4. **Check CORS**: Ensure WebSocket origin is allowed

### Subscription Filtering Issues

Subscriptions use `withFilter` to ensure users only receive updates for playlists they have access to. If you're receiving updates you shouldn't, check:

1. The `checkPlaylistAccess` function in resolvers
2. Subscription filter logic in `typeDefs.ts`
3. Contributor roles and permissions

## Example: Complete Test Flow

1. **Start Services**:
   ```bash
   docker-compose up -d
   cd server && npm run dev
   ```

2. **Seed Database** (optional):
   ```bash
   cd server && npm run seed
   ```

3. **Login and Get Token**:
   ```graphql
   mutation {
     login(input: {
       email: "alice@example.com"
       password: "password123"
     }) {
       token
     }
   }
   ```

4. **Create a Playlist**:
   ```graphql
   mutation {
     createPlaylist(input: {
       title: "Test Playlist"
       description: "For testing subscriptions"
       isPublic: false
     }) {
       id
       title
     }
   }
   ```

5. **Subscribe to Updates** (in GraphQL Playground):
   ```graphql
   subscription {
     playlistUpdated(playlistId: "CREATED_PLAYLIST_ID") {
       id
       title
     }
   }
   ```

6. **Trigger Update** (in another GraphQL Playground tab):
   ```graphql
   mutation {
     updatePlaylist(
       id: "CREATED_PLAYLIST_ID"
       input: { title: "Updated Title" }
     ) {
       id
       title
     }
   }
   ```

7. **See Real-time Update**: The subscription should immediately show the updated title!

## Additional Resources

- [GraphQL Subscriptions Documentation](https://www.apollographql.com/docs/apollo-server/data/subscriptions/)
- [graphql-ws Documentation](https://github.com/enisdenjo/graphql-ws)
- [Apollo Client Subscriptions](https://www.apollographql.com/docs/react/data/subscriptions/)

---

**Happy Testing! 🎵**
