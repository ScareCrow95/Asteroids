const players = {}
const createPlayer = require('./components/createPlayer')
const updatePlayer = require('./components/updatePlayer')

module.exports = io => {
  let isRed = false

  io.on('connection', socket => {
    players[socket.id] = createPlayer(socket.id)
    socket.emit('currentPlayers', players)
    socket.broadcast.emit('newPlayer', players[socket.id])

    socket.on('disconnect', () => {
      delete players[socket.id]
      io.emit('disconnect', socket.id)
    })

    socket.on('playerMovement', movementData => {
      updatePlayer(players[socket.id], movementData)
      socket.broadcast.emit('playerMoved', players[socket.id])
    })

    socket.on('shoot', movementData => {
      updatePlayer(players[socket.id], movementData)
      socket.broadcast.emit('playerShoot', players[socket.id])
    })

    socket.on('hitPlayer', () => {
      delete players[socket.id]
      socket.broadcast.emit('hitPlayer', socket.id)
    })
  })
}
