const WebSocket = require('ws');
const https = require('https');

const server = https.createServer({
  key: fs.readFileSync('path/to/key.pem'),
  cert: fs.readFileSync('path/to/cert.pem')
});

// Two signaling paths
const wss1 = new WebSocket.Server({ server, path: '/holostream' });
const wss2 = new WebSocket.Server({ server, path: '/holostream2' });

[wss1, wss2].forEach((wss, i) => {
  wss.on('connection', socket => {
    console.log(`Client connected to ${i === 0 ? '/holostream' : '/holostream2'}`);

    socket.on('message', message => {
      let data;
      try { data = JSON.parse(message); } catch { return; }

      // Broadcast to all other clients
      wss.clients.forEach(client => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });

    socket.on('close', () => console.log('Client disconnected'));
  });
});

server.listen(3003, () => console.log('WebSocket server listening on 3003'));
