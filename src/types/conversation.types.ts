import { User } from './user.types'
import { Message } from './message.types'

export type ConversationType = 'DIRECT' | 'GROUP'

export interface Participant {
  id: string
  userId: string
  conversationId: string
  joinedAt: string
  lastReadAt: string
  isAdmin: boolean
  user: User
}

export interface Conversation {
  id: string
  type: ConversationType
  name?: string
  participants: Participant[]
  messages: Message[]
  lastMessage?: Message
  createdAt: string
  updatedAt: string
}
