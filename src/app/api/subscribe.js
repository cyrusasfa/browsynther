import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:5000');

function subscribe(cb, user) {
  socket.on('timer', userState => {
    cb(null, userState)
  });
  socket.emit('subscribe', user);
}

function sendSocketUpdate(user) {
  socket.emit('subscribe', user);
}

export { subscribe, sendSocketUpdate };
