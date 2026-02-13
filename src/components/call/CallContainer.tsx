import { CallState } from '../../services/webrtcService'
import { CallType } from '../../types'
import { VideoPlayer } from './VideoPlayer'
import { CallControls } from './CallControls'

interface CallContainerProps {
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  callState: CallState
  callType: CallType
  remoteName: string
  isMuted: boolean
  isCameraOff: boolean
  onToggleMute: () => void
  onToggleCamera: () => void
  onEndCall: () => void
}

export function CallContainer({
  localStream,
  remoteStream,
  callState,
  callType,
  remoteName,
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera,
  onEndCall,
}: CallContainerProps) {
  const isVideoCall = callType === 'VIDEO'

  const getStatusText = () => {
    switch (callState) {
      case 'calling':
        return 'Chamando...'
      case 'ringing':
        return 'Tocando...'
      case 'connecting':
        return 'Conectando...'
      case 'connected':
        return 'Conectado'
      default:
        return ''
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Video area */}
      <div className="flex-1 relative">
        {isVideoCall ? (
          <>
            {/* Remote video (full screen) */}
            <VideoPlayer
              stream={remoteStream}
              className="absolute inset-0"
              label={remoteName}
            />

            {/* Local video (picture in picture) */}
            <div className="absolute bottom-4 right-4 w-32 h-48 rounded-lg overflow-hidden shadow-lg">
              <VideoPlayer
                stream={localStream}
                muted
                className="w-full h-full"
                label="Voce"
              />
            </div>
          </>
        ) : (
          // Voice call UI
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-32 h-32 bg-primary-600 rounded-full flex items-center justify-center mb-6">
              <span className="text-5xl text-white font-bold">
                {remoteName.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">{remoteName}</h2>
            <p className="text-gray-400">{getStatusText()}</p>

            {/* Audio visualizer placeholder */}
            {callState === 'connected' && (
              <div className="mt-8 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-primary-500 rounded-full animate-pulse"
                    style={{
                      height: `${20 + Math.random() * 20}px`,
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Status overlay for video calls */}
        {isVideoCall && callState !== 'connected' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white text-lg">{getStatusText()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800">
        <CallControls
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          isVideoCall={isVideoCall}
          onToggleMute={onToggleMute}
          onToggleCamera={onToggleCamera}
          onEndCall={onEndCall}
        />
      </div>
    </div>
  )
}
