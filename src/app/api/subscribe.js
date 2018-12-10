import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:5000');

function subscribe(userUpdate, removeUser, user) {
  socket.on('userUpdate', (userId, userState) => {
    userUpdate(null, userId, userState);
  });

  socket.on('userDisconnect', userId => {
    removeUser(null, userId)
  });
  socket.emit('update', user);
  user.setHasChangedSynth(false);
}

function sendSocketUpdate(userState) {
  socket.emit('update', userState);
}

export { subscribe, sendSocketUpdate };
