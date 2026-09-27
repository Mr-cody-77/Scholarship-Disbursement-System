const WebSocket = require('ws');

// const ws = new WebSocket('wss://172.16.11.157:5005', {
//   rejectUnauthorized: false, // Allow self-signed certificates for testing
// });

const ws = new WebSocket('wss://172.16.11.157:5005');

ws.on('open', () => {
  console.log('Connected to WebSocket server');
  ws.send('Hello from client');
});

ws.on('message', (message) => {
  console.log('Received:', message);
});

ws.on('close', () => {
  console.log('Connection closed');
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});
