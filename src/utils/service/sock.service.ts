import { io } from 'socket.io-client'

const sock = io(/*'http://localhost:3030'*/ 'https://patimeiker.s.ix3.space', {
  reconnectionDelayMax: 10000,
  transports: ['websocket'],
})

export default sock
