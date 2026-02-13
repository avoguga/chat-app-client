import { api } from './api'
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types'

export const authService = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', credentials)
    return data
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials)
    return data
  },

  async me(): Promise<{ user: User }> {
    const { data } = await api.get<{ user: User }>('/auth/me')
    return data
  },

  saveAuth(response: AuthResponse) {
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))
  },

  clearAuth() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getToken(): string | null {
    return localStorage.getItem('token')
  },

  getUser(): User | null {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },
}
