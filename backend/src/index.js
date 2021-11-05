require('dotenv').config()

const { createServer } = require('http')
const { Server } = require('socket.io')
const { randomBytes } = require('crypto')

const httpServer = createServer()

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

const { PORT = 3030 } = process.env

const STORAGE = {}

io.on('connection', (socket) => {
  const createBeat = (vkid, beat) => {
    const arrayBeat = JSON.parse(beat)

    const id = randomBytes(10).toString('hex')

    STORAGE[id] = {
      beat: arrayBeat,
      creator: vkid,
    }

    socket.join('beats/' + id)

    socket.emit('beat-created', id)
  }

  const updateBeat = (vkid, beatId, beat) => {
    const arrayBeat = JSON.parse(beat)

    if (!STORAGE[beatId]) return

    if (STORAGE[beatId].creator !== vkid) return

    STORAGE[beatId] = {
      ...STORAGE[beatId],
      beat: arrayBeat,
    }

    socket.to('beats/' + beatId).emit('beat-updated', STORAGE[beatId])
  }

  const getBeat = (beatId) => {
    socket.join('beats/' + beatId)

    socket.emit('beat', STORAGE[beatId])
  }

  const startBeat = (vkid, beatId) => {
    const beat = STORAGE[beatId]

    if (!beat) return

    if (beat.creator !== vkid) return

    beat.start = Date.now()

    socket.in('beats/' + beatId).emit('beat-started', beat)
    socket.emit('beat-started', beat)
  }

  const stopBeat = (vkid, beatId) => {
    const beat = STORAGE[beatId]

    if (!beat) return

    if (beat.creator !== vkid) return

    delete beat.start

    socket.in('beats/' + beatId).emit('beat-stopped', beat)
    socket.emit('beat-stopped', beat)
  }

  socket.on('create', createBeat)
  socket.on('update', updateBeat)
  socket.on('get', getBeat)
  socket.on('start', startBeat)
  socket.on('stop', stopBeat)
})

httpServer.listen(PORT)
