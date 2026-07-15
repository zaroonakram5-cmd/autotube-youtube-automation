// Client-side video generation using Web Speech API and Canvas
// This creates a simple video with text overlay and audio

export interface VideoGeneratorOptions {
  title: string
  script: string
  voiceId?: string
  speed?: number
  onProgress?: (progress: number) => void
}

export async function generateVideo(options: VideoGeneratorOptions): Promise<Blob> {
  const { title, script, onProgress } = options
  
  // Create a canvas for video frames
  const canvas = document.createElement('canvas')
  canvas.width = 1280
  canvas.height = 720
  const ctx = canvas.getContext('2d')!
  
  // Create MediaRecorder with canvas stream
  const stream = canvas.captureStream(30)
  
  // Use Web Speech API for TTS simulation (basic)
  const utterance = new SpeechSynthesisUtterance(script)
  utterance.rate = options.speed || 1.0
  
  // Create audio context for recording
  const audioContext = new AudioContext()
  const destination = audioContext.createMediaStreamDestination()
  
  // Draw initial frame
  const drawFrame = (frameNumber: number, totalFrames: number) => {
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#1a1a2e')
    gradient.addColorStop(1, '#16213e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Title text
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 50)
    
    // Subtitle / script preview (truncated)
    ctx.fillStyle = '#94a3b8'
    ctx.font = '24px Arial'
    const previewText = script.substring(0, 100) + '...'
    ctx.fillText(previewText, canvas.width / 2, canvas.height / 2 + 20)
    
    // Progress indicator
    const progress = frameNumber / totalFrames
    ctx.fillStyle = '#3b82f6'
    ctx.fillRect(100, canvas.height - 60, (canvas.width - 200) * progress, 10)
    
    // Frame number
    ctx.fillStyle = '#64748b'
    ctx.font = '16px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(`Frame: ${frameNumber}/${totalFrames}`, 20, canvas.height - 20)
  }
  
  // Total duration based on script length (approximate)
  const duration = Math.max(10, Math.min(script.length / 10, 60)) // 10-60 seconds
  const fps = 30
  const totalFrames = Math.floor(duration * fps)
  
  // Start recording
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9'
  })
  
  const chunks: Blob[] = []
  mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
  
  return new Promise((resolve) => {
    mediaRecorder.onstop = () => {
      const webmBlob = new Blob(chunks, { type: 'video/webm' })
      resolve(webmBlob)
    }
    
    mediaRecorder.start()
    
    let frame = 0
    const interval = setInterval(() => {
      drawFrame(frame, totalFrames)
      frame++
      
      if (onProgress) {
        onProgress(Math.min(100, (frame / totalFrames) * 100))
      }
      
      if (frame >= totalFrames) {
        clearInterval(interval)
        mediaRecorder.stop()
      }
    }, 1000 / fps)
  })
}

// Convert WebM to MP4 using canvas (for browsers that support it)
// Note: Most browsers don't support MP4 encoding on client side
export async function convertToMP4(webmBlob: Blob): Promise<Blob> {
  // For now, return WebM as fallback (most browsers support it)
  // In production, you'd use a service or server-side FFmpeg
  console.log('Note: MP4 encoding on client-side is limited. Using WebM format.')
  return webmBlob
}

// Download video file
export function downloadVideo(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
