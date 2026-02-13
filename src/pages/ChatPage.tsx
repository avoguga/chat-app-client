import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { useCall } from '../contexts/CallContext'
import { useSocketChat } from '../hooks/useSocket'
import { Sidebar } from '../components/sidebar'
import { ChatHeader, MessageList, MessageInput, TypingIndicator } from '../components/chat'
import { Conversation, Message, User, MessageType } from '../types'
import { api } from '../services/api'

interface MediaPayload {
  type: MessageType
  mediaUrl: string
  fileName: string
  fileSize: number
  mimeType: string
  duration?: number
}

export function ChatPage() {
  const { user } = useAuth()
  const { socket, isConnected } = useSocket()
  const { startCall } = useCall()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map())

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const { data } = await api.get<{ conversations: Conversation[] }>('/conversations')
        setConversations(data.conversations)
      } catch (error) {
        console.error('Error loading conversations:', error)
      } finally {
        setIsLoadingConversations(false)
      }
    }

    loadConversations()
  }, [])

  // Load messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([])
      return
    }

    const loadMessages = async () => {
      setIsLoadingMessages(true)
      try {
        const { data } = await api.get<{ conversation: Conversation }>(
          `/conversations/${selectedConversation.id}`
        )
        setMessages(data.conversation.messages)
      } catch (error) {
        console.error('Error loading messages:', error)
      } finally {
        setIsLoadingMessages(false)
      }
    }

    loadMessages()
  }, [selectedConversation?.id])

  // Handle new message
  const handleNewMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      // Se a mensagem é do próprio usuário, substituir a mensagem temporária
      if (message.senderId === user?.id) {
        // Remover mensagem temporária e adicionar a real
        const withoutTemp = prev.filter(m => !m.id.startsWith('temp-'))
        return [...withoutTemp, message]
      }
      // Se é de outro usuário, apenas adicionar
      return [...prev, message]
    })

    // Update conversation list with new last message
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === message.conversationId
          ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
          : conv
      ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    )
  }, [user?.id])

  // Handle typing update
  const handleTypingUpdate = useCallback((data: { userId: string; isTyping: boolean }) => {
    setTypingUsers((prev) => {
      const newMap = new Map(prev)
      if (data.isTyping) {
        // Get username from conversation participants
        const participant = selectedConversation?.participants.find(p => p.userId === data.userId)
        if (participant) {
          newMap.set(data.userId, participant.user.username)
        }
      } else {
        newMap.delete(data.userId)
      }
      return newMap
    })
  }, [selectedConversation])

  const { sendMessage, startTyping, stopTyping } = useSocketChat({
    conversationId: selectedConversation?.id,
    onNewMessage: handleNewMessage,
    onTypingUpdate: handleTypingUpdate,
  })

  // Handle send message
  const handleSendMessage = useCallback((content: string) => {
    if (!selectedConversation || !socket) return

    // Optimistic update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      type: 'TEXT',
      status: 'SENT',
      senderId: user!.id,
      conversationId: selectedConversation.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, optimisticMessage])
    sendMessage(content)
  }, [selectedConversation, socket, user, sendMessage])

  // Handle send media message
  const handleSendMedia = useCallback((content: string, media: MediaPayload) => {
    if (!selectedConversation || !socket) return

    // Optimistic update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      type: media.type,
      status: 'SENT',
      senderId: user!.id,
      conversationId: selectedConversation.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mediaUrl: media.mediaUrl,
      fileName: media.fileName,
      fileSize: media.fileSize,
      mimeType: media.mimeType,
      duration: media.duration,
    }

    setMessages((prev) => [...prev, optimisticMessage])

    // Emit via socket
    socket.emit('message:send', {
      conversationId: selectedConversation.id,
      content,
      type: media.type,
      mediaUrl: media.mediaUrl,
      fileName: media.fileName,
      fileSize: media.fileSize,
      mimeType: media.mimeType,
      duration: media.duration,
    })
  }, [selectedConversation, socket, user])

  // Start conversation with user
  const handleStartConversation = async (otherUser: User) => {
    try {
      const { data } = await api.get<{ conversation: Conversation }>(
        `/conversations/direct/${otherUser.id}`
      )

      // Add to conversations if not exists
      setConversations((prev) => {
        const exists = prev.find((c) => c.id === data.conversation.id)
        if (exists) return prev
        return [data.conversation, ...prev]
      })

      setSelectedConversation(data.conversation)
    } catch (error) {
      console.error('Error starting conversation:', error)
    }
  }

  // Handle voice call
  const handleVoiceCall = () => {
    if (otherUser) {
      startCall(otherUser, 'VOICE')
    }
  }

  // Handle video call
  const handleVideoCall = () => {
    if (otherUser) {
      startCall(otherUser, 'VIDEO')
    }
  }

  // Get other user in direct conversation
  const getOtherUser = () => {
    if (!selectedConversation || selectedConversation.type !== 'DIRECT') return null
    return selectedConversation.participants.find(p => p.userId !== user?.id)?.user
  }

  const otherUser = getOtherUser()

  // Handle group created
  const handleGroupCreated = (conversation: Conversation) => {
    setConversations((prev) => [conversation, ...prev])
    setSelectedConversation(conversation)
  }

  // Get display info for conversation
  const getConversationInfo = () => {
    if (!selectedConversation) return null

    if (selectedConversation.type === 'GROUP') {
      return {
        name: selectedConversation.name || 'Grupo',
        isOnline: false,
        isGroup: true,
        participantCount: selectedConversation.participants.length,
      }
    }

    return otherUser ? {
      name: otherUser.displayName || otherUser.username,
      isOnline: otherUser.isOnline,
      isGroup: false,
    } : null
  }

  const conversationInfo = getConversationInfo()

  return (
    <div className="h-screen flex">
      <Sidebar
        conversations={conversations}
        selectedConversationId={selectedConversation?.id}
        onSelectConversation={setSelectedConversation}
        onStartConversation={handleStartConversation}
        onGroupCreated={handleGroupCreated}
        isLoading={isLoadingConversations}
      />

      <main className="flex-1 flex flex-col bg-gray-50">
        {selectedConversation && conversationInfo ? (
          <>
            <ChatHeader
              user={otherUser}
              groupName={conversationInfo.isGroup ? conversationInfo.name : undefined}
              participantCount={conversationInfo.isGroup ? conversationInfo.participantCount : undefined}
              onVoiceCall={!conversationInfo.isGroup ? handleVoiceCall : undefined}
              onVideoCall={!conversationInfo.isGroup ? handleVideoCall : undefined}
            />

            <MessageList messages={messages} isLoading={isLoadingMessages} />

            {typingUsers.size > 0 && (
              <TypingIndicator username={Array.from(typingUsers.values())[0] || ''} />
            )}

            <MessageInput
              onSend={handleSendMessage}
              onSendMedia={handleSendMedia}
              onTypingStart={startTyping}
              onTypingStop={stopTyping}
              disabled={!isConnected}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg
                className="w-24 h-24 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <h2 className="text-xl font-medium">Chat App</h2>
              <p className="mt-2">Selecione uma conversa para comecar</p>
              {!isConnected && (
                <p className="mt-4 text-yellow-600">Conectando ao servidor...</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
