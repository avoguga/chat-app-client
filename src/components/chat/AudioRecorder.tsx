import { useState, useRef } from 'react'

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void
  onCancel: () => void
}

export function AudioRecorder({ onRecordingComplete, onCancel }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const finalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000)
        onRecordingComplete(blob, finalDuration)

        // Parar todas as tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      startTimeRef.current = Date.now()
      setIsRecording(true)

      // Timer para atualizar duração
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
    } catch (error) {
      console.error('Erro ao acessar microfone:', error)
      alert('Não foi possível acessar o microfone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      // Não chamar onRecordingComplete
      mediaRecorderRef.current.onstop = () => {}
    }
    setIsRecording(false)
    setDuration(0)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    onCancel()
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        </button>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-600 font-medium">{formatDuration(duration)}</span>
          </div>

          <button
            onClick={cancelRecording}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            onClick={stopRecording}
            className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
