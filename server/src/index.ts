import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { typeDefs } from './graphql/typeDefs';
import { resolvers } from './graphql/resolvers';
import { getContextUser } from './middleware/auth';
import { initGridFS } from './utils/gridfs';
import uploadRoutes from './routes/upload';
import { cleanupOldDeletedSongs, startCleanupScheduler } from './utils/cleanup';
import { connectionManager, ConnectionContext } from './services/connection.manager';

dotenv.config();

const startServer = async () => {
    const app = express();
    const httpServer = http.createServer(app);

    const connectDB = async () => {
        const MONGO_URI = process.env.MONGO_URI || '';

        const connectionString = MONGO_URI.includes('mongo:')
            ? MONGO_URI
            : 'mongodb://root:password@localhost:27017/mern-db?authSource=admin&directConnection=true';

        try {
            await mongoose.connect(connectionString);
            console.log('✅ MongoDB connected successfully');
            console.log(`📍 Connected to: ${connectionString.replace(/\/\/.*@/, '//***@')}`);
        } catch (err) {
            console.error('❌ MongoDB connection failed');
            console.error('💡 Ensure Docker is running: docker-compose up -d mongo');
            console.error(err);
            process.exit(1);
        }
    };

    await connectDB();

    // Initialize GridFS for file uploads
    initGridFS();

    const schema = makeExecutableSchema({ typeDefs, resolvers });

    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql',
    });

    const serverCleanup = useServer(
        {
            schema,
            onConnect: async (ctx) => {
                try {
                    const connectionContext = await connectionManager.onConnect(ctx);
                    (ctx as any).connectionId = connectionContext.connectionId;
                    return connectionContext as unknown as Record<string, unknown>;
                } catch (_err) {
                    return false;
                }
            },
            onDisconnect: (ctx) => {
                connectionManager.onDisconnect(ctx);
            },
            onSubscribe: (ctx, msg) => {
                connectionManager.onSubscribe(ctx, msg.id);
            },
            context: async (ctx) => {
                const connectionContext = ctx.extra as unknown as ConnectionContext;
                return {
                    user: connectionContext?.user || null,
                    connectionId: connectionContext?.connectionId,
                };
            },
        },
        wsServer
    );

    const server = new ApolloServer({
        schema,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose();
                        },
                    };
                },
            },
        ],
        formatError: (formattedError, _error) => {
            console.error('GraphQL Error:', formattedError);

            return {
                message: formattedError.message,
                extensions: formattedError.extensions,
            };
        },
    });

    await server.start();

    const corsOptions = {
        origin: true, // Allow all origins in development
        credentials: true,
    };

    // Enable CORS and JSON parsing for all routes
    app.use(cors<cors.CorsRequest>(corsOptions));
    app.use(express.json());

    // Upload routes (REST API for file uploads)
    app.use('/api/upload', uploadRoutes);

    app.use(
        '/graphql',
        expressMiddleware(server, {
            context: async ({ req }) => {
                const user = getContextUser(req);
                return { user };
            },
        })
    );

    app.get('/health', (req, res) => {
        const stats = connectionManager.getStats();
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            websocket: stats,
        });
    });

    app.post('/api/admin/cleanup', async (req, res) => {
        const adminKey = req.headers['x-admin-key'];
        if (adminKey !== process.env.ADMIN_KEY) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const daysOld = parseInt(req.query.days as string) || 30;

        try {
            const result = await cleanupOldDeletedSongs(daysOld);
            res.json({ success: true, ...result });
        } catch (error) {
            res.status(500).json({
                error: 'Cleanup failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    const PORT = process.env.PORT || 4000;

    if (process.env.ENABLE_CLEANUP_SCHEDULER === 'true') {
        const days = process.env.CLEANUP_DAYS ? parseInt(process.env.CLEANUP_DAYS, 10) : 30;
        const intervalHours = process.env.CLEANUP_INTERVAL_HOURS
            ? parseInt(process.env.CLEANUP_INTERVAL_HOURS, 10)
            : 24;
        startCleanupScheduler(days, intervalHours);
    }

    httpServer.listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
        console.log(`🔌 Subscriptions ready at ws://localhost:${PORT}/graphql`);
        console.log(`� Upload API at http://localhost:${PORT}/api/upload`);
        console.log(`�📊 Health check at http://localhost:${PORT}/health`);
        console.log(`🔐 JWT_SECRET is ${process.env.JWT_SECRET ? 'configured' : 'using default (UNSAFE!)'}`);
    });
};

startServer().catch((err) => {
    console.error('❌ Server failed to start', err);
    process.exit(1);
});