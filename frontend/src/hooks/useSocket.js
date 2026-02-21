import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '@/context/AuthContext'

const SOCKET_URL = 'http://localhost:5000'

export function useSocket() {
  const socket = useRef(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user && !socket.current) {
      socket.current = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      })

      socket.current.on('connect', () => {
        console.log('Socket.io connected')
      })

      socket.current.on('disconnect', () => {
        console.log('Socket.io disconnected')
      })
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect()
        socket.current = null
      }
    }
  }, [user])

  const emit = (event, data) => {
    if (socket.current) {
      socket.current.emit(event, data)
    }
  }

  const on = (event, callback) => {
    if (socket.current) {
      socket.current.on(event, callback)
      return () => {
        if (socket.current) {
          socket.current.off(event, callback)
        }
      }
    }
    // Return a no-op function when socket is not available
    return () => {}
  }

  return { socket: socket.current, emit, on }
}
