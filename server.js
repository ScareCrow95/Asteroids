const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io').listen(server)
const players = {}
const socketManager = require('./game/socketManager')
app.use(express.static(__dirname + '/public'))

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html')
})

server.listen(8081, function() {
  console.log(`Listening on ${server.address().port}`)
})

socketManager(io)
