import { useState, useRef } from 'react'
import { Message } from '../../types'

interface MediaMessageProps {
  message: Message
  isOwn: boolean
}

export function MediaMessage({ message, isOwn }: MediaMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleAudioToggle = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  if (message.type === 'IMAGE') {
    return (
      <div className="max-w-xs">
        <a href={message.mediaUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={message.mediaUrl}
            alt={message.fileName || 'Imagem'}
            className="rounded-lg max-w-full cursor-pointer hover:opacity-90 transition-opacity"
            loading="lazy"
          />
        </a>
        {message.content && (
          <p className={`mt-2 text-sm ${isOwn ? 'text-white' : 'text-gray-900'}`}>
            {message.content}
          </p>
        )}
      </div>
    )
  }

  if (message.type === 'VIDEO') {
    return (
      <div className="max-w-xs">
        <video
          src={message.mediaUrl}
          controls
          className="rounded-lg max-w-full"
          preload="metadata"
        />
        {message.content && (
          <p className={`mt-2 text-sm ${isOwn ? 'text-white' : 'text-gray-900'}`}>
            {message.content}
          </p>
        )}
      </div>
    )
  }

  if (message.type === 'AUDIO') {
    const duration = message.duration || 0
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0

    return (
      <div className={`flex items-center gap-3 p-2 rounded-lg min-w-[200px] ${isOwn ? 'bg-blue-700' : 'bg-gray-200'}`}>
        <audio
          ref={audioRef}
          src={message.mediaUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleAudioEnded}
          preload="metadata"
        />

        <button
          onClick={handleAudioToggle}
          className={`p-2 rounded-full ${isOwn ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'}`}
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <div className="flex-1">
          <div className={`h-1 rounded-full ${isOwn ? 'bg-blue-400' : 'bg-gray-300'}`}>
            <div
              className={`h-1 rounded-full ${isOwn ? 'bg-white' : 'bg-blue-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
            {formatDuration(isPlaying ? currentTime : duration)}
          </p>
        </div>
      </div>
    )
  }

  if (message.type === 'FILE') {
    return (
      <a
        href={message.mediaUrl}
        download={message.fileName}
        className={`flex items-center gap-3 p-3 rounded-lg ${isOwn ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
      >
        <div className={`p-2 rounded ${isOwn ? 'bg-blue-600' : 'bg-gray-300'}`}>
          <svg className={`w-6 h-6 ${isOwn ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isOwn ? 'text-white' : 'text-gray-900'}`}>
            {message.fileName || 'Arquivo'}
          </p>
          {message.fileSize && (
            <p className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
              {formatFileSize(message.fileSize)}
            </p>
          )}
        </div>
        <svg className={`w-5 h-5 ${isOwn ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </a>
    )
  }

  return null
}
