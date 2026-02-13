import { useEffect, useCallback } from 'react'
import { useSocket as useSocketContext } from '../contexts/SocketContext'
import { Message } from '../types'

interface UseSocketChatOptions {
  conversationId?: string
  onNewMessage?: (message: Message) => void
  onTypingUpdate?: (data: { userId: string; isTyping: boolean }) => void
  onPresenceUpdate?: (data: { userId: string; isOnline: boolean }) => void
}

export function useSocketChat({
  conversationId,
  onNewMessage,
  onTypingUpdate,
  onPresenceUpdate,
}: UseSocketChatOptions = {}) {
  const { socket, isConnected, joinRoom, leaveRoom } = useSocketContext()

  // Join/leave room when conversation changes
  useEffect(() => {
    if (!conversationId || !isConnected) return

    joinRoom(conversationId)

    return () => {
      leaveRoom(conversationId)
    }
  }, [conversationId, isConnected, joinRoom, leaveRoom])

  // Listen for new messages
  useEffect(() => {
    if (!socket || !onNewMessage) return

    socket.on('message:new', onNewMessage)

    return () => {
      socket.off('message:new', onNewMessage)
    }
  }, [socket, onNewMessage])

  // Listen for typing updates
  useEffect(() => {
    if (!socket || !onTypingUpdate) return

    const handler = (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      onTypingUpdate({ userId: data.userId, isTyping: data.isTyping })
    }

    socket.on('typing:update', handler)

    return () => {
      socket.off('typing:update', handler)
    }
  }, [socket, onTypingUpdate])

  // Listen for presence updates
  useEffect(() => {
    if (!socket || !onPresenceUpdate) return

    const handler = (data: { userId: string; isOnline: boolean }) => {
      onPresenceUpdate(data)
    }

    socket.on('presence:update', handler)

    return () => {
      socket.off('presence:update', handler)
    }
  }, [socket, onPresenceUpdate])

  const sendMessage = useCallback((content: string) => {
    if (!socket || !conversationId) return

    socket.emit('message:send', { conversationId, content })
  }, [socket, conversationId])

  const startTyping = useCallback(() => {
    if (!socket || !conversationId) return
    socket.emit('typing:start', conversationId)
  }, [socket, conversationId])

  const stopTyping = useCallback(() => {
    if (!socket || !conversationId) return
    socket.emit('typing:stop', conversationId)
  }, [socket, conversationId])

  const markAsRead = useCallback((messageId: string) => {
    if (!socket || !conversationId) return
    socket.emit('message:read', { conversationId, messageId })
  }, [socket, conversationId])

  return {
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
  }
}
