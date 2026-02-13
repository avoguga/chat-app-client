export type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | 'SYSTEM'
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
  // Campos de mídia
  mediaUrl?: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  duration?: number
}

export interface SendMessagePayload {
  conversationId: string
  content: string
  type?: MessageType
  mediaUrl?: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  duration?: number
}
