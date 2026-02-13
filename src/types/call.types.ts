import { User } from './user.types'

export type CallType = 'VOICE' | 'VIDEO'
export type CallStatus = 'RINGING' | 'ONGOING' | 'ENDED' | 'MISSED' | 'REJECTED' | 'FAILED'

export interface Call {
  id: string
  type: CallType
  status: CallStatus
  initiatorId: string
  receiverId: string
  initiator?: User
  receiver?: User
  startedAt?: string
  endedAt?: string
  duration?: number
  createdAt: string
}

export interface IncomingCallPayload {
  callId: string
  initiator: User
  type: CallType
}

export interface RTCOfferPayload {
  callId: string
  offer: RTCSessionDescriptionInit
}

export interface RTCAnswerPayload {
  callId: string
  answer: RTCSessionDescriptionInit
}

export interface RTCIceCandidatePayload {
  callId: string
  candidate: RTCIceCandidateInit
}
