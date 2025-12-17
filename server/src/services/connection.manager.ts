import { Context } from 'graphql-ws';
import { authenticateToken, JWTPayload } from '@/middleware/auth';
import { pubsubService } from './pubsub.service';

export interface ConnectionContext {
    connectionId: string;
    user: JWTPayload | null;
    connectedAt: Date;
}

class ConnectionManager {
    private connections: Map<string, ConnectionContext> = new Map();

    private generateConnectionId(): string {
        return `conn_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    }

    async onConnect(ctx: Context<{ authorization?: string }>): Promise<ConnectionContext> {
        const connectionId = this.generateConnectionId();
        const token = ctx.connectionParams?.authorization as string | undefined;

        let user: JWTPayload | null = null;
        if (token) {
            try {
                user = authenticateToken(token);
            } catch (err) {
                console.warn(`🔒 WebSocket connection rejected (invalid token): ${err}`);
                throw new Error('Invalid or expired token');
            }
        }

        const connectionContext: ConnectionContext = {
            connectionId,
            user,
            connectedAt: new Date(),
        };

        this.connections.set(connectionId, connectionContext);
        pubsubService.registerConnection(connectionId);

        console.log(`✅ WS connected: ${connectionId} user=${user?.email ?? 'anonymous'}`);

        return connectionContext;
    }

    onDisconnect(ctx: Context<any>) {
        const connectionId = (ctx as any).connectionId as string | undefined;
        if (connectionId) {
            this.connections.delete(connectionId);
            pubsubService.cleanupConnection(connectionId);
            console.log(`👋 WS disconnected: ${connectionId}`);
        }
    }

    onSubscribe(ctx: Context<any>, subscriptionId: string) {
        const connectionId = (ctx as any).connectionId as string | undefined;
        if (connectionId) {
            pubsubService.registerSubscription(connectionId, subscriptionId);
        }
    }

    getStats() {
        return {
            activeConnections: this.connections.size,
            activeSubscriptions: pubsubService.getActiveSubscriptionsCount(),
        };
    }
}

export const connectionManager = new ConnectionManager();
