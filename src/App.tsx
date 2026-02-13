import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import { CallProvider } from './contexts/CallContext'
import { AuthGuard } from './components/auth/AuthGuard'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ChatPage } from './pages/ChatPage'

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <CallProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/chat"
              element={
                <AuthGuard>
                  <ChatPage />
                </AuthGuard>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </CallProvider>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
