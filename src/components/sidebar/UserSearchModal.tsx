import { useState, useEffect } from 'react'
import { User } from '../../types'
import { api } from '../../services/api'

interface UserSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectUser: (user: User) => void
}

export function UserSearchModal({ isOpen, onClose, onSelectUser }: UserSearchModalProps) {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!search.trim()) {
      setUsers([])
      return
    }

    const debounceTimeout = setTimeout(async () => {
      setIsLoading(true)
      try {
        const { data } = await api.get<{ users: User[] }>(`/users/search?q=${search}`)
        setUsers(data.users)
      } catch (error) {
        console.error('Error searching users:', error)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(debounceTimeout)
  }, [search])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nova conversa</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar usuarios..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            autoFocus
          />
        </div>

        <div className="max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Buscando...</div>
          ) : users.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {search ? 'Nenhum usuario encontrado' : 'Digite para buscar'}
            </div>
          ) : (
            users.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  onSelectUser(user)
                  onClose()
                }}
                className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{user.username}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
