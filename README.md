# 🎵 MERN Music Playlist Manager

A full-stack music playlist management application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring real-time collaboration, file uploads with GridFS, and GraphQL API.

## ✨ Features

- **🔐 User Authentication**: JWT-based authentication with secure password hashing
- **🎵 Music Upload & Storage**: Upload music files (MP3, WAV, OGG, FLAC, AAC, M4A) stored in MongoDB GridFS
- **📝 Playlist Management**: Create, update, and delete playlists
- **🎧 Music Streaming**: Stream audio files directly from the server
- **👥 Collaborative Playlists**: Add contributors with different permission levels (Viewer, Editor, Admin)
- **🔄 Real-time Updates**: WebSocket subscriptions for live playlist updates
- **🎯 Song Organization**: Add, remove, and reorder songs in playlists
- **🔍 GraphQL API**: Powerful and flexible API with queries, mutations, and subscriptions
- **🗑️ Soft Delete**: Non-destructive deletion with recovery options

## 🚀 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Apollo Server** - GraphQL server
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **GridFS** - File storage system
- **GraphQL Subscriptions** - Real-time updates via WebSocket
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload middleware

### DevOps
- **Docker & Docker Compose** - Containerization
- **MongoDB Express** - Database GUI
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose**
- **npm** or **yarn** package manager
- **Git**

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Alibibib/s-mern-playlist.git
cd s-mern-playlist
```

### 2. Start MongoDB with Docker

```bash
docker-compose up -d
```

This will start:
- MongoDB on `localhost:27017`
- Mongo Express (GUI) on `localhost:8081`

### 3. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 4. Configure Environment Variables

**Backend (server/.env):**

Copy the example environment file and update it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=4000
NODE_ENV=development
# Database
MONGO_URI=mongodb://root:password@localhost:27017/mern-db?authSource=admin&directConnection=true
# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

⚠️ **Important**: Change `JWT_SECRET` to a secure random string in production!

**Frontend (client/.env.local):**
```bash
cd client
cp .env.example .env.local
```

Edit `client/.env.local`:
```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:4000/graphql
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 5. Start the Application

#### Development Mode

**Backend Server:**
```bash
cd server
npm run dev
```
Server will start on `http://localhost:4000`

**Frontend Client (in another terminal):**
```bash
cd client
npm run dev
```
Frontend will start on `http://localhost:3000`

#### Production Mode

**Backend:**
```bash
cd server
npm run build
npm start
```

**Frontend:**
```bash
cd client
npm run build
npm start
```

#### Using Docker Compose (All Services)

```bash
docker-compose up -d --build
```

This will start:
- MongoDB on `localhost:27017`
- Redis on `localhost:6379`
- Backend server on `localhost:4000`
- Frontend client on `localhost:3000`
- Mongo Express on `localhost:8081`

## 🎯 Quick Start

### 1. Access GraphQL Playground

Open your browser and navigate to:
```
http://localhost:4000/graphql
```

### 2. Register a User

```graphql
mutation Register {
  register(input: {
    username: "john_doe"
    email: "john@example.com"
    password: "SecurePass123"
    firstName: "John"
    lastName: "Doe"
  }) {
    token
    user {
      id
      username
      email
    }
  }
}
```

**Save the `token` from the response!**

### 3. Set Authentication Header

In GraphQL Playground, add the HTTP header:

```json
{
  "authorization": "Bearer YOUR_TOKEN_HERE"
}
```

### 4. Upload Music

Open `upload-music.html` in your browser:
- Enter your JWT token
- Fill in song details (title, artist, duration)
- Select an audio file
- Click "Upload Music"
- **Save the `fileId` from the response!**

### 5. Create a Song Entry

```graphql
mutation CreateSong {
  createSong(input: {
    title: "Bohemian Rhapsody"
    artist: "Queen"
    duration: 354
    fileId: "YOUR_FILE_ID_HERE"
  }) {
    id
    title
    artist
    duration
  }
}
```

### 6. Create a Playlist

```graphql
mutation CreatePlaylist {
  createPlaylist(input: {
    title: "My Rock Classics"
    description: "Best rock songs ever"
    isPublic: true
  }) {
    id
    title
    description
  }
}
```

### 7. Add Song to Playlist

```graphql
mutation AddSongToPlaylist {
  addSongToPlaylist(
    playlistId: "PLAYLIST_ID"
    songId: "SONG_ID"
  ) {
    id
    order
    song {
      title
      artist
    }
  }
}
```

### 8. Stream Music

Access the song at:
```
http://localhost:4000/api/upload/stream/YOUR_FILE_ID
```

Or use in HTML:
```html
<audio controls>
  <source src="http://localhost:4000/api/upload/stream/YOUR_FILE_ID" type="audio/mpeg">
</audio>
```

## 📁 Project Structure

```
s-mern-playlist/
├── server/                    # Backend application
│   ├── src/
│   │   ├── graphql/          # GraphQL schema and resolvers
│   │   │   ├── typeDefs.ts   # GraphQL type definitions
│   │   │   └── resolvers.ts  # GraphQL resolvers
│   │   ├── models/           # Mongoose models
│   │   │   ├── User.ts       # User model
│   │   │   ├── Song.ts       # Song model
│   │   │   ├── Playlist.ts   # Playlist model
│   │   │   ├── PlaylistSong.ts # Playlist-Song junction
│   │   │   └── Contributor.ts  # Contributor model
│   │   ├── middleware/       # Express middleware
│   │   │   └── auth.ts       # JWT authentication
│   │   ├── routes/           # REST API routes
│   │   │   └── upload.ts     # File upload endpoints
│   │   ├── utils/            # Utility functions
│   │   │   └── gridfs.ts     # GridFS configuration
│   │   └── index.ts          # Application entry point
│   ├── .env.example          # Environment variables template
│   ├── package.json          # Dependencies and scripts
│   └── tsconfig.json         # TypeScript configuration
├── client/                    # Frontend application (Next.js)
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   ├── login/            # Login page
│   │   ├── register/          # Register page
│   │   ├── playlists/        # Playlist pages
│   │   ├── songs/            # Songs page
│   │   └── profile/          # Profile page
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components
│   │   ├── auth/             # Auth components
│   │   ├── playlist/         # Playlist components
│   │   └── song/             # Song components
│   ├── lib/                   # Utilities and configuration
│   │   ├── apollo/           # Apollo Client setup
│   │   ├── store/            # Zustand stores
│   │   ├── graphql/          # GraphQL operations
│   │   └── validation/       # Zod schemas
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript types
│   └── package.json          # Dependencies and scripts
├── docker-compose.yml        # Docker services configuration
├── upload-music.html         # Music upload interface (legacy)
├── MUSIC_UPLOAD_GUIDE.md     # Detailed upload guide (Russian)
├── REALTIME_TESTING.md       # Real-time subscriptions testing guide
└── README.md                 # This file
```

## 🔌 API Documentation

### GraphQL Endpoints

**Endpoint**: `http://localhost:4000/graphql`
**WebSocket**: `ws://localhost:4000/graphql`

### REST Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/upload/upload` | Upload audio file | Yes |
| GET | `/api/upload/stream/:fileId` | Stream audio file | No |
| GET | `/health` | Health check | No |

### GraphQL Schema

#### Queries
- `me` - Get current user
- `users` - Get all users
- `songs` - Get all songs
- `playlists` - Get all playlists
- `playlist(id: ID!)` - Get playlist by ID
- `myPlaylists` - Get current user's playlists
- `publicPlaylists` - Get all public playlists

#### Mutations
- `register(input: RegisterInput!)` - Register new user
- `login(input: LoginInput!)` - Login user
- `createSong(input: CreateSongInput!)` - Create song entry
- `createPlaylist(input: CreatePlaylistInput!)` - Create playlist
- `updatePlaylist(id: ID!, input: UpdatePlaylistInput!)` - Update playlist
- `deletePlaylist(id: ID!)` - Delete playlist
- `addSongToPlaylist(playlistId: ID!, songId: ID!)` - Add song to playlist
- `removeSongFromPlaylist(playlistId: ID!, songId: ID!)` - Remove song from playlist
- `reorderPlaylistSongs(playlistId: ID!, songIds: [ID!]!)` - Reorder songs
- `addContributor(input: AddContributorInput!)` - Add contributor
- `removeContributor(playlistId: ID!, userId: ID!)` - Remove contributor
- `updateContributorRole(playlistId: ID!, userId: ID!, role: ContributorRole!)` - Update contributor role

#### Subscriptions
- `serverTime` - Server time updates (for testing)
- `userCreated` - New user registration events
- `playlistUpdated(playlistId: ID!)` - Playlist update events
- `songAddedToPlaylist(playlistId: ID!)` - Song addition events
- `songRemovedFromPlaylist(playlistId: ID!)` - Song removal events
- `contributorAdded(playlistId: ID!)` - Contributor addition events

### Contributor Roles

- **VIEWER**: Read-only access to the playlist
- **EDITOR**: Can add and remove songs
- **ADMIN**: Can manage contributors and settings

## 🧪 Testing

### Running Tests

Run all tests:
```bash
cd server
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm test -- --coverage
```

### Test Structure

- **Unit Tests**: Located in `src/**/__tests__/` directories
  - Resolver tests: `src/graphql/__tests__/resolvers.test.ts`
  - Service tests: `src/services/__tests__/pubsub.service.test.ts`
  - Validation tests: `src/validation/__tests__/validate.test.ts`
- **Integration Tests**: `src/__tests__/integration/graphql-api.test.ts`

### Test Coverage

Tests cover:
- User registration and authentication
- Playlist creation and access control
- Song management
- Contributor management
- Input validation
- WebSocket connection management

## 🌱 Database Seeding

Populate the database with test data:

```bash
cd server
npm run seed
```

This will create:
- 3 test users (alice, bob, charlie)
- 8 test songs
- 5 playlists (mix of public and private)
- Playlist-song relationships
- Contributors with different roles

**Test User Credentials:**
- Email: `alice@example.com` | Password: `password123`
- Email: `bob@example.com` | Password: `password123`
- Email: `charlie@example.com` | Password: `password123`

## 🔄 Real-time Subscriptions

The application supports real-time updates via GraphQL Subscriptions over WebSocket. This allows multiple users to see changes to playlists instantly without refreshing the page.

### How to Test Real-time Updates

#### Method 1: Using GraphQL Playground (Backend Testing)

1. **Start the server** (if not already running):
   ```bash
   cd server
   npm run dev
   ```

2. **Open GraphQL Playground** at `http://localhost:4000/graphql`

3. **Get authentication token**:
   - Register or login to get a JWT token
   - Copy the token from the response

4. **Set up WebSocket connection**:
   - In GraphQL Playground, click on the "Subscriptions" tab
   - Add the authorization header: `{"authorization": "Bearer YOUR_TOKEN"}`

5. **Subscribe to events**:

   **Subscribe to song additions:**
   ```graphql
   subscription {
     songAddedToPlaylist(playlistId: "YOUR_PLAYLIST_ID") {
       id
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

   **Subscribe to playlist updates:**
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

6. **Trigger an event** in another tab/window or using the frontend:
   - Add a song to the playlist
   - Update the playlist title or description
   - Add a contributor

7. **See the update** appear in real-time in your subscription!

#### Method 2: Using Frontend Application (Recommended)

1. **Start both server and client**:
   ```bash
   # Terminal 1: Start server
   cd server
   npm run dev

   # Terminal 2: Start client
   cd client
   npm run dev
   ```

2. **Open the frontend** at `http://localhost:3000`

3. **Login** with test credentials (see Test Users section)

4. **Navigate to a playlist** (`/playlists/[id]`)

5. **Open the same playlist in another browser/tab** (or ask a friend to open it)

6. **Add a song** to the playlist in one window

7. **See the song appear automatically** in the other window without refreshing!

For detailed step-by-step instructions with screenshots, see [REALTIME_TESTING.md](REALTIME_TESTING.md).

## 🔍 Linting & Formatting

Lint code:
```bash
npm run lint
```

Format code:
```bash
npm run format
```

## 📚 Additional Documentation

- **[Music Upload Guide](MUSIC_UPLOAD_GUIDE.md)** - Detailed guide for uploading and managing music (Russian)
- **[GraphQL Playground](http://localhost:4000/graphql)** - Interactive API documentation (when server is running)

## 🐳 Docker Commands

Start all services:
```bash
docker-compose up -d
```

Stop all services:
```bash
docker-compose down
```

View logs:
```bash
docker-compose logs -f
```

Access MongoDB shell:
```bash
docker exec -it mongo mongosh -u root -p password
```

Access Mongo Express GUI:
```
http://localhost:8081
```

## 🔧 Troubleshooting

### MongoDB Connection Issues

**Error**: "MongoDB connection failed"

**Solution**:
1. Ensure Docker is running: `docker ps`
2. Start MongoDB: `docker-compose up -d mongo`
3. Check MongoDB health: `docker-compose ps`
4. Check connection string in `.env`

### Authentication Errors

**Error**: "Not authenticated"

**Solution**:
1. Ensure you have a valid JWT token
2. Add token to HTTP Headers: `{"authorization": "Bearer YOUR_TOKEN"}`
3. Check token expiration (tokens valid for 7 days)

### File Upload Errors

**Error**: "Invalid file type"

**Solution**: Only audio files are supported (MP3, WAV, OGG, FLAC, AAC, M4A)

**Error**: "File too large"

**Solution**: Maximum file size is 50MB

### Port Already in Use

**Error**: "Port 4000 already in use"

**Solution**:
1. Change `PORT` in `.env` file
2. Or stop the process using port 4000

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb://username:password@production-host:27017/dbname
JWT_SECRET=use-a-long-random-secure-string-here
CLIENT_URL=https://your-frontend-domain.com
```

### Build for Production

```bash
cd server
npm run build
npm start
```

### Docker Deployment

Build and run with Docker:

```bash
docker-compose up -d --build
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow TypeScript best practices
- Use ESLint and Prettier configurations
- Write tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎮 Demo & Test Users

### Demo Environment

**Frontend**: `http://localhost:3000` (Next.js application)  
**Backend API**: `http://localhost:4000/graphql` (GraphQL endpoint)  
**WebSocket**: `ws://localhost:4000/graphql` (Real-time subscriptions)  
**Health Check**: `http://localhost:4000/health`  
**Mongo Express**: `http://localhost:8081` (Database GUI)

### Quick Start with Test Users

1. **Start the application**:
   ```bash
   # Start MongoDB and Redis
   docker-compose up -d

   # Start backend server
   cd server
   npm install
   npm run seed  # Populate database with test data
   npm run dev

   # Start frontend (in another terminal)
   cd client
   npm install
   npm run dev
   ```

2. **Access the frontend** at `http://localhost:3000`

3. **Login with test credentials** (created by seed script):

| Email | Password | Username | Role |
|-------|----------|----------|------|
| `alice@example.com` | `password123` | alice | Test User |
| `bob@example.com` | `password123` | bob | Test User |
| `charlie@example.com` | `password123` | charlie | Test User |

4. **Explore the application**:
   - View public playlists on the home page
   - Create your own playlists
   - Add songs to playlists
   - Test real-time collaboration (open same playlist in multiple tabs)

**Note**: These are test accounts created by the seed script. In production, use your own registered accounts.

## 👥 Team & Roles

**Project Maintainer & Lead Developer**: Alibibib  
- GitHub: [@Alibibib](https://github.com/Alibibib)
- Role: Full-stack development, architecture, project management

**Contributions**: This project is open to contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Project Structure & Responsibilities

- **Backend Development**: GraphQL API, WebSocket subscriptions, database models
- **Frontend Development**: Next.js application, React components, state management
- **DevOps**: Docker configuration, CI/CD setup, deployment
- **Testing**: Unit tests, integration tests, E2E testing
- **Documentation**: API docs, user guides, technical documentation

## 👤 Author

**Alibibib**
- GitHub: [@Alibibib](https://github.com/Alibibib)

## 🙏 Acknowledgments

- MERN Stack community
- Apollo GraphQL team
- MongoDB team
- All contributors

## 📞 Support

If you have questions or need help, please:
1. Check the [Music Upload Guide](MUSIC_UPLOAD_GUIDE.md)
2. Open an issue on GitHub
3. Contact the maintainer

---

**Happy Music Management! 🎵🎸🎹🎤**

Этот файл описывает, как загрузить аудиофайл (песню) в базу данных через REST API, а затем связать её с плейлистом через GraphQL.

1) Получение токена (Authorization)

Для загрузки песни нужен JWT-токен.

Выполните логин или регистрацию через GraphQL.

Скопируйте токен, который вернётся в ответе.

В дальнейших запросах используйте его в заголовке:

Authorization: Bearer <токен>

2) Загрузка песни через REST API (POST /upload)

После запуска приложения отправьте POST запрос:

http://localhost:4000/api/upload/upload

Headers

Добавьте заголовок:

Authorization: Bearer <токен>

Body (multipart/form-data)

В Body выберите Multipart (form-data) и укажите поля:

Key	Type	Value
audio	file	(выберите аудиофайл)
title	text	Название песни
artist	text	Имя артиста
duration	text	Длительность в секундах

Важно:

Поле audio должно быть именно type = file.

duration указывается числом в секундах.

После успешной загрузки песня добавится в базу данных и вернётся её id (songId / id — в зависимости от реализации ответа).

3) Привязка песни к плейлисту через GraphQL

Когда у вас есть:

fileId (id загруженного файла) нужно будет написать этот запрос для добавления песни в базу и получить id песни
mutation CreateSong {
  createSong(input: {
    title: "Bohemian Rhapsody"
    artist: "Queen"
    duration: 354
    fileId: "693ec69ceae8eb8e5a4623a6"
  }) {
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

playlistId (id плейлиста)

Вы можете связать их мутацией addSongToPlaylist:

mutation AddSongToPlaylist {
  addSongToPlaylist(
    playlistId: "693ec99747fa0af1e34e9b03"
    songId: "693ec735eae8eb8e5a4623de"
  ) {
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


После этого песня будет добавлена в указанный плейлист.

вот примеры запросов для GraphQL 

Registration

mutation Register {
  register(input: {
    username: "Sayat"
    email: "sayat@gmail.com"
    password: "Sayat123"
    firstName: "Sayat"
    lastName: "Sayat"
  }) {
    token
    user {
      id
      username
      email
      firstName
      lastName
      createdAt
    }
  }
}


Login

mutation Login {
  login(input: {
    email: "alibi@gmail.com"
    password: "alibialibi"
  }) {
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


Get Users

query GetUsers {
  users {
    id
    username
    email
    firstName
    lastName
  }
}


Create Playlist

mutation CreatePlaylist {
  createPlaylist(input: {
    title: "Queen hits"
    description: "All Queen hits"
    isPublic: true
  }) {
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
    createdAt
    updatedAt
  }
}


