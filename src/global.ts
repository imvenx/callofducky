import { type Socket, io } from 'socket.io-client'

const socketAddress = location.protocol + '//' + location.hostname + ':3000'

export const socket: Socket = io(socketAddress)