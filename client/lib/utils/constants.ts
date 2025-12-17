// Helper to check if we are on the server
const isServer = typeof window === 'undefined';

// Internal URL for Server Side Rendering (Docker network)
const INTERNAL_GRAPHQL_URL = process.env.SERVER_SIDE_GRAPHQL_URL || 'http://server:4000/graphql';
const INTERNAL_API_URL = process.env.SERVER_SIDE_API_URL || 'http://server:4000';

// Public URL for Client Side (Browser)
const PUBLIC_GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';
const PUBLIC_WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/graphql';
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const GRAPHQL_URL = isServer ? INTERNAL_GRAPHQL_URL : PUBLIC_GRAPHQL_URL;
export const WS_URL = PUBLIC_WS_URL; // WebSockets are always client-side
export const API_URL = isServer ? INTERNAL_API_URL : PUBLIC_API_URL;


