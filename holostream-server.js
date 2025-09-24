const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');

const server = https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/koppelow.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/koppelow.com/fullchain.pem'),
});

const wss1 = new WebSocket.Server({ server, path: '/holostream' });
const wss2 = new WebSocket.Server({ server, path: '/holostream2' });

[wss1, wss2].forEach((wss, i) => {
  const path = i === 0 ? '/holostream' : '/holostream2';
  wss.on('connection', socket => {
    console.log(`Client connected to ${path}`);
    socket.on('message', message => {
      wss.clients.forEach(client => {
        if (client !== socket && client.readyState === WebSocket.OPEN) client.send(message);
      });
    });
  });
});

server.listen(3003, () => console.log('Listening on 3003'));
