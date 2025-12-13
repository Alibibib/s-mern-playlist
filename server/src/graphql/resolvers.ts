export const resolvers = {
    Query: {
        hello: () => 'Hello from MERN Server!',
    },
    Subscription: {
        serverTime: {
            subscribe: async function* () {
                while (true) {
                    yield { serverTime: new Date().toISOString() };
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
            },
        },
    },
};
