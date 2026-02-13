import { useState, FormEvent, useCallback, useRef, useEffect } from 'react'
import { AudioRecorder } from './AudioRecorder'
import { api } from '../../services/api'
import { MessageType } from '../../types'

interface MediaPayload {
  type: MessageType
  mediaUrl: string
  fileName: string
  fileSize: number
  mimeType: string
  duration?: number
}

interface MessageInputProps {
  onSend: (content: string) => void
  onSendMedia: (content: string, media: MediaPayload) => void
  onTypingStart: () => void
  onTypingStop: () => void
  disabled?: boolean
}

export function MessageInput({ onSend, onSendMedia, onTypingStart, onTypingStop, disabled = false }: MessageInputProps) {
  const [content, setContent] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const uploadFile = async (file: File | Blob, originalName?: string): Promise<MediaPayload | null> => {
    const formData = new FormData()
    formData.append('file', file, originalName || (file as File).name || 'audio.webm')

    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      return {
        type: data.file.mediaType,
        mediaUrl: data.file.mediaUrl,
        fileName: data.file.fileName,
        fileSize: data.file.fileSize,
        mimeType: data.file.mimeType,
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      alert('Erro ao enviar arquivo')
      return null
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const media = await uploadFile(file)
    setIsUploading(false)

    if (media) {
      onSendMedia('', media)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAudioComplete = async (blob: Blob, duration: number) => {
    setIsRecording(false)
    setIsUploading(true)

    const media = await uploadFile(blob, 'audio.webm')
    setIsUploading(false)

    if (media) {
      onSendMedia('', { ...media, duration })
    }
  }

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

  if (isRecording) {
    return (
      <div className="p-4 bg-white border-t">
        <AudioRecorder
          onRecordingComplete={handleAudioComplete}
          onCancel={() => setIsRecording(false)}
        />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex items-center gap-2">
        {/* Botão de anexo */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        {/* Campo de texto */}
        <input
          type="text"
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            handleTyping()
          }}
          placeholder={isUploading ? 'Enviando...' : 'Digite uma mensagem...'}
          disabled={disabled || isUploading}
          className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
        />

        {/* Botão de áudio ou enviar */}
        {content.trim() ? (
          <button
            type="submit"
            disabled={disabled || isUploading}
            className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsRecording(true)}
            disabled={disabled || isUploading}
            className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </button>
        )}
      </div>
    </form>
  )
}
