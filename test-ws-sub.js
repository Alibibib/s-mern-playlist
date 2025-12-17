const WebSocket = require('ws');
const fs = require('fs');

const env = JSON.parse(fs.readFileSync('test-env.json'));
const { TOKEN, PLAYLIST_ID } = env;

console.log('Testing Subscriptions...');

const ws = new WebSocket('ws://localhost:4000/graphql', 'graphql-transport-ws');

ws.on('open', () => {
    console.log('✅ Connection opened');

    const initMessage = {
        type: 'connection_init',
        payload: { authorization: `Bearer ${TOKEN}` }
    };
    ws.send(JSON.stringify(initMessage));
});

ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    // console.log('📩 Received type:', msg.type);

    if (msg.type === 'connection_ack') {
        console.log('✅ Connected! Subscribing...');

        const subMsg = {
            id: '1',
            type: 'subscribe',
            payload: {
                query: `subscription OnSongAdded($playlistId: ID!) {
                  songAddedToPlaylist(playlistId: $playlistId) {
                      id
                      song { title }
                  }
              }`,
                variables: { playlistId: PLAYLIST_ID }
            }
        };
        ws.send(JSON.stringify(subMsg));
        console.log('📡 Subscribe sent');
    }

    if (msg.type === 'next') {
        console.log('🎉 EVENT RECEIVED:', JSON.stringify(msg.payload, null, 2));
        process.exit(0);
    }
});

ws.on('error', (e) => {
    console.error(e);
    process.exit(1);
});

setTimeout(() => {
    console.log('Timeout waiting for event');
    process.exit(1);
}, 30000);
