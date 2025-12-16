import { ApolloClient, InMemoryCache, ApolloLink, HttpLink } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { GRAPHQL_URL, WS_URL } from '@/lib/utils/constants';
import { useAuthStore } from '@/lib/store/auth-store';

// HTTP Link для queries и mutations
const httpLink = new HttpLink({
  uri: GRAPHQL_URL,
});

// Auth Link для добавления JWT токена
const authLink = new SetContextLink(({ headers = {} }) => {
  // Получаем токен из store (синхронно)
  const token = useAuthStore.getState().token;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// WebSocket Link для subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: WS_URL,
    connectionParams: () => {
      const token = useAuthStore.getState().token;
      return {
        authorization: token ? `Bearer ${token}` : '',
      };
    },
    shouldRetry: () => true,
    retryAttempts: Infinity,
    on: {
      opened: () => {
        console.log('WebSocket connection opened');
      },
      closed: () => {
        console.log('WebSocket connection closed');
      },
      error: (error) => {
        console.error('WebSocket error:', error);
      },
    },
  })
);

// Split link: HTTP для queries/mutations, WebSocket для subscriptions
const splitLink = ApolloLink.split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  ApolloLink.from([authLink, httpLink])
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          playlists: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            merge(_existing = [], incoming) {
              return incoming;
            },
          },
          songs: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            merge(_existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
      Playlist: {
        fields: {
          songs: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            merge(_existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});


