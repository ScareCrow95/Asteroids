const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io").listen(server);
const players = {};
let isRed = false;
app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

server.listen(8085, function() {
  console.log(`Listening on ${server.address().port}`);
});

io.on("connection", function(socket) {
  console.log("a user connected");
  players[socket.id] = {
    rotation: 0,
    x: Math.floor(Math.random() * 18) - 9,
    y: Math.floor(Math.random() * 18) - 9,
    playerId: socket.id,
    team: isRed ? "red" : "blue"
  };
  isRed = !isRed;
  // send the players object to the new player
  socket.emit("currentPlayers", JSON.stringify(Object.values(players)));
  // update all other players of the new player
  socket.broadcast.emit("newPlayer", JSON.stringify(players[socket.id]));

  socket.on("disconnect", function() {
    console.log("user disconnected");
    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit("playerDisconnect", socket.id);
  });

  socket.on("playerMovement", movementData => {
    movementData = JSON.parse(movementData);
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].rotation = movementData.rotation;
    // emit a message to all players about the player that moved
    socket.broadcast.emit("playerMovement", JSON.stringify(players[socket.id]));
  });

  socket.on("fire", movementData => {
    socket.broadcast.emit("fire", movementData);
  });
});
