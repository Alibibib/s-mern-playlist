import { PubSub } from 'graphql-subscriptions';

export const Events = {
    USER_CREATED: 'USER_CREATED',
    PLAYLIST_UPDATED: 'PLAYLIST_UPDATED',
    SONG_ADDED_TO_PLAYLIST: 'SONG_ADDED_TO_PLAYLIST',
    SONG_REMOVED_FROM_PLAYLIST: 'SONG_REMOVED_FROM_PLAYLIST',
    CONTRIBUTOR_ADDED: 'CONTRIBUTOR_ADDED',
} as const;

export type EventName = (typeof Events)[keyof typeof Events];

class PubSubService {
    private pubsub: PubSub;
    private activeSubscriptions: Map<string, Set<string>>;

    constructor() {
        this.pubsub = new PubSub();
        this.activeSubscriptions = new Map();
    }

    // Publish helpers
    publishUserCreated(user: any) {
        this.pubsub.publish(Events.USER_CREATED, { userCreated: user });
    }

    publishPlaylistUpdated(playlistId: string, playlist: any) {
        this.pubsub.publish(Events.PLAYLIST_UPDATED, {
            playlistUpdated: playlist,
            playlistId,
        });
    }

    publishSongAdded(playlistId: string, playlistSong: any) {
        this.pubsub.publish(Events.SONG_ADDED_TO_PLAYLIST, {
            songAddedToPlaylist: playlistSong,
            playlistId,
        });
    }

    publishSongRemoved(playlistId: string, songId: string) {
        this.pubsub.publish(Events.SONG_REMOVED_FROM_PLAYLIST, {
            songRemovedFromPlaylist: songId,
            playlistId,
        });
    }

    publishContributorAdded(playlistId: string, contributor: any) {
        this.pubsub.publish(Events.CONTRIBUTOR_ADDED, {
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
