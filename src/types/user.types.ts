export interface User {
  id: string
  username: string
  email: string
  displayName?: string
  avatarUrl?: string
  isOnline: boolean
  lastSeen: string
  createdAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  username: string
  email: string
  password: string
}
