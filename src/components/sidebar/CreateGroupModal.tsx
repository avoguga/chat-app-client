import { useState, useEffect } from 'react'
import { Button, Input } from '../common'
import { User } from '../../types'
import { api } from '../../services/api'

interface CreateGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onGroupCreated: (conversation: any) => void
}

export function CreateGroupModal({ isOpen, onClose, onGroupCreated }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setGroupName('')
      setSearchQuery('')
      setSelectedUsers([])
      return
    }

    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setUsers([])
        return
      }

      setIsLoading(true)
      try {
        const { data } = await api.get<{ users: User[] }>(`/users/search?q=${searchQuery}`)
        // Filtrar usuários já selecionados
        const filtered = data.users.filter(
          (u) => !selectedUsers.find((s) => s.id === u.id)
        )
        setUsers(filtered)
      } catch (error) {
        console.error('Erro ao buscar usuários:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery, isOpen, selectedUsers])

  const handleSelectUser = (user: User) => {
    setSelectedUsers((prev) => [...prev, user])
    setSearchQuery('')
    setUsers([])
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return

    setIsCreating(true)
    try {
      const { data } = await api.post('/conversations/group', {
        name: groupName.trim(),
        participantIds: selectedUsers.map((u) => u.id),
      })
      onGroupCreated(data.conversation)
      onClose()
    } catch (error) {
      console.error('Erro ao criar grupo:', error)
    } finally {
      setIsCreating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Criar Grupo</h2>

        <Input
          label="Nome do grupo"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Digite o nome do grupo"
        />

        <div className="mt-4">
          <Input
            label="Adicionar participantes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar usuários..."
          />

          {isLoading && (
            <p className="text-sm text-gray-500 mt-2">Buscando...</p>
          )}

          {users.length > 0 && (
            <ul className="mt-2 border rounded-lg divide-y max-h-40 overflow-y-auto">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer flex items-center"
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm mr-3">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedUsers.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Participantes ({selectedUsers.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <span
                  key={user.id}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
                >
                  {user.username}
                  <button
                    onClick={() => handleRemoveUser(user.id)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedUsers.length === 0 || isCreating}
            className="flex-1"
          >
            {isCreating ? 'Criando...' : 'Criar Grupo'}
          </Button>
        </div>
      </div>
    </div>
  )
}
