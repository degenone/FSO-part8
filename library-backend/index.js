const { ApolloServer } = require('@apollo/server');
require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { expressMiddleware } = require('@apollo/server/express4');
const {
    ApolloServerPluginDrainHttpServer,
} = require('@apollo/server/plugin/drainHttpServer');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const User = require('./models/user');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

mongoose.set('strictQuery', false);
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB!'))
    .catch((error) =>
        console.error('Error trying to connect to MongoDB!', error.message)
    );

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const context = async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.startsWith('Bearer ')) {
        const { id } = jwt.verify(auth.substring(7), process.env.SECRET);
        const user = await User.findById(id);
        return { user };
    }
};

const start = async () => {
    const app = express();
    const httpServer = http.createServer(app);
    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/',
    });
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const serverCleanup = useServer({ schema }, wsServer);
    const plugins = [
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
    ];
    const server = new ApolloServer({ schema, plugins });
    await server.start();
    app.use(
        '/',
        cors(),
        express.json(),
        expressMiddleware(server, { context })
    );
    httpServer.listen(process.env.PORT, () =>
        console.log(`Server running on http://localhost:${process.env.PORT}`)
    );
};

start();
