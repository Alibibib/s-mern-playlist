import { PubSub, PubSubEngine } from 'graphql-subscriptions';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import type { RedisOptions } from 'ioredis';

export const Events = {
    USER_CREATED: 'USER_CREATED',
    PLAYLIST_UPDATED: 'PLAYLIST_UPDATED',
    SONG_ADDED_TO_PLAYLIST: 'SONG_ADDED_TO_PLAYLIST',
    SONG_REMOVED_FROM_PLAYLIST: 'SONG_REMOVED_FROM_PLAYLIST',
    CONTRIBUTOR_ADDED: 'CONTRIBUTOR_ADDED',
} as const;

export type EventName = (typeof Events)[keyof typeof Events];

type PubSubMode = 'memory' | 'redis';

const createPubSub = (): { engine: PubSubEngine; mode: PubSubMode } => {
    const redisUrl = process.env.REDIS_URL;

    if (redisUrl) {
        const parsed = new URL(redisUrl);
        const connectionOptions: RedisOptions = {
            lazyConnect: false,
            retryStrategy: (times) => Math.min(times * 100, 2000),
            host: parsed.hostname,
            port: parsed.port ? parseInt(parsed.port, 10) : 6379,
            password: parsed.password || undefined,
            tls: parsed.protocol === 'rediss:' ? {} : undefined,
        };

        const engine = new RedisPubSub({
            connection: connectionOptions,
        });

        console.log('📡 PubSub mode: redis');
        return { engine, mode: 'redis' };
    }

    console.log('📡 PubSub mode: in-memory');
    return { engine: new PubSub(), mode: 'memory' };
};

class PubSubService {
    private pubsub: PubSubEngine;
    private mode: PubSubMode;
    private activeSubscriptions: Map<string, Set<string>>;

    constructor() {
        const { engine, mode } = createPubSub();
        this.pubsub = engine;
        this.mode = mode;
        this.activeSubscriptions = new Map();
    }

    // Publish helpers
    publishUserCreated(user: any) {
        void this.pubsub.publish(Events.USER_CREATED, { userCreated: user });
    }

    publishPlaylistUpdated(playlistId: string, playlist: any) {
        void this.pubsub.publish(Events.PLAYLIST_UPDATED, {
            playlistUpdated: playlist,
            playlistId,
        });
    }

    publishSongAdded(playlistId: string, playlistSong: any) {
        void this.pubsub.publish(Events.SONG_ADDED_TO_PLAYLIST, {
            songAddedToPlaylist: playlistSong,
            playlistId,
        });
    }

    publishSongRemoved(playlistId: string, songId: string) {
        void this.pubsub.publish(Events.SONG_REMOVED_FROM_PLAYLIST, {
            songRemovedFromPlaylist: songId,
            playlistId,
        });
    }

    publishContributorAdded(playlistId: string, contributor: any) {
        void this.pubsub.publish(Events.CONTRIBUTOR_ADDED, {
            contributorAdded: contributor,
            playlistId,
        });
    }

    subscribe(event: EventName) {
        return this.pubsub.asyncIterator([event]);
    }

    registerConnection(connectionId: string) {
        this.activeSubscriptions.set(connectionId, new Set());
        console.log(`📡 Connection registered: ${connectionId}`);
    }

    registerSubscription(connectionId: string, subscriptionId: string) {
        const subs = this.activeSubscriptions.get(connectionId);
        if (subs) {
            subs.add(subscriptionId);
            console.log(`📡 Subscription registered: ${subscriptionId} for connection ${connectionId}`);
        }
    }

    cleanupConnection(connectionId: string) {
        const subs = this.activeSubscriptions.get(connectionId);
        if (subs) {
            console.log(`🧹 Cleaning up ${subs.size} subscriptions for connection ${connectionId}`);
            subs.clear();
        }
        this.activeSubscriptions.delete(connectionId);
    }

    getActiveConnectionsCount(): number {
        return this.activeSubscriptions.size;
    }

    getActiveSubscriptionsCount(): number {
        let count = 0;
        this.activeSubscriptions.forEach((subs) => (count += subs.size));
        return count;
    }
}

export const pubsubService = new PubSubService();
