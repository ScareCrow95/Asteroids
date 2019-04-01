const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io").listen(server);
const players = {};
//let isRed = false;

app.use(express.static(__dirname + "/public"));
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

server.listen(80, function() {
  console.log(`Listening on ${server.address().port}`);
});

io.on("connection", function(socket) {
  console.log("a user connected");

  socket.on("playerName", playername => {
    players[socket.id] = {
      rotation: 0,
      x: Math.floor(Math.random() * 18) - 9,
      y: Math.floor(Math.random() * 18) - 9,
      playerId: socket.id,
      rank: Object.keys(players).length,
      score: 0,
      //  team: isRed ? "red" : "blue",
      playername: playername
    };
    socket.emit("currentPlayers", JSON.stringify(Object.values(players)));
    socket.broadcast.emit("newPlayer", JSON.stringify(players[socket.id]));
  });

  socket.on("disconnect", function() {
    console.log("user disconnected");
    delete players[socket.id];
    io.emit("playerDisconnect", socket.id);
  });

  socket.on("playerMovement", movementData => {
    try {
      movementData = JSON.parse(movementData);
      players[socket.id].x = movementData.x;
      players[socket.id].y = movementData.y;
      players[socket.id].rotation = movementData.rotation;
      socket.broadcast.emit(
        "playerMovement",
        JSON.stringify(players[socket.id])
      );
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("fire", data => {
    console.log("fire : " + data);

    socket.broadcast.emit("fire", data);
  });

  socket.on("playerHit", data => {
    console.log("hit : " + data);

    delete players[JSON.parse(data).playerId];
    io.emit("playerHit", data);
  });
});
