# 🏗️ Architecture Documentation

This document describes the technical architecture of the MERN Music Playlist Manager.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Database Schema](#database-schema)
- [Authentication Flow](#authentication-flow)
- [File Upload & Storage](#file-upload--storage)
- [Real-time Communication](#real-time-communication)
- [Security Considerations](#security-considerations)
- [Scalability](#scalability)

---

## Overview

The MERN Music Playlist Manager is a full-stack application built using:
- **MongoDB** - NoSQL database with GridFS for file storage
- **Express.js** - Node.js web framework
- **Node.js** - JavaScript runtime
- **TypeScript** - Type-safe development
- **GraphQL** - Flexible API layer
- **WebSocket** - Real-time communication

### Key Features

1. **Hybrid API Design**: GraphQL for data operations, REST for file uploads
2. **GridFS Storage**: Efficient storage and streaming of large audio files
3. **Real-time Updates**: WebSocket subscriptions for collaborative features
4. **JWT Authentication**: Secure, stateless authentication
5. **Role-based Access Control**: Fine-grained permissions for playlist collaboration

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Client Layer                      │
│  (Web Browser, Mobile App, GraphQL Playground, etc.)   │
└─────────────────────────────────────────────────────────┘
                            │
                    HTTP/WebSocket
                            │
┌─────────────────────────────────────────────────────────┐
│                      Server Layer                        │
│ ┌─────────────────┐  ┌─────────────────┐               │
│ │   Express.js    │  │   Apollo Server │               │
│ │   (REST API)    │  │    (GraphQL)    │               │
│ └─────────────────┘  └─────────────────┘               │
│           │                    │                         │
│ ┌─────────────────────────────────────────┐             │
│ │        Authentication Middleware         │             │
│ │              (JWT Validation)            │             │
│ └─────────────────────────────────────────┘             │
│           │                    │                         │
│ ┌─────────────────┐  ┌─────────────────┐               │
│ │  Upload Routes  │  │   Resolvers     │               │
│ │   (Multer)      │  │   (Business     │               │
│ │                 │  │     Logic)      │               │
│ └─────────────────┘  └─────────────────┘               │
│           │                    │                         │
│ ┌─────────────────────────────────────────┐             │
│ │          Mongoose Models (ODM)           │             │
│ └─────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────┘
                            │
                    MongoDB Protocol
                            │
┌─────────────────────────────────────────────────────────┐
│                    Database Layer                        │
│ ┌─────────────────┐  ┌─────────────────┐               │
│ │   MongoDB       │  │   GridFS        │               │
│ │  (Collections)  │  │  (File Storage) │               │
│ └─────────────────┘  └─────────────────┘               │
│  • users            • fs.files                          │
│  • songs            • fs.chunks                         │
│  • playlists                                            │
│  • playlistsongs                                        │
│  • contributors                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend Framework

```typescript
// Core Technologies
- Node.js v18+         // JavaScript runtime
- Express.js v4        // Web framework
- TypeScript v5        // Type-safe JavaScript
- Apollo Server v4     // GraphQL server
```

### Database

```typescript
- MongoDB v8           // NoSQL database
- Mongoose v8          // ODM (Object Data Modeling)
- GridFS               // File storage system
```

### Authentication & Security

```typescript
- jsonwebtoken v9      // JWT token generation/validation
- bcryptjs v2          // Password hashing
- CORS v2              // Cross-Origin Resource Sharing
```

### File Handling

```typescript
- Multer v2            // Multipart form data handling
- GridFS Stream        // File streaming from GridFS
```

### Real-time Communication

```typescript
- graphql-ws v5        // WebSocket for GraphQL subscriptions
- ws v8                // WebSocket library
- graphql-subscriptions v2  // PubSub for subscriptions
```

### Development Tools

```typescript
- TypeScript v5        // Static typing
- ESLint v8            // Code linting
- Prettier v3          // Code formatting
- Jest v29             // Testing framework
- Nodemon v3           // Development auto-reload
```

---

## Database Schema

### Users Collection

```typescript
{
  _id: ObjectId,
  username: String,        // unique, indexed
  email: String,           // unique, indexed
  password: String,        // bcrypt hashed
  firstName: String,
  lastName: String,
  isDeleted: Boolean,      // soft delete flag
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `username`: Unique
- `email`: Unique
- `isDeleted`: For filtering deleted users

---

### Songs Collection

```typescript
{
  _id: ObjectId,
  title: String,
  artist: String,
  duration: Number,        // in seconds
  fileId: String,          // GridFS file reference
  uploadedBy: ObjectId,    // reference to User
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `uploadedBy`: For user's songs
- `isDeleted`: For filtering
- `fileId`: For file lookups

---

### Playlists Collection

```typescript
{
  _id: ObjectId,
  title: String,
  description: String,
  owner: ObjectId,         // reference to User
  isPublic: Boolean,       // public/private flag
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `owner`: For user's playlists
- `isPublic`: For public playlist queries
- `isDeleted`: For filtering

---

### PlaylistSongs Collection (Junction Table)

```typescript
{
  _id: ObjectId,
  playlist: ObjectId,      // reference to Playlist
  song: ObjectId,          // reference to Song
  addedBy: ObjectId,       // reference to User
  order: Number,           // song position in playlist
  isDeleted: Boolean,
  createdAt: Date
}
```

**Indexes:**
- `playlist`: For playlist queries
- `order`: For sorting songs
- Compound: `(playlist, song)` for uniqueness
- Compound: `(playlist, order)` for ordering

---

### Contributors Collection

```typescript
{
  _id: ObjectId,
  playlist: ObjectId,      // reference to Playlist
  user: ObjectId,          // reference to User
  role: String,            // VIEWER, EDITOR, ADMIN
  invitedBy: ObjectId,     // reference to User
  isDeleted: Boolean,
  createdAt: Date
}
```

**Indexes:**
- `playlist`: For playlist contributors
- Compound: `(playlist, user)` for uniqueness

---

### GridFS Collections

#### fs.files

```typescript
{
  _id: ObjectId,
  length: Number,          // file size in bytes
  chunkSize: Number,       // chunk size (default 255KB)
  uploadDate: Date,
  filename: String,
  contentType: String,     // MIME type
  metadata: {
    title: String,
    artist: String,
    duration: Number
  }
}
```

#### fs.chunks

```typescript
{
  _id: ObjectId,
  files_id: ObjectId,      // reference to fs.files
  n: Number,               // chunk number
  data: Binary             // chunk data
}
```

**Indexes:**
- Compound: `(files_id, n)` for efficient retrieval

---

## Authentication Flow

### Registration

```
┌────────┐                     ┌────────┐                   ┌─────────┐
│ Client │                     │ Server │                   │   DB    │
└────┬───┘                     └───┬────┘                   └────┬────┘
     │                             │                             │
     │ 1. Register Request         │                             │
     │────────────────────────────>│                             │
     │                             │                             │
     │                             │ 2. Hash Password            │
     │                             │                             │
     │                             │ 3. Create User              │
     │                             │────────────────────────────>│
     │                             │                             │
     │                             │ 4. User Created             │
     │                             │<────────────────────────────│
     │                             │                             │
     │                             │ 5. Generate JWT             │
     │                             │                             │
     │ 6. Return Token + User      │                             │
     │<────────────────────────────│                             │
     │                             │                             │
```

### Login

```
┌────────┐                     ┌────────┐                   ┌─────────┐
│ Client │                     │ Server │                   │   DB    │
└────┬───┘                     └───┬────┘                   └────┬────┘
     │                             │                             │
     │ 1. Login Request            │                             │
     │────────────────────────────>│                             │
     │                             │                             │
     │                             │ 2. Find User by Email       │
     │                             │────────────────────────────>│
     │                             │                             │
     │                             │ 3. Return User              │
     │                             │<────────────────────────────│
     │                             │                             │
     │                             │ 4. Compare Passwords        │
     │                             │                             │
     │                             │ 5. Generate JWT             │
     │                             │                             │
     │ 6. Return Token + User      │                             │
     │<────────────────────────────│                             │
     │                             │                             │
```

### JWT Structure

```typescript
{
  header: {
    alg: "HS256",
    typ: "JWT"
  },
  payload: {
    userId: "user_id_here",
    iat: 1234567890,    // Issued At
    exp: 1235172690     // Expiration (7 days)
  },
  signature: "..."
}
```

---

## File Upload & Storage

### Upload Flow

```
┌────────┐              ┌────────┐              ┌─────────┐
│ Client │              │ Server │              │ GridFS  │
└────┬───┘              └───┬────┘              └────┬────┘
     │                      │                        │
     │ 1. Upload File       │                        │
     │ (multipart/form-data)│                        │
     │─────────────────────>│                        │
     │                      │                        │
     │                      │ 2. Validate JWT        │
     │                      │                        │
     │                      │ 3. Validate File Type  │
     │                      │                        │
     │                      │ 4. Create Write Stream │
     │                      │───────────────────────>│
     │                      │                        │
     │                      │ 5. Stream File Data    │
     │                      │───────────────────────>│
     │                      │                        │
     │                      │ 6. File Stored         │
     │                      │<───────────────────────│
     │                      │                        │
     │ 7. Return fileId     │                        │
     │<─────────────────────│                        │
     │                      │                        │
```

### Streaming Flow

```
┌────────┐              ┌────────┐              ┌─────────┐
│ Client │              │ Server │              │ GridFS  │
└────┬───┘              └───┬────┘              └────┬────┘
     │                      │                        │
     │ 1. Request Stream    │                        │
     │ GET /stream/:fileId  │                        │
     │─────────────────────>│                        │
     │                      │                        │
     │                      │ 2. Create Read Stream  │
     │                      │───────────────────────>│
     │                      │                        │
     │                      │ 3. Stream Chunks       │
     │                      │<───────────────────────│
     │                      │                        │
     │ 4. Audio Stream      │                        │
     │<─────────────────────│                        │
     │  (chunked transfer)  │                        │
     │                      │                        │
```

### GridFS Benefits

1. **Chunked Storage**: Files split into 255KB chunks
2. **Efficient Streaming**: Can stream without loading entire file
3. **Metadata Support**: Store song info with files
4. **Scalability**: Works well with replica sets
5. **No Filesystem**: Files in database, easier deployment

---

## Real-time Communication

### WebSocket Connection Flow

```
┌────────┐                          ┌────────┐
│ Client │                          │ Server │
└────┬───┘                          └───┬────┘
     │                                  │
     │ 1. WebSocket Handshake           │
     │ ws://localhost:4000/graphql      │
     │─────────────────────────────────>│
     │                                  │
     │ 2. Connection Params (JWT)       │
     │─────────────────────────────────>│
     │                                  │
     │                                  │ 3. Validate JWT
     │                                  │
     │ 4. Connection Acknowledged       │
     │<─────────────────────────────────│
     │                                  │
     │ 5. Subscribe to Playlist         │
     │─────────────────────────────────>│
     │                                  │
     │                                  │ 6. Add to PubSub
     │                                  │
     │ 6. Subscription Acknowledged     │
     │<─────────────────────────────────│
     │                                  │
     │         ... waiting ...          │
     │                                  │
     │                                  │ Song Added Event
     │                                  │
     │ 7. New Song Event                │
     │<─────────────────────────────────│
     │                                  │
```

### PubSub Architecture

```typescript
// PubSub instance
const pubsub = new PubSub();

// Publishing an event
pubsub.publish('SONG_ADDED_TO_PLAYLIST', {
  playlistId: '123',
  songData: { ... }
});

// Subscribing to events
pubsub.asyncIterator(['SONG_ADDED_TO_PLAYLIST']);
```

### Subscription Filtering

```typescript
// Only send events for specific playlist
subscribe: {
  songAddedToPlaylist: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(['SONG_ADDED_TO_PLAYLIST']),
      (payload, variables) => {
        return payload.playlistId === variables.playlistId;
      }
    )
  }
}
```

---

## Security Considerations

### 1. Authentication

```typescript
// JWT Secret
- Stored in environment variable
- Minimum 32 characters recommended
- Different secrets for dev/staging/production

// Token Expiration
- 7 days default
- Refresh tokens not implemented (future enhancement)
```

### 2. Password Security

```typescript
// Bcrypt Configuration
- Salt rounds: 10 (default)
- Auto-salt generation
- One-way hashing (cannot be decrypted)
```

### 3. Input Validation

```typescript
// GraphQL Schema Validation
- Type checking via GraphQL schema
- Required fields enforced
- Custom validators in resolvers

// File Upload Validation
- MIME type checking
- File size limits (50MB)
- Allowed extensions only
```

### 4. Access Control

```typescript
// Permission Levels
- Owner: Full control
- Admin: Manage contributors, edit playlist
- Editor: Add/remove songs
- Viewer: Read-only access

// Middleware Checks
- JWT validation
- User existence check
- Permission verification
```

### 5. CORS Configuration

```typescript
// Development
origin: true  // Allow all origins

// Production
origin: process.env.CLIENT_URL  // Specific domain only
```

### 6. Data Protection

```typescript
// Soft Delete
- Never permanently delete data
- Use isDeleted flag
- Preserve user history

// Password Exposure
- Never return password in queries
- Select('-password') in Mongoose
```

---

## Scalability

### Current Limitations

1. **Single Server**: No horizontal scaling yet
2. **In-Memory PubSub**: Subscriptions don't work across instances
3. **No Caching**: Database queries on every request
4. **No CDN**: Static files served from server

### Scaling Recommendations

#### 1. Horizontal Scaling

```
┌─────────────┐
│ Load        │
│ Balancer    │
└──────┬──────┘
       │
   ┌───┴───┬────────┬────────┐
   │       │        │        │
┌──▼──┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──┐
│ App │ │ App │ │ App │ │ App │
│  1  │ │  2  │ │  3  │ │  4  │
└──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘
   │       │        │        │
   └───┬───┴────────┴────────┘
       │
   ┌───▼────┐
   │ MongoDB│
   │ Cluster│
   └────────┘
```

**Requirements:**
- Sticky sessions for WebSocket
- Redis PubSub for cross-instance subscriptions
- Shared session store (Redis)

#### 2. Database Scaling

```typescript
// Replica Set
- 1 Primary + 2 Secondary nodes
- Read preference: secondaryPreferred
- Automatic failover

// Sharding (for very large scale)
- Shard key: userId (for user data)
- Shard key: playlistId (for playlist data)
```

#### 3. Caching Strategy

```typescript
// Redis Cache
- Cache user data (5 min TTL)
- Cache playlist metadata (1 min TTL)
- Cache public playlists (5 min TTL)
- Invalidate on updates

// CDN for Audio Files
- Upload to S3 + CloudFront
- Reduce server load
- Faster global delivery
```

#### 4. File Storage Scaling

```typescript
// GridFS → Object Storage Migration
- Move to AWS S3, Google Cloud Storage, etc.
- Keep fileId for backward compatibility
- Implement signed URLs for security
- Enable CDN distribution
```

#### 5. Rate Limiting

```typescript
// Implementation Needed
- Per-user request limits
- File upload limits
- Subscription connection limits
- GraphQL query complexity limits
```

---

## Performance Optimization

### Current Optimizations

1. **Database Indexes**: On frequently queried fields
2. **Mongoose Lean**: Use `.lean()` for read-only queries
3. **Pagination**: Limit query results
4. **Streaming**: Files streamed, not loaded in memory

### Future Optimizations

1. **DataLoader**: Batch and cache database queries
2. **Query Complexity Analysis**: Prevent expensive queries
3. **Compression**: Gzip/Brotli for responses
4. **HTTP/2**: Multiplexing for better performance
5. **Worker Threads**: CPU-intensive tasks

---

## Monitoring & Logging

### Recommended Setup

```typescript
// Logging
- Winston or Pino for structured logging
- Log levels: error, warn, info, debug
- Log rotation and archival

// Monitoring
- Application Performance Monitoring (APM)
  - New Relic, DataDog, or Sentry
- Database monitoring
  - MongoDB Atlas built-in monitoring
- Real-time alerts
  - Error rate thresholds
  - Response time thresholds
```

---

## Future Enhancements

### Short-term (1-3 months)

1. **Search Functionality**: Full-text search for songs/playlists
2. **Playlist Sharing**: Public URLs for playlists
3. **Like/Favorite**: User engagement features
4. **Play History**: Track what users listen to
5. **Playlist Cover Images**: Visual customization

### Medium-term (3-6 months)

1. **Mobile App**: React Native or Flutter
2. **Social Features**: Follow users, comments
3. **Recommendations**: AI-based song suggestions
4. **Analytics Dashboard**: Playlist/song statistics
5. **Export/Import**: Playlist backup and restore

### Long-term (6-12 months)

1. **Live Radio**: Real-time streaming rooms
2. **Podcast Support**: Audio podcast management
3. **Music Discovery**: Genre-based exploration
4. **API Versioning**: Stable public API
5. **Third-party Integration**: Spotify, Apple Music sync

---

## Contributing to Architecture

When proposing architectural changes:

1. **Document the Problem**: What issue are you solving?
2. **Propose Solution**: How does your change help?
3. **Consider Impact**: Backward compatibility, performance
4. **Update Docs**: Keep architecture docs up-to-date
5. **Test Thoroughly**: Integration and load tests

---

**Last Updated:** December 2024
