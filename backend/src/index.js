require('dotenv').config()

const { createServer } = require('http')
const { Server } = require('socket.io')

const httpServer = createServer()

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

const { PORT = 3030 } = process.env

const SHAKES = {}
const TIMEOUT_IDS = {}

io.on('connection', (socket) => {
  const auth = (vkid) => {
    console.log('auth', vkid)

    socket.join('users/' + vkid)
  }

  const pair = (myVkid, friendVkid) => {
    console.log('pair', myVkid, friendVkid)

    socket.in('users/' + friendVkid).emit('pair-created', myVkid)
    socket.emit('pair-created', friendVkid)
  }

  const divorce = (myVkid, friendVkid) => {
    console.log('divorce', myVkid, friendVkid)

    socket.in('users/' + friendVkid).emit('pair-divorced', myVkid)
    socket.emit('pair-divorced', friendVkid)
  }

  const shake = (myVkid, friendVkid) => {
    console.log('shake', myVkid, friendVkid)

    SHAKES[myVkid] = true

    if (TIMEOUT_IDS[myVkid] !== undefined) {
      clearTimeout(TIMEOUT_IDS[myVkid])
    }
    TIMEOUT_IDS[myVkid] = setTimeout(() => (SHAKES[myVkid] = false), 3000)

    if (SHAKES[friendVkid]) {
      socket.in('users/' + friendVkid).emit('pair-handshaked', myVkid)

      socket.emit('pair-handshaked', friendVkid)
    }
  }

  socket.on('auth', auth)
  socket.on('pair', pair)
  socket.on('divorce', divorce)
  socket.on('shake', shake)
})

httpServer.listen(PORT)
