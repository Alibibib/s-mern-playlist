import { pubsubService, Events } from '../pubsub.service';
import { connectionManager } from '../connection.manager';
import { Context } from 'graphql-ws';
import jwt from 'jsonwebtoken';

describe('PubSubService', () => {
  beforeEach(() => {
    // Reset service state if needed
  });

  describe('publish methods', () => {
    it('should publish user created event', () => {
      const user = { id: '123', email: 'test@example.com' };
      expect(() => {
        pubsubService.publishUserCreated(user);
      }).not.toThrow();
    });

    it('should publish playlist updated event', () => {
      const playlist = { id: '123', title: 'Test Playlist' };
      expect(() => {
        pubsubService.publishPlaylistUpdated('playlist-id', playlist);
      }).not.toThrow();
    });

    it('should publish song added event', () => {
      const playlistSong = { id: '123', songId: 'song-id' };
      expect(() => {
        pubsubService.publishSongAdded('playlist-id', playlistSong);
      }).not.toThrow();
    });

    it('should publish song removed event', () => {
      expect(() => {
        pubsubService.publishSongRemoved('playlist-id', 'song-id');
      }).not.toThrow();
    });

    it('should publish contributor added event', () => {
      const contributor = { id: '123', userId: 'user-id' };
      expect(() => {
        pubsubService.publishContributorAdded('playlist-id', contributor);
      }).not.toThrow();
    });
  });

  describe('subscribe method', () => {
    it('should return async iterator for event', () => {
      const iterator = pubsubService.subscribe(Events.USER_CREATED);
      expect(iterator).toBeDefined();
      expect(typeof iterator.next).toBe('function');
    });
  });

  describe('connection tracking', () => {
    it('should register connection', () => {
      const connectionId = 'test-connection-1';
      pubsubService.registerConnection(connectionId);
      expect(pubsubService.getActiveConnectionsCount()).toBeGreaterThan(0);
    });

    it('should register subscription', () => {
      const connectionId = 'test-connection-2';
      const subscriptionId = 'test-subscription-1';
      pubsubService.registerConnection(connectionId);
      pubsubService.registerSubscription(connectionId, subscriptionId);
      expect(pubsubService.getActiveSubscriptionsCount()).toBeGreaterThan(0);
    });

    it('should cleanup connection', () => {
      const connectionId = 'test-connection-3';
      pubsubService.registerConnection(connectionId);
      pubsubService.registerSubscription(connectionId, 'sub-1');
      pubsubService.cleanupConnection(connectionId);
      expect(pubsubService.getActiveConnectionsCount()).toBe(0);
      expect(pubsubService.getActiveSubscriptionsCount()).toBe(0);
    });
  });
});

describe('ConnectionManager', () => {
  const generateMockContext = (token?: string): Context<any> => {
    return {
      connectionParams: token ? { authorization: token } : {},
      extra: {},
    } as Context<any>;
  };

  describe('onConnect', () => {
    it('should accept connection with valid token', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const token = jwt.sign(
        { id: userId, email: 'test@example.com' },
        process.env.JWT_SECRET || 'unsafe_secret_key',
        { expiresIn: '7d' }
      );

      const ctx = generateMockContext(token);
      const result = await connectionManager.onConnect(ctx);

      expect(result).toBeDefined();
      expect(result.connectionId).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user?.id).toBe(userId);
    });

    it('should accept connection without token (anonymous)', async () => {
      const ctx = generateMockContext();
      const result = await connectionManager.onConnect(ctx);

      expect(result).toBeDefined();
      expect(result.connectionId).toBeDefined();
      expect(result.user).toBeNull();
    });

    it('should reject connection with invalid token', async () => {
      const ctx = generateMockContext('invalid-token');
      await expect(connectionManager.onConnect(ctx)).rejects.toThrow();
    });
  });

  describe('onDisconnect', () => {
    it('should cleanup connection on disconnect', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const token = jwt.sign(
        { id: userId, email: 'test@example.com' },
        process.env.JWT_SECRET || 'unsafe_secret_key',
        { expiresIn: '7d' }
      );

      const ctx = generateMockContext(token);
      const connection = await connectionManager.onConnect(ctx);
      (ctx as any).connectionId = connection.connectionId;

      expect(() => {
        connectionManager.onDisconnect(ctx);
      }).not.toThrow();
    });
  });

  describe('getStats', () => {
    it('should return connection and subscription stats', () => {
      const stats = connectionManager.getStats();
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('activeConnections');
      expect(stats).toHaveProperty('activeSubscriptions');
      expect(typeof stats.activeConnections).toBe('number');
      expect(typeof stats.activeSubscriptions).toBe('number');
    });
  });
});
