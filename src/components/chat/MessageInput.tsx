import { useState, FormEvent, useCallback, useRef, useEffect } from 'react'

interface MessageInputProps {
  onSend: (content: string) => void
  onTypingStart: () => void
  onTypingStop: () => void
  disabled?: boolean
}

export function MessageInput({ onSend, onTypingStart, onTypingStop, disabled = false }: MessageInputProps) {
  const [content, setContent] = useState('')
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  const handleTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true
      onTypingStart()
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false
      onTypingStop()
    }, 2000)
  }, [onTypingStart, onTypingStop])

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return

    onSend(trimmed)
    setContent('')

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    isTypingRef.current = false
    onTypingStop()
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            handleTyping()
          }}
          placeholder="Digite uma mensagem..."
          disabled={disabled}
          className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !content.trim()}
          className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </form>
  )
}
