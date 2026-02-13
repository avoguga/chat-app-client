export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM'
export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ'

export interface Message {
  id: string
  content: string
  type: MessageType
  status: MessageStatus
  senderId: string
  conversationId: string
  createdAt: string
  updatedAt: string
}

export interface SendMessagePayload {
  conversationId: string
  content: string
}
