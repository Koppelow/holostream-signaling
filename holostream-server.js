const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');

// Create HTTPS server with your SSL certificates
const server = https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/koppelow.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/koppelow.com/fullchain.pem'),
});

// WebSocket server for /holostream only
const wss = new WebSocket.Server({ server, path: '/holostream' });

wss.on('connection', socket => {
  console.log('🔌 Client connected to /holostream');

  // Broadcast messages to all other clients
  socket.on('message', message => {
    wss.clients.forEach(client => {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  socket.on('close', () => console.log('❌ Client disconnected from /holostream'));
});

// Start server
server.listen(3003, () => {
  console.log('🚀 WebSocket server running at wss://koppelow.com:3003/holostream');
});
