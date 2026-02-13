import { Message, MessageStatus, SendMessagePayload } from './message.types'
import { CallType, IncomingCallPayload, RTCOfferPayload, RTCAnswerPayload, RTCIceCandidatePayload } from './call.types'

// Client -> Server
export interface ClientToServerEvents {
  // Messages
  'message:send': (data: SendMessagePayload) => void
  'message:delivered': (messageId: string) => void
  'message:read': (data: { conversationId: string; messageId: string }) => void

  // Typing
  'typing:start': (conversationId: string) => void
  'typing:stop': (conversationId: string) => void

  // Presence
  'presence:online': () => void
  'presence:offline': () => void

  // Rooms
  'room:join': (conversationId: string) => void
  'room:leave': (conversationId: string) => void

  // WebRTC Signaling
  'call:initiate': (data: { receiverId: string; type: CallType }) => void
  'call:accept': (callId: string) => void
  'call:reject': (callId: string) => void
  'call:end': (callId: string) => void
  'rtc:offer': (data: RTCOfferPayload) => void
  'rtc:answer': (data: RTCAnswerPayload) => void
  'rtc:ice-candidate': (data: RTCIceCandidatePayload) => void
}

// Server -> Client
export interface ServerToClientEvents {
  // Messages
  'message:new': (message: Message) => void
  'message:status': (data: { messageId: string; status: MessageStatus }) => void

  // Typing
  'typing:update': (data: { conversationId: string; userId: string; isTyping: boolean }) => void

  // Presence
  'presence:update': (data: { userId: string; isOnline: boolean; lastSeen?: string }) => void

  // WebRTC Signaling
  'call:initiated': (data: { callId: string }) => void
  'call:incoming': (data: IncomingCallPayload) => void
  'call:accepted': (callId: string) => void
  'call:rejected': (callId: string) => void
  'call:ended': (callId: string) => void
  'rtc:offer': (data: RTCOfferPayload) => void
  'rtc:answer': (data: RTCAnswerPayload) => void
  'rtc:ice-candidate': (data: RTCIceCandidatePayload) => void

  // Errors
  'error': (error: { code: string; message: string }) => void
}
