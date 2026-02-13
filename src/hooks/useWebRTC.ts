import { useState, useCallback, useRef, useEffect } from 'react'
import { useSocket } from '../contexts/SocketContext'
import { WebRTCService, CallState } from '../services/webrtcService'
import { User, CallType } from '../types'

interface UseWebRTCReturn {
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  callState: CallState
  isMuted: boolean
  isCameraOff: boolean
  incomingCall: { callId: string; caller: User; type: CallType } | null
  initiateCall: (userId: string, type: CallType) => Promise<void>
  acceptCall: () => Promise<void>
  rejectCall: () => void
  endCall: () => void
  toggleMute: () => void
  toggleCamera: () => void
}

export function useWebRTC(): UseWebRTCReturn {
  const { socket } = useSocket()
  const webrtcRef = useRef<WebRTCService | null>(null)

  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [callState, setCallState] = useState<CallState>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [currentCallId, setCurrentCallId] = useState<string | null>(null)
  const [incomingCall, setIncomingCall] = useState<{
    callId: string
    caller: User
    type: CallType
  } | null>(null)

  // Initialize WebRTC service
  const initWebRTC = useCallback(() => {
    if (webrtcRef.current) {
      webrtcRef.current.close()
    }

    webrtcRef.current = new WebRTCService({
      onLocalStream: setLocalStream,
      onRemoteStream: setRemoteStream,
      onCallStateChange: setCallState,
      onIceCandidate: (candidate) => {
        if (socket && currentCallId) {
          socket.emit('rtc:ice-candidate', {
            callId: currentCallId,
            candidate: candidate.toJSON(),
          })
        }
      },
    })

    return webrtcRef.current
  }, [socket, currentCallId])

  // Listen for incoming calls
  useEffect(() => {
    if (!socket) return

    socket.on('call:incoming', (data) => {
      setIncomingCall({
        callId: data.callId,
        caller: data.initiator,
        type: data.type,
      })
      setCallState('ringing')
    })

    socket.on('call:accepted', async (callId) => {
      if (callId === currentCallId && webrtcRef.current) {
        const offer = await webrtcRef.current.createOffer()
        socket.emit('rtc:offer', { callId, offer })
      }
    })

    socket.on('call:rejected', (callId) => {
      if (callId === currentCallId) {
        endCall()
      }
    })

    socket.on('call:ended', (callId) => {
      if (callId === currentCallId) {
        endCall()
      }
    })

    socket.on('rtc:offer', async (data) => {
      if (data.callId === currentCallId && webrtcRef.current) {
        const answer = await webrtcRef.current.handleOffer(data.offer)
        socket.emit('rtc:answer', { callId: data.callId, answer })
      }
    })

    socket.on('rtc:answer', async (data) => {
      if (data.callId === currentCallId && webrtcRef.current) {
        await webrtcRef.current.handleAnswer(data.answer)
      }
    })

    socket.on('rtc:ice-candidate', async (data) => {
      if (data.callId === currentCallId && webrtcRef.current) {
        await webrtcRef.current.addIceCandidate(data.candidate)
      }
    })

    return () => {
      socket.off('call:incoming')
      socket.off('call:accepted')
      socket.off('call:rejected')
      socket.off('call:ended')
      socket.off('rtc:offer')
      socket.off('rtc:answer')
      socket.off('rtc:ice-candidate')
    }
  }, [socket, currentCallId])

  // Initiate a call
  const initiateCall = useCallback(async (userId: string, type: CallType) => {
    if (!socket) return

    const webrtc = initWebRTC()
    await webrtc.initializeMedia(type === 'VIDEO')

    setCallState('calling')

    socket.emit('call:initiate', { receiverId: userId, type })

    // Listen for call initiated response
    const handleInitiated = (data: { callId: string }) => {
      setCurrentCallId(data.callId)
      socket.off('call:initiated', handleInitiated)
    }
    socket.on('call:initiated', handleInitiated)
  }, [socket, initWebRTC])

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    if (!socket || !incomingCall) return

    const webrtc = initWebRTC()
    await webrtc.initializeMedia(incomingCall.type === 'VIDEO')

    setCurrentCallId(incomingCall.callId)
    socket.emit('call:accept', incomingCall.callId)
    setIncomingCall(null)
  }, [socket, incomingCall, initWebRTC])

  // Reject incoming call
  const rejectCall = useCallback(() => {
    if (!socket || !incomingCall) return

    socket.emit('call:reject', incomingCall.callId)
    setIncomingCall(null)
    setCallState('idle')
  }, [socket, incomingCall])

  // End call
  const endCall = useCallback(() => {
    if (socket && currentCallId) {
      socket.emit('call:end', currentCallId)
    }

    webrtcRef.current?.close()
    webrtcRef.current = null

    setLocalStream(null)
    setRemoteStream(null)
    setCallState('idle')
    setCurrentCallId(null)
    setIncomingCall(null)
    setIsMuted(false)
    setIsCameraOff(false)
  }, [socket, currentCallId])

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (webrtcRef.current) {
      const muted = webrtcRef.current.toggleMute()
      setIsMuted(muted)
    }
  }, [])

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (webrtcRef.current) {
      const cameraOff = webrtcRef.current.toggleCamera()
      setIsCameraOff(cameraOff)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      webrtcRef.current?.close()
    }
  }, [])

  return {
    localStream,
    remoteStream,
    callState,
    isMuted,
    isCameraOff,
    incomingCall,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
  }
}
