import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:5000');

function subscribe(registerUser, removeUser, user) {
  socket.on('userUpdate', (userId, userState) => {
    registerUser(null, userId, userState);
  });
  
  socket.on('userDisconnect', userId => {
    removeUser(null, userId)
  });
  socket.emit('update', user);
}

function sendSocketUpdate(userState) {
  socket.emit('update', userState);
}

export { subscribe, sendSocketUpdate };
