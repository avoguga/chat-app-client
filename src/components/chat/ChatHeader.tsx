import { User } from '../../types'

interface ChatHeaderProps {
  user: User
  onVoiceCall: () => void
  onVideoCall: () => void
}

export function ChatHeader({ user, onVoiceCall, onVideoCall }: ChatHeaderProps) {
  return (
    <div className="px-4 py-3 bg-white border-b flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
            {user.username.charAt(0).toUpperCase()}
          </div>
          {user.isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{user.displayName || user.username}</h3>
          <p className="text-sm text-gray-500">
            {user.isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onVoiceCall}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          title="Chamada de voz"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </button>
        <button
          onClick={onVideoCall}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          title="Chamada de video"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
