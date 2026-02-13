import { Message } from '../../types'
import { useAuth } from '../../contexts/AuthContext'

interface MessageItemProps {
  message: Message
}

export function MessageItem({ message }: MessageItemProps) {
  const { user } = useAuth()
  const isOwn = message.senderId === user?.id

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusIcon = () => {
    switch (message.status) {
      case 'SENT':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'DELIVERED':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7M5 13l4 4L19 7" />
          </svg>
        )
      case 'READ':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7M5 13l4 4L19 7" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[70%] px-4 py-2 rounded-2xl ${
          isOwn
            ? 'bg-primary-600 text-white rounded-br-md'
            : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
        }`}
      >
        <p className="break-words">{message.content}</p>
        <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-primary-200' : 'text-gray-400'}`}>
          <span className="text-xs">{formatTime(message.createdAt)}</span>
          {isOwn && getStatusIcon()}
        </div>
      </div>
    </div>
  )
}
