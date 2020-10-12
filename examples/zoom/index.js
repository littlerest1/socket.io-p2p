const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('public'))


app.get('/', (req, res) => {
  res.render('room',{ roomId: `${uuidV4()}`, status: 'lounge'});
 //res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room, status: 'InRoom' })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
      socket.join(roomId)
      socket.to(roomId).broadcast.emit('user-connected', userId)
      console.log('here')
      socket.on('disconnect', () => {
        socket.to(roomId).broadcast.emit('user-disconnected', userId)
      })
    })
  })

server.listen(3000, function () {
    console.log('Listening on 3000')
})