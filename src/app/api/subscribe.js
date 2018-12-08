import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:5000');

function subscribe(cb, user) {
  socket.on('userUpdate', (userId, userState) => {
    console.log(userId);
    console.log(userState);
    cb(null, userId, userState);
  });
  socket.emit('update', user);
}

function sendSocketUpdate(userState) {
  socket.emit('update', userState);
}

export { subscribe, sendSocketUpdate };
