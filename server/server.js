const port = process.env.PORT || 5000;
const express = require('express');
const http = require('http');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = require('socket.io').listen(server);
const webpack = require('webpack');
const webpackConfig = require('../webpack.config');
const compiler = webpack(webpackConfig);

app.use(
    require('webpack-dev-middleware')(compiler, {
        noInfo: true,
        publicPath: webpackConfig.output.publicPath
    })
);

app.use(require('webpack-hot-middleware')(compiler));

app.use(express.static(path.join(__dirname, '../src/public')));

var clients = [];

io.on('connection', function(client) {
  console.log('a user connected');
  console.log(client.id);
  clients.push(client);

  client.on('update', (userState) => {
    console.log('client is updating with attributes', userState);
    client.state = userState;
    for (let c of clients) {
      c.emit('userUpdate', client.id, client.state);
    }
  });

  client.on("message-from-browser", function (obj) {
   console.log(JSON.stringify(obj));
   echoInput(`${obj.message} back at you from the server`);
  });

  client.on('disconnect', () => {
    console.log('user disconnected')
    clients.splice(clients.indexOf(client), 1);
  });
});

server.listen(port);
console.log(`Node server running on port ${port}...`);
