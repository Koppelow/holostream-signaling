const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');

// Create HTTPS server with your SSL certificates
const server = https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/koppelow.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/koppelow.com/fullchain.pem'),
});

// Define channels
const channels = [
  { path: '/holostream', name: 'holostream' },
  { path: '/holostream2', name: 'holostream2' },
];

// Create WebSocket servers for each channel
channels.forEach(ch => {
  const wss = new WebSocket.Server({ server, path: ch.path });

  wss.on('connection', socket => {
    console.log(`🔌 Client connected to ${ch.name}`);

    // Broadcast messages to all other clients in this channel
    socket.on('message', message => {
      wss.clients.forEach(client => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });

    socket.on('close', () => console.log(`❌ Client disconnected from ${ch.name}`));
  });
});

// Start HTTPS/WSS server
server.listen(3003, () => {
  console.log('🚀 WebSocket server running:');
  channels.forEach(ch => console.log(` - wss://koppelow.com:3003${ch.path}`));
});
