# 🎵 MERN Music Playlist Manager - Frontend

This is the frontend application for the MERN Music Playlist Manager, built with Next.js 16, React 19, Apollo Client, and Zustand.

## 🚀 Technology Stack

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **Apollo Client** - GraphQL client with WebSocket support
- **Zustand** - Lightweight state management
- **react-hook-form** - Form handling
- **Zod** - Schema validation

## 📁 Project Structure

```
client/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with Apollo Provider
│   ├── page.tsx           # Home page (public playlists)
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── playlists/         # Playlist pages
│   │   ├── page.tsx       # My playlists list
│   │   ├── new/           # Create playlist
│   │   └── [id]/          # Playlist details
│   ├── songs/             # Songs page
│   └── profile/           # User profile
├── components/             # React components
│   ├── ui/                # Base UI components
│   ├── auth/              # Authentication components
│   ├── playlist/          # Playlist components
│   └── song/              # Song components
├── lib/                    # Utilities and configuration
│   ├── apollo/            # Apollo Client setup
│   ├── store/             # Zustand stores
│   ├── graphql/           # GraphQL operations
│   │   ├── queries/       # GraphQL queries
│   │   ├── mutations/     # GraphQL mutations
│   │   └── subscriptions/ # GraphQL subscriptions
│   ├── validation/        # Zod schemas
│   └── utils/             # Utility functions
├── hooks/                  # Custom React hooks
│   ├── use-auth.ts        # Authentication hook
│   ├── use-playlist.ts    # Playlist hook
│   └── use-subscription.ts # Subscription hook
└── types/                  # TypeScript type definitions
```

## 🛠️ Getting Started

### Prerequisites

- Node.js v18 or higher
- Backend server running on `http://localhost:4000`

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local if needed (defaults work for local development)
```

### Development

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🔧 Configuration

### Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:4000/graphql
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 📱 Features

### Pages

- **Home (`/`)** - Browse public playlists
- **Login (`/login`)** - User authentication
- **Register (`/register`)** - User registration
- **My Playlists (`/playlists`)** - User's playlists
- **Create Playlist (`/playlists/new`)** - Create new playlist
- **Playlist Details (`/playlists/[id]`)** - View and manage playlist
- **Songs (`/songs`)** - Browse all songs
- **Profile (`/profile`)** - User profile and settings

### Features

- ✅ User authentication (JWT)
- ✅ Real-time playlist updates via WebSocket subscriptions
- ✅ Audio player for streaming songs
- ✅ Form validation with Zod
- ✅ Responsive design with TailwindCSS
- ✅ State management with Zustand
- ✅ Error handling and notifications

## 🧪 Testing

The frontend uses Next.js built-in testing capabilities. For end-to-end testing, consider using:

- Playwright
- Cypress
- React Testing Library

## 📦 Key Dependencies

```json
{
  "next": "16.0.10",
  "react": "19.2.1",
  "@apollo/client": "^4.0.10",
  "zustand": "^5.0.9",
  "react-hook-form": "^7.68.0",
  "zod": "^4.2.1",
  "graphql-ws": "^6.0.6"
}
```

## 🔗 Related Documentation

- [Main README](../README.md) - Full project documentation
- [API Documentation](../API_DOCUMENTATION.md) - Backend API reference
- [Architecture](../ARCHITECTURE.md) - System architecture
- [Real-time Testing](../REALTIME_TESTING.md) - Testing subscriptions

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](../LICENSE) file.
