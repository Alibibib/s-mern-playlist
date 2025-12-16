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

```bash
cd server
npm install
```

### 4. Configure Environment Variables

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

### 5. Start the Server

#### Development Mode (with hot reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm run build
npm start
```

The server will start on `http://localhost:4000`

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
├── docker-compose.yml        # Docker services configuration
├── upload-music.html         # Music upload interface
├── MUSIC_UPLOAD_GUIDE.md     # Detailed upload guide (Russian)
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
- `songAddedToPlaylist(playlistId: ID!)` - Subscribe to song additions

### Contributor Roles

- **VIEWER**: Read-only access to the playlist
- **EDITOR**: Can add and remove songs
- **ADMIN**: Can manage contributors and settings

## 🧪 Testing

Run tests:
```bash
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


