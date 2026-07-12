const net = require('net');
const server = net.createServer();
server.listen(3000, '0.0.0.0', () => {
  console.log('Successfully bound to port 3000');
  server.close();
});
server.on('error', (e) => {
  console.error('Error binding to port 3000:', e.code);
});
