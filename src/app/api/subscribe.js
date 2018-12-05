import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:5000');

function subscribe(cb, color) {
  socket.on('timer', timestamp => {
    cb(null, timestamp)
  });
  socket.emit('subscribe', color);
}

export { subscribe };
