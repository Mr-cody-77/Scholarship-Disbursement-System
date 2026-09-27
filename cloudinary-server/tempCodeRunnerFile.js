const ws = new WebSocket('wss://172.16.11.157:5005', {
  rejectUnauthorized: false, // Allow self-signed certificates for testing
});