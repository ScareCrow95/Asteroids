let isRed = false
module.exports = id => {
  console.log('a user connected')
  isRed = !isRed
  return {
    rotation: 0,
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: id,
    team: isRed ? 'red' : 'blue'
  }
}
