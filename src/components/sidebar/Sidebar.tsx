import { useState } from 'react'
import { Conversation, User } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { ConversationItem } from './ConversationItem'
import { UserSearchModal } from './UserSearchModal'

interface SidebarProps {
  conversations: Conversation[]
  selectedConversationId?: string
  onSelectConversation: (conversation: Conversation) => void
  onStartConversation: (user: User) => void
  isLoading?: boolean
}

export function Sidebar({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onStartConversation,
  isLoading = false,
}: SidebarProps) {
  const { user, logout } = useAuth()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')

  const filteredConversations = conversations.filter((conv) => {
    if (!searchFilter) return true
    const otherParticipant = conv.participants.find(p => p.userId !== user?.id)?.user
    const name = conv.type === 'GROUP' ? conv.name : otherParticipant?.username
    return name?.toLowerCase().includes(searchFilter.toLowerCase())
  })

  return (
    <aside className="w-80 bg-white border-r flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium">{user?.username}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Nova conversa"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={logout}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Sair"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Buscar conversas..."
          className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>Nenhuma conversa ainda</p>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="mt-2 text-primary-600 hover:underline"
            >
              Iniciar nova conversa
            </button>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={conversation.id === selectedConversationId}
              onClick={() => onSelectConversation(conversation)}
            />
          ))
        )}
      </div>

      <UserSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectUser={onStartConversation}
      />
    </aside>
  )
}
