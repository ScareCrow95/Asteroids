const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io").listen(server);
const players = {};
//let isRed = false;
const collectibles = {};

const powerUps = ["scope", "fastFire", "burstFire", "turbo"];
let isPickupRunning = false;
app.use(express.static(__dirname + "/public"));
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

server.listen(8084, function () {
  console.log(`Listening on ${server.address().port}`);
  var rand = Math.round(Math.random() * 10000) + 4000;
  //console.log(rand);

  setTimeout(spawnItems, rand);
});

io.on("connection", function (socket) {
  //console.log("a user connected");

  socket.on("playerName", playername => {
    players[socket.id] = {
      rotation: 0,
      x: Math.random() * 18 - 9,
      y: Math.random() * 18 - 9,
      playerId: socket.id,
      rank: Object.keys(players).length,
      score: 0,
      //  team: isRed ? "red" : "blue",
      playername: playername
    };
    socket.emit("currentPlayers", JSON.stringify(Object.values(players)));
    socket.broadcast.emit("newPlayer", JSON.stringify(players[socket.id]));
    if (!isPickupRunning) {
      spawnItems();
    }
  });

  socket.on("disconnect", function () {
    //console.log("user disconnected");
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
    //console.log("fire : " + data);
    socket.broadcast.emit("fire", data);
  });

  socket.on("fireBurst", data => {
    //console.log("fireBurst : " + data);
    socket.broadcast.emit("fireBurst", data);
  });

  socket.on("playerHit", data => {
    //console.log("hit : " + data);
    delete players[JSON.parse(data).playerId];
    io.emit("playerHit", data);
  });

  socket.on("itemConsume", data => {
    //console.log("consume : " + data);
    const k = collectibles[data];
    clearTimeout(k.timeout);
    delete collectibles[data];
    socket.broadcast.emit("itemConsume", data);
  });
});

function spawnItems() {
  if (Object.keys(players).length === 0) {
    isPickupRunning = false;
    return;
  } else {
    isPickupRunning = true;
  }
  const spawn = powerUps[Math.floor(Math.random() * powerUps.length)];
  const id = Date.now().toString();
  collectibles[id] = {
    powerup: spawn,
    id: id,
    x: Math.random() * 16 - 8,
    y: Math.random() * 16 - 8
  };
  io.emit("itemAdded", JSON.stringify(collectibles[id]));
  collectibles[id].timeout = setTimeout(() => expireItems(id), 15000);
  var rand = Math.round(Math.random() * 10000) + 4000;
  setTimeout(spawnItems, rand);
}

function expireItems(id) {
  io.emit("itemExpire", id);
  delete collectibles[id];
}
