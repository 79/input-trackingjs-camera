let socket = io()
let players
let player_id
let growth

const DEBUG = false
const xWorld = 210
const yWorld = 130

window.onload = function() {
  var rectangles = [];
  var video = document.getElementById('video')
  var tracker = new tracking.ObjectTracker('face');
  tracker.setInitialScale(4);
  tracker.setStepSize(2);
  tracker.setEdgesDensity(0.1);
  tracking.track('#video', tracker, { camera: true });

  tracker.on('track', function(event) {
    event.data.forEach(function(rectangle) {
      rectangles.push({
        x: rectangle.x,
        y: rectangle.y,
        width: rectangle.width,
        height: rectangle.height
      })
      console.log("x", rectangle.x, " y", rectangle.y)
    });
    socket.emit('rectangles', rectangles)
  });
};

function setup() {
  createCanvas(windowWidth, windowHeight)
  background(255)

  // Listen for confirmation of connection
  socket.on('connected', function () {
    console.log("Connected")
  });

  // Receive world state
  socket.on('initialize', function (state) {
    player_id = state.id
    players = state.players
  })

  socket.on('player_added', function(player) {
    players[player.id] = player
  })

  socket.on('player_deleted', function(id) {
    delete players[id]
  })

  socket.on('player_updated', function(player) {
    players[player.id] = player
  })
}

function draw() {
  background(0);
  noStroke();
  fill(255);

  // Wait until game initializes before drawing
  if (players === undefined || player_id === undefined) {
    return
  }

  let currentTime = Date.now()

  // Draw self
  let me = players[player_id]
  me.rectangles.forEach(function(rectangle) {
    push()
    rectMode(CENTER)
    let x = map(-rectangle.x, -xWorld, 0, 0, windowWidth)
    let y = map(rectangle.y, 0, yWorld, 0, windowHeight)
    fill("white")
    rect(x, y, rectangle.width, rectangle.height)
    pop()
  })

  // Draw other players
  for (let id in players) {
    if (id === player_id) { continue; }

    let player = players[id]
    push()
    rectMode(CENTER)
    fill(player.color.r, player.color.g, player.color.b)

    player.rectangles.forEach(function(rectangle) {
      let x = map(-rectangle.x, -xWorld, 0, 0, windowWidth)
      let y = map(rectangle.y, 0, yWorld, 0, windowHeight)
      rect(x, y, rectangle.width, rectangle.height)
    })

    pop()
  }


  if (DEBUG) {
    textAlign(CENTER)
    fill("cyan")
    text(player_id, 10, 30)
    text(Object.keys(players).length, 0, 0)
  }
}
