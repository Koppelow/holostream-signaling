const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');

// SSL certificates
const sslOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/koppelow.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/koppelow.com/fullchain.pem'),
};

// --- Channel 1: /holostream ---
const server1 = https.createServer(sslOptions);
const wss1 = new WebSocket.Server({ server: server1, path: '/holostream' });

wss1.on('connection', socket => {
  console.log('🔌 Client connected to /holostream');

  socket.on('message', message => {
    // Broadcast to all other clients in this channel
    wss1.clients.forEach(client => {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  socket.on('close', () => console.log('❌ Client disconnected from /holostream'));
});

server1.listen(3003, () => {
  console.log('🚀 Channel 1 running at wss://koppelow.com:3003/holostream');
});

// --- Channel 2: /holostream2 ---
const server2 = https.createServer(sslOptions);
const wss2 = new WebSocket.Server({ server: server2, path: '/holostream2' });

wss2.on('connection', socket => {
  console.log('🔌 Client connected to /holostream2');

  socket.on('message', message => {
    // Broadcast to all other clients in this channel
    wss2.clients.forEach(client => {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  socket.on('close', () => console.log('❌ Client disconnected from /holostream2'));
});

server2.listen(3004, () => {
  console.log('🚀 Channel 2 running at wss://koppelow.com:3004/holostream2');
});
