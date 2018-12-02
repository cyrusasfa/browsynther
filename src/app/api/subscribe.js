import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:5000');

function subscribeToTimer(cb) {
  socket.on('timer', timestamp => {
    cb(null, timestamp)
    console.log('received from server')
  });
  socket.emit('subscribe', 1000);
}

export { subscribeToTimer };
