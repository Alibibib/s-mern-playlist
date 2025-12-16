# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive README.md with project overview and setup instructions
- Detailed API documentation (API_DOCUMENTATION.md)
- Architecture documentation (ARCHITECTURE.md)
- Contributing guidelines (CONTRIBUTING.md)
- Real-time testing guide (REALTIME_TESTING.md)
- MIT License file
- This changelog file

## [1.0.0] - 2024-12-16

### Added
- **Frontend Application (Next.js)**
  - Next.js 16 with App Router
  - React 19 components
  - Apollo Client with WebSocket support
  - Zustand state management
  - TailwindCSS styling
  - 8+ pages (home, login, register, playlists, songs, profile)
  - Real-time subscriptions integration
  - Form validation with react-hook-form + Zod
  - Audio player component
  - Responsive design
- **Backend API**
  - User authentication with JWT
  - User registration and login
  - Song upload with GridFS storage
  - Song management (create, list)
  - Playlist creation and management
  - Add songs to playlists
  - Remove songs from playlists
  - Reorder songs in playlists
  - Collaborative playlists with contributors
  - Role-based access control (Viewer, Editor, Admin)
  - Real-time updates via WebSocket subscriptions
  - Song streaming endpoint
  - GraphQL API with queries, mutations, and subscriptions
  - REST API for file uploads
- **Infrastructure**
  - Docker Compose setup (MongoDB, Redis, Server, Client)
  - Dockerfile for client
  - Mongo Express for database management
  - TypeScript support (server + client)
  - ESLint configuration (server + client)
  - Prettier configuration (server + client)
  - Jest testing setup (48+ tests)
  - Seed script for test data
- **Documentation**
  - Comprehensive README.md
  - API documentation (API_DOCUMENTATION.md)
  - Architecture documentation (ARCHITECTURE.md)
  - Real-time testing guide (REALTIME_TESTING.md)
  - Contributing guidelines (CONTRIBUTING.md)
  - Quick start guide (QUICK_START.md)
  - Music upload guide (MUSIC_UPLOAD_GUIDE.md) - Russian
  - Documentation index (DOCS_INDEX.md)

### Security
- Password hashing with bcryptjs
- JWT token authentication
- CORS configuration
- File type validation
- File size limits (50MB max)

## [0.1.0] - Initial Development

### Added
- Basic project structure
- MongoDB connection
- Express server setup
- GraphQL schema definition
- Mongoose models

---

## Version History

### Understanding Semantic Versioning

Given a version number MAJOR.MINOR.PATCH, increment the:

1. **MAJOR** version when you make incompatible API changes
2. **MINOR** version when you add functionality in a backward compatible manner
3. **PATCH** version when you make backward compatible bug fixes

### Categories

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security updates

---

## How to Contribute to Changelog

When making a PR, add your changes under the `[Unreleased]` section in the appropriate category:

```markdown
## [Unreleased]

### Added
- Your new feature description

### Fixed
- Your bug fix description
```

When a new version is released, the maintainer will:
1. Move items from `[Unreleased]` to a new version section
2. Add the version number and release date
3. Create a git tag for the release

---

[Unreleased]: https://github.com/Alibibib/s-mern-playlist/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Alibibib/s-mern-playlist/releases/tag/v1.0.0
[0.1.0]: https://github.com/Alibibib/s-mern-playlist/releases/tag/v0.1.0
