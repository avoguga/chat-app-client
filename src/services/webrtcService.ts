// ICE Server configuration
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    // Free STUN servers
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    // Add your TURN server here for production
    // {
    //   urls: 'turn:your-turn-server.com:3478',
    //   username: 'username',
    //   credential: 'password',
    // },
  ],
  iceCandidatePoolSize: 10,
}

export type CallState = 'idle' | 'calling' | 'ringing' | 'connecting' | 'connected' | 'ended'

export interface WebRTCCallbacks {
  onLocalStream?: (stream: MediaStream) => void
  onRemoteStream?: (stream: MediaStream) => void
  onCallStateChange?: (state: CallState) => void
  onError?: (error: Error) => void
  onIceCandidate?: (candidate: RTCIceCandidate) => void
  onOffer?: (offer: RTCSessionDescriptionInit) => void
  onAnswer?: (answer: RTCSessionDescriptionInit) => void
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private callbacks: WebRTCCallbacks = {}
  private callState: CallState = 'idle'

  constructor(callbacks: WebRTCCallbacks = {}) {
    this.callbacks = callbacks
  }

  private setCallState(state: CallState) {
    this.callState = state
    this.callbacks.onCallStateChange?.(state)
  }

  async initializeMedia(video: boolean = true): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: video ? { width: 1280, height: 720 } : false,
      })

      this.callbacks.onLocalStream?.(this.localStream)
      return this.localStream
    } catch (error) {
      console.error('Error accessing media devices:', error)
      throw new Error('Could not access camera/microphone')
    }
  }

  private createPeerConnection(): RTCPeerConnection {
    const pc = new RTCPeerConnection(ICE_SERVERS)

    // Add local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!)
      })
    }

    // Handle remote tracks
    pc.ontrack = (event) => {
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream()
        this.callbacks.onRemoteStream?.(this.remoteStream)
      }
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream!.addTrack(track)
      })
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.callbacks.onIceCandidate?.(event.candidate)
      }
    }

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState)
      switch (pc.connectionState) {
        case 'connecting':
          this.setCallState('connecting')
          break
        case 'connected':
          this.setCallState('connected')
          break
        case 'disconnected':
        case 'failed':
        case 'closed':
          this.setCallState('ended')
          break
      }
    }

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState)
    }

    this.peerConnection = pc
    return pc
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      this.createPeerConnection()
    }

    const offer = await this.peerConnection!.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    })

    await this.peerConnection!.setLocalDescription(offer)
    this.setCallState('calling')

    return offer
  }

  async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      this.createPeerConnection()
    }

    await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer))

    const answer = await this.peerConnection!.createAnswer()
    await this.peerConnection!.setLocalDescription(answer)

    return answer
  }

  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('No peer connection')
    }

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('No peer connection')
    }

    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
    } catch (error) {
      console.error('Error adding ICE candidate:', error)
    }
  }

  toggleMute(): boolean {
    if (!this.localStream) return false

    const audioTrack = this.localStream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      return !audioTrack.enabled // Returns true if muted
    }
    return false
  }

  toggleCamera(): boolean {
    if (!this.localStream) return false

    const videoTrack = this.localStream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      return !videoTrack.enabled // Returns true if camera is off
    }
    return false
  }

  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream
  }

  getCallState(): CallState {
    return this.callState
  }

  close(): void {
    // Stop all tracks
    this.localStream?.getTracks().forEach((track) => track.stop())
    this.remoteStream?.getTracks().forEach((track) => track.stop())

    // Close peer connection
    this.peerConnection?.close()

    // Reset state
    this.localStream = null
    this.remoteStream = null
    this.peerConnection = null
    this.setCallState('idle')
  }
}
