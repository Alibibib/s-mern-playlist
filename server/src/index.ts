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

dotenv.config();

const startServer = async () => {
    const app = express();
    const httpServer = http.createServer(app);

    // Database Connection
    const MONGO_URI = process.env.MONGO_URI || '';
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }

    // GraphQL Schema
    const schema = makeExecutableSchema({ typeDefs, resolvers });

    // WebSocket Server for Subscriptions
    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql',
    });

    const serverCleanup = useServer({ schema }, wsServer);

    // Apollo Server Setup
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
    });

    await server.start();

    app.use(
        '/graphql',
        cors<cors.CorsRequest>(),
        express.json(),
        expressMiddleware(server)
    );

    const PORT = process.env.PORT || 4000;

    httpServer.listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
        console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}/graphql`);
    });
};

startServer().catch((err) => {
    console.error('Server failed to start', err);
});
