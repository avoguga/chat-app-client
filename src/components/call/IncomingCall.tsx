import { User, CallType } from '../../types'

interface IncomingCallProps {
  caller: User
  type: CallType
  onAccept: () => void
  onReject: () => void
}

export function IncomingCall({ caller, type, onAccept, onReject }: IncomingCallProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl p-8 text-center max-w-sm w-full mx-4">
        {/* Avatar */}
        <div className="w-24 h-24 mx-auto mb-4 bg-primary-600 rounded-full flex items-center justify-center">
          <span className="text-4xl text-white font-bold">
            {caller.username.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Caller info */}
        <h2 className="text-xl font-semibold text-white mb-2">
          {caller.displayName || caller.username}
        </h2>
        <p className="text-gray-400 mb-8">
          Chamada de {type === 'VIDEO' ? 'video' : 'voz'} recebida...
        </p>

        {/* Ringing animation */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-1">
            <span className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-6">
          {/* Reject */}
          <button
            onClick={onReject}
            className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors"
            title="Recusar"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Accept */}
          <button
            onClick={onAccept}
            className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition-colors"
            title="Aceitar"
          >
            {type === 'VIDEO' ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
