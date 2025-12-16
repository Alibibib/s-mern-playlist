# 🚀 Quick Setup Guide

This is a fast-track guide to get the MERN Music Playlist Manager up and running in under 5 minutes.

## Prerequisites

- ✅ Node.js v18+
- ✅ Docker Desktop (running)
- ✅ Git

## Setup Steps

### 1. Clone and Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/Alibibib/s-mern-playlist.git
cd s-mern-playlist

# Start MongoDB with Docker
docker-compose up -d

# Install dependencies
cd server
npm install
```

### 2. Configure Environment (30 seconds)

```bash
# Copy environment file
cp .env.example .env

# Use default values for local development (already configured)
```

### 3. Start the Server (30 seconds)

```bash
# Start in development mode
npm run dev
```

✅ **Server running at:** `http://localhost:4000/graphql`

## Quick Test

### 1. Open GraphQL Playground

Navigate to: `http://localhost:4000/graphql`

### 2. Register a User

```graphql
mutation {
  register(input: {
    username: "testuser"
    email: "test@example.com"
    password: "password123"
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

**Copy the `token` from the response!**

### 3. Set Authentication Header

In GraphQL Playground, click "HTTP HEADERS" at the bottom and add:

```json
{
  "authorization": "Bearer YOUR_TOKEN_HERE"
}
```

### 4. Create Your First Playlist

```graphql
mutation {
  createPlaylist(input: {
    title: "My First Playlist"
    description: "Testing the app"
    isPublic: true
  }) {
    id
    title
  }
}
```

🎉 **Success!** You've created your first playlist!

## Upload Music (Optional)

### Option 1: HTML Interface

1. Open `upload-music.html` in your browser
2. Paste your JWT token
3. Fill in song details and upload a file

### Option 2: Command Line (cURL)

```bash
curl -X POST http://localhost:4000/api/upload/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@/path/to/song.mp3" \
  -F "title=Test Song" \
  -F "artist=Test Artist" \
  -F "duration=180"
```

## Useful URLs

| Service | URL |
|---------|-----|
| GraphQL Playground | http://localhost:4000/graphql |
| Mongo Express (DB GUI) | http://localhost:8081 |
| Music Upload Interface | `file:///path/to/upload-music.html` |
| Health Check | http://localhost:4000/health |

## Common Commands

```bash
# Start development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Start production server
npm start
```

## Docker Commands

```bash
# Start MongoDB
docker-compose up -d

# Stop MongoDB
docker-compose down

# View logs
docker-compose logs -f mongo

# Access MongoDB shell
docker exec -it mongo mongosh -u root -p password
```

## Troubleshooting

### Port 4000 already in use

```bash
# Change PORT in .env file
PORT=5000
```

### MongoDB connection failed

```bash
# Ensure Docker is running
docker ps

# Restart MongoDB
docker-compose restart mongo
```

### "Not authenticated" error

- Make sure you copied the full token
- Include "Bearer " before the token
- Check token hasn't expired (7 day limit)

## Next Steps

1. 📖 Read the full [README.md](README.md)
2. 🔍 Explore the [API Documentation](API_DOCUMENTATION.md)
3. 🏗️ Learn about the [Architecture](ARCHITECTURE.md)
4. 🤝 Check [Contributing Guidelines](CONTRIBUTING.md)
5. 📝 See the [Music Upload Guide](MUSIC_UPLOAD_GUIDE.md) (Russian)

## Need Help?

- Check existing [GitHub Issues](https://github.com/Alibibib/s-mern-playlist/issues)
- Create a new issue if needed
- Read the documentation files

---

**Happy Coding! 🎵**
