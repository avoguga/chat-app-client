import { createContext, useContext, ReactNode, useState } from 'react'
import { useWebRTC } from '../hooks/useWebRTC'
import { CallType, User } from '../types'
import { IncomingCall, CallContainer } from '../components/call'

interface CallContextType {
  startCall: (user: User, type: CallType) => void
  isInCall: boolean
}

const CallContext = createContext<CallContextType | null>(null)

export function CallProvider({ children }: { children: ReactNode }) {
  const [callUser, setCallUser] = useState<User | null>(null)
  const [callType, setCallType] = useState<CallType>('VOICE')

  const {
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
  } = useWebRTC()

  const startCall = async (user: User, type: CallType) => {
    setCallUser(user)
    setCallType(type)
    await initiateCall(user.id, type)
  }

  const handleAcceptCall = async () => {
    if (incomingCall) {
      setCallUser(incomingCall.caller)
      setCallType(incomingCall.type)
      await acceptCall()
    }
  }

  const handleEndCall = () => {
    endCall()
    setCallUser(null)
  }

  const isInCall = callState !== 'idle'

  return (
    <CallContext.Provider value={{ startCall, isInCall }}>
      {children}

      {/* Incoming call modal */}
      {incomingCall && callState === 'ringing' && (
        <IncomingCall
          caller={incomingCall.caller}
          type={incomingCall.type}
          onAccept={handleAcceptCall}
          onReject={rejectCall}
        />
      )}

      {/* Active call overlay */}
      {isInCall && callState !== 'ringing' && callUser && (
        <CallContainer
          localStream={localStream}
          remoteStream={remoteStream}
          callState={callState}
          callType={callType}
          remoteName={callUser.displayName || callUser.username}
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          onToggleMute={toggleMute}
          onToggleCamera={toggleCamera}
          onEndCall={handleEndCall}
        />
      )}
    </CallContext.Provider>
  )
}

export function useCall() {
  const context = useContext(CallContext)
  if (!context) {
    throw new Error('useCall must be used within a CallProvider')
  }
  return context
}
