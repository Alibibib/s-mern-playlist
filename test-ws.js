const WebSocket = require('ws');

console.log('Testing WebSocket connection to ws://localhost:4000/graphql...');

const ws = new WebSocket('ws://localhost:4000/graphql', 'graphql-transport-ws');

ws.on('open', () => {
  console.log('✅ Connection opened successfully!');
  
  // Send connection init message expected by graphql-transport-ws
  const initMessage = {
    type: 'connection_init',
    payload: {
        authorization: process.env.TEST_TOKEN || ''
    }
  };
  
  ws.send(JSON.stringify(initMessage));
});

ws.on('message', (data) => {
  console.log('📩 Received:', data.toString());
  // If we receive connection_ack, verification is complete
  if (data.toString().includes('connection_ack')) {
      console.log('✅ Connection acknowledged (connection_ack received). Test passed.');
      process.exit(0);
  }
});

ws.on('error', (err) => {
  console.error('❌ WebSocket error:', err.message);
  process.exit(1);
});

ws.on('close', (code, reason) => {
  console.log(`Connection closed: ${code} ${reason}`);
});

// Timeout
setTimeout(() => {
    console.error('❌ Timeout waiting for connection or ack');
    ws.terminate();
    process.exit(1);
}, 5000);
