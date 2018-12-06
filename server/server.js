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

io.on('connection', function(client) {
  console.log('a user connected');
  console.log(client.id);

  client.on('subscribe', (userState) => {
    console.log('client is subscribing to with attributes', userState);
    client.state = userState;
    client.emit('timer', client.state);
  });

  client.on("message-from-browser", function (obj) {
   console.log(JSON.stringify(obj));
   echoInput(`${obj.message} back at you from the server`);
  });

  client.on('disconnect', () => {
    console.log('user disconnected')
  });
});

server.listen(port);
console.log(`Node server running on port ${port}...`);
