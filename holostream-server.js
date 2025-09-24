const WebSocket = require('ws');
const fs = require('fs');
const https = require('https');

const server = https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/koppelow.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/koppelow.com/fullchain.pem'),
});

const wss1 = new WebSocket.Server({ server, path: '/holostream' });
const wss2 = new WebSocket.Server({ server, path: '/holostream2' });

[wss1, wss2].forEach((wss, i) => {
  wss.on('connection', socket => {
    console.log(`🔌 Client connected to ${i === 0 ? '/holostream' : '/holostream2'}`);

    socket.on('message', message => {
      let data;
      try {
        data = JSON.parse(message);
      } catch (e) {
        console.error('❌ Failed to parse message:', message);
        return;
      }

      console.log('📨 Message:', data);

      // Cache & broadcast
      if (data.type === 'offer') {
        lastOffer = data;
        lastCandidates = [];
      } else if (data.type === 'candidate') {
        lastCandidates.push(data);
      }

      wss.clients.forEach(client => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });

    socket.on('close', () => {
      console.log('❌ Client disconnected');
    });
  });
});

server.listen(3003, () => {
  console.log('🚀 WebSocket signaling server running at:');
  console.log('   wss://koppelow.com:3003/holostream');
  console.log('   wss://koppelow.com:3003/holostream2');
});
