import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'
import { ClientToServerEvents, ServerToClientEvents } from '../types'

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

interface SocketContextType {
  socket: TypedSocket | null
  isConnected: boolean
  joinRoom: (conversationId: string) => void
  leaveRoom: (conversationId: string) => void
}

const SocketContext = createContext<SocketContextType | null>(null)

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001'

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<TypedSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    const token = localStorage.getItem('token')
    if (!token) return

    const newSocket: TypedSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    newSocket.on('connect', () => {
      console.log('Socket connected')
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [isAuthenticated])

  const joinRoom = useCallback((conversationId: string) => {
    if (socket?.connected) {
      socket.emit('room:join', conversationId)
    }
  }, [socket])

  const leaveRoom = useCallback((conversationId: string) => {
    if (socket?.connected) {
      socket.emit('room:leave', conversationId)
    }
  }, [socket])

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinRoom, leaveRoom }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
