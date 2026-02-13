import { Conversation } from '../../types'
import { useAuth } from '../../contexts/AuthContext'

interface ConversationItemProps {
  conversation: Conversation
  isSelected: boolean
  onClick: () => void
}

export function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
  const { user } = useAuth()

  // Get the other participant in a direct conversation
  const otherParticipant = conversation.participants.find(p => p.userId !== user?.id)?.user
  const displayName = conversation.type === 'GROUP'
    ? conversation.name
    : otherParticipant?.displayName || otherParticipant?.username

  const formatTime = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    if (isToday) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  return (
    <button
      onClick={onClick}
      className={`w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-primary-50' : ''
      }`}
    >
      <div className="relative">
        <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
          {displayName?.charAt(0).toUpperCase()}
        </div>
        {otherParticipant?.isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 truncate">{displayName}</h4>
          {conversation.lastMessage && (
            <span className="text-xs text-gray-500">
              {formatTime(conversation.lastMessage.createdAt)}
            </span>
          )}
        </div>
        {conversation.lastMessage && (
          <p className="text-sm text-gray-500 truncate">
            {conversation.lastMessage.content}
          </p>
        )}
      </div>
    </button>
  )
}
