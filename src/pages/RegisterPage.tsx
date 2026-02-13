import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button, Input } from '../components/common'

export function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('As senhas nao coincidem')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (username.length < 3) {
      setError('O nome de usuario deve ter pelo menos 3 caracteres')
      return
    }

    setIsLoading(true)

    try {
      await register({ username, email, password })
      navigate('/chat')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { code?: string } } } }
      if (error.response?.data?.error?.code === 'USER_EXISTS') {
        setError('Email ou nome de usuario ja cadastrado')
      } else {
        setError('Erro ao criar conta. Tente novamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Chat App</h1>
          <p className="text-gray-600 mt-2">Crie sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Input
            label="Nome de usuario"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="seunome"
            required
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />

          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
          />

          <Input
            label="Confirmar senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="********"
            required
          />

          <Button type="submit" fullWidth isLoading={isLoading}>
            Criar conta
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Ja tem uma conta?{' '}
          <Link to="/login" className="text-primary-600 hover:underline font-medium">
            Entre aqui
          </Link>
        </p>
      </div>
    </div>
  )
}
