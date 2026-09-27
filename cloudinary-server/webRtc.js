const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const server = new WebSocket.Server({ port: 3000 });
// const server = new WebSocket.Server({ host: '0.0.0.0', port: 3000 });

const sessions = new Map();
const clients = new Map();

server.on('connection', (socket) => {
  const clientId = uuidv4();
  socket.clientId = clientId;
  
  socket.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'register':
          handleRegistration(socket, data);
          break;
        case 'offer':
        case 'answer':
        case 'candidate':
          relayMessage(socket, data);
          break;
      }
    } catch (err) {
      console.error('Error handling message:', err);
    }
  });

  socket.on('close', () => handleDisconnection(socket));
  socket.on('error', (error) => console.error('WebSocket error:', error));
});

function handleRegistration(socket, data) {
  const { role, sessionId } = data;
  clients.set(socket.clientId, { socket, role, sessionId });

  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { admin: null, client: null });
  }

  const session = sessions.get(sessionId);
  session[role] = socket;

  // Notify both parties if they're both connected
  if (session.admin && session.client) {
    session.admin.send(JSON.stringify({ type: 'ready', sessionId }));
    session.client.send(JSON.stringify({ type: 'ready', sessionId }));
  }
}

function relayMessage(sender, data) {
  const senderInfo = clients.get(sender.clientId);
  if (!senderInfo) return;

  const session = sessions.get(senderInfo.sessionId);
  if (!session) return;

  const targetSocket = senderInfo.role === 'admin' ? session.client : session.admin;
  if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
    targetSocket.send(JSON.stringify(data));
  }
}

function handleDisconnection(socket) {
  const clientInfo = clients.get(socket.clientId);
  if (!clientInfo) return;

  const session = sessions.get(clientInfo.sessionId);
  if (session) {
    session[clientInfo.role] = null;
    
    // Clean up empty sessions
    if (!session.admin && !session.client) {
      sessions.delete(clientInfo.sessionId);
    } else {
      // Notify the other party about disconnection
      const otherRole = clientInfo.role === 'admin' ? 'client' : 'admin';
      if (session[otherRole]) {
        session[otherRole].send(JSON.stringify({ 
          type: 'disconnected',
          role: clientInfo.role 
        }));
      }
    }
  }

  clients.delete(socket.clientId);
}

console.log('WebSocket server running on ws://localhost:3000');
