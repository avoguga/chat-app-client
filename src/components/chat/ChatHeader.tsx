import { User } from '../../types'

interface ChatHeaderProps {
  user?: User | null
  groupName?: string
  participantCount?: number
  onVoiceCall?: () => void
  onVideoCall?: () => void
}

export function ChatHeader({ user, groupName, participantCount, onVoiceCall, onVideoCall }: ChatHeaderProps) {
  const isGroup = !!groupName

  return (
    <div className="px-4 py-3 bg-white border-b flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          {isGroup ? (
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                {user?.username.charAt(0).toUpperCase()}
              </div>
              {user?.isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </>
          )}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">
            {isGroup ? groupName : (user?.displayName || user?.username)}
          </h3>
          <p className="text-sm text-gray-500">
            {isGroup
              ? `${participantCount} participantes`
              : (user?.isOnline ? 'Online' : 'Offline')
            }
          </p>
        </div>
      </div>

      {!isGroup && (
        <div className="flex items-center gap-2">
          {onVoiceCall && (
            <button
              onClick={onVoiceCall}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title="Chamada de voz"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
          )}
          {onVideoCall && (
            <button
              onClick={onVideoCall}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title="Chamada de video"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
