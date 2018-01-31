let port = process.env.PORT || 8000;
let express = require('express');
let app = express();
let server = require('http').createServer(app).listen(port, function () {
  console.log('Server listening at port: ', port);
});

app.use(express.static('public'));
app.use('/scripts', express.static(__dirname + '/node_modules/tracking/build/'));


let io = require('socket.io').listen(server);

let players = {};

const xWorld = 4000;
const yWorld = 4000;

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max))
}

io.sockets.on('connection',
  function (socket) {

    // Initialize new player
    console.log("We have a new player: " + socket.id)

    let player = {
      id: socket.id,
      rectangles: [{x:1, y:1, width: 10, height: 100}]
    }
    players[socket.id] = player

    socket.emit('initialize', {
      id: socket.id,
      players: players
    })

    socket.broadcast.emit('player_added', player)

    // Remove disconnected player
    socket.on('disconnect', function() {
      delete players[socket.id]

      io.sockets.emit('player_deleted', socket.id)
    })

    // When user has rectangles
    socket.on('rectangles', function(rectangles) {
      debugger
      players[socket.id] = Object.assign(players[socket.id], {
        rectangles: rectangles
      })

      io.sockets.emit('player_updated', players[socket.id])
    })
  }
);
