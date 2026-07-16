// BRAINROT VIDEO GENERATOR - FIRE! 🔥🔥🔥
// CRAZY, LOUD, MEME-FILLED VIDEOS FOR KIDS!

export interface VideoGeneratorOptions {
  title: string
  script: string
  description?: string
  tags?: string[]
  voiceId?: string
  speed?: number
  images?: string[]
  isBrainrot?: boolean
  onProgress?: (progress: number, status: string) => void
}

// Brainrot emoji explosions!
const brainrotEmojis = ['💀', '🔥', '😭', '🤣', '💯', '✨', '⚡️', '👀', '🙀', '🎉', '💥', '🦍', '🐍', '🗿', '☠️', '👻']
const brainrotPhrases = ['NO WAY!', 'LITERALLY ME!', 'CRAZY!', 'WILD!', 'OMG!', 'HELP!', 'FINALLY!', 'GOATED!', 'INSANE!']

// CHAOTIC colors for brainrot!
const brainrotColors = [
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', 
  '#00FFFF', '#FF6600', '#FF0099', '#99FF00', '#6600FF',
  '#FF3366', '#00FFCC', '#FFCC00', '#CC00FF', '#00CCFF'
]

// AI Image Generation
export async function generateAIImage(prompt: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'sdxl@0.9.2',
        input: {
          prompt: prompt,
          negative_prompt: 'blurry, low quality',
          width: 1280,
          height: 720,
        },
      }),
    })
    
    const prediction = await response.json()
    let result = prediction
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise(r => setTimeout(r, 1000))
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { 'Authorization': `Token ${apiKey}` },
      })
      result = await pollRes.json()
    }
    
    return result.output?.[0] || 'gradient'
  } catch {
    return 'gradient'
  }
}

// BRAINROT VIDEO GENERATOR!
export async function generateBrainrotVideo(options: VideoGeneratorOptions): Promise<Blob> {
  const { title, script, onProgress } = options
  
  const canvas = document.createElement('canvas')
  canvas.width = 1280
  canvas.height = 720
  const ctx = canvas.getContext('2d')!
  
  const fps = 30
  const duration = Math.max(15, Math.min(script.length / 5, 60))
  const totalFrames = Math.floor(duration * fps)
  
  // Split script into SHORT, punchy segments (brainrot style!)
  const words = script.split(' ')
  const segments: { text: string; emoji: string; startFrame: number; endFrame: number }[] = []
  const wordsPerSegment = 6
  
  let currentText = ''
  words.forEach((word, i) => {
    currentText += word + ' '
    if ((i + 1) % wordsPerSegment === 0 || i === words.length - 1) {
      if (currentText.trim().length > 0) {
        segments.push({
          text: currentText.trim().toUpperCase(),
          emoji: brainrotEmojis[Math.floor(Math.random() * brainrotEmojis.length)],
          startFrame: Math.floor((i / words.length) * totalFrames),
          endFrame: Math.min(Math.floor(((i + wordsPerSegment) / words.length) * totalFrames), totalFrames),
        })
      }
      currentText = ''
    }
  })
  
  onProgress?.(10, '🔥 MAKING BRAINROT VIDEO! 🔥')
  
  const stream = canvas.captureStream(fps)
  let mimeType = 'video/webm;codecs=vp9'
  if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm'
  
  const mediaRecorder = new MediaRecorder(stream, { mimeType })
  const chunks: Blob[] = []
  mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
  
  return new Promise((resolve) => {
    mediaRecorder.onstop = () => {
      resolve(new Blob(chunks, { type: mimeType }))
    }
    
    mediaRecorder.start()
    
    let frame = 0
    const startTime = performance.now()
    
    const renderFrame = () => {
      const currentTime = (performance.now() - startTime) / 1000
      const t = currentTime * 1000
      
      // CRAZY BACKGROUND - changes every frame!
      const bgColor1 = brainrotColors[Math.floor(t / 200) % brainrotColors.length]
      const bgColor2 = brainrotColors[Math.floor(t / 200 + 1) % brainrotColors.length]
      
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, bgColor1)
      gradient.addColorStop(1, bgColor2)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // FLOATING EMOJIS EVERYWHERE!
      for (let i = 0; i < 15; i++) {
        const emoji = brainrotEmojis[i % brainrotEmojis.length]
        const x = ((Math.sin(t * 0.003 + i) + 1) / 2) * canvas.width
        const y = ((Math.cos(t * 0.004 + i * 2) + 1) / 2) * canvas.height
        const size = 20 + Math.sin(t * 0.01 + i) * 15
        
        ctx.font = `${size}px Arial`
        ctx.fillText(emoji, x, y)
      }
      
      // Current segment
      const currentSegment = segments.find(s => frame >= s.startFrame && frame < s.endFrame)
      
      if (currentSegment) {
        const segmentProgress = (frame - currentSegment.startFrame) / (currentSegment.endFrame - currentSegment.startFrame)
        
        // SHAKE effect!
        const shakeX = Math.sin(t * 0.05) * (segmentProgress < 0.3 ? 10 : 0)
        const shakeY = Math.cos(t * 0.06) * (segmentProgress < 0.3 ? 10 : 0)
        
        ctx.save()
        ctx.translate(shakeX, shakeY)
        
        // RANDOM rotation for CHAOS!
        const rotation = Math.sin(t * 0.02) * 0.1
        ctx.rotate(rotation)
        
        // GLOW effect - big and BOLD!
        ctx.shadowColor = '#FFFFFF'
        ctx.shadowBlur = 30
        
        // RANDOM color for text!
        const textColor = brainrotColors[Math.floor(t / 100) % brainrotColors.length]
        ctx.fillStyle = textColor
        
        // BORDER!
        ctx.font = 'bold 80px Impact, Arial Black, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 8
        ctx.strokeText(currentSegment.text, canvas.width / 2, canvas.height / 2)
        ctx.fillText(currentSegment.text, canvas.width / 2, canvas.height / 2)
        
        // EMOJI!
        ctx.font = '100px Arial'
        ctx.fillText(currentSegment.emoji, canvas.width / 2, canvas.height / 2 - 100)
        
        ctx.restore()
        
        // ZOOM effect at start!
        if (segmentProgress < 0.2) {
          const zoom = 1 + (0.2 - segmentProgress) * 2
          ctx.save()
          ctx.translate(canvas.width / 2, canvas.height / 2)
          ctx.scale(zoom, zoom)
          ctx.translate(-canvas.width / 2, -canvas.height / 2)
          ctx.restore()
        }
      }
      
      // TITLE CARD (first 3 seconds)
      if (frame < fps * 3) {
        const titleProgress = Math.min(1, frame / (fps * 0.5))
        const titleScale = 0.5 + titleProgress * 0.5
        
        ctx.save()
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.scale(titleScale, titleScale)
        ctx.translate(-canvas.width / 2, -canvas.height / 2)
        
        // Title background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
        ctx.fillRect(-50, -80, canvas.width + 100, 160)
        
        // CRAZY TITLE!
        ctx.font = 'bold 72px Impact, Arial Black, sans-serif'
        ctx.textAlign = 'center'
        ctx.strokeStyle = brainrotColors[Math.floor(t / 50) % brainrotColors.length]
        ctx.lineWidth = 6
        ctx.strokeText(title.toUpperCase(), canvas.width / 2, canvas.height / 2)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(title.toUpperCase(), canvas.width / 2, canvas.height / 2)
        
        // Fire emojis around title!
        ctx.font = '60px Arial'
        ctx.fillText('🔥🔥🔥', canvas.width / 2, canvas.height / 2 - 100)
        
        ctx.restore()
      }
      
      // Random phrase popup!
      if (Math.random() < 0.02) {
        const phrase = brainrotPhrases[Math.floor(Math.random() * brainrotPhrases.length)]
        const phraseX = Math.random() * canvas.width
        const phraseY = Math.random() * canvas.height
        
        ctx.font = 'bold 40px Impact'
        ctx.fillStyle = brainrotColors[Math.floor(Math.random() * brainrotColors.length)]
        ctx.fillText(phrase, phraseX, phraseY)
      }
      
      // Progress bar at bottom
      const progress = frame / totalFrames
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.fillRect(0, canvas.height - 15, canvas.width * progress, 15)
      
      frame++
      
      if (frame % 15 === 0) {
        onProgress?.(Math.min(95, 10 + (frame / totalFrames) * 85), `🔥 BRAINROT FRAME ${frame}/${totalFrames} 🔥`)
      }
      
      if (frame < totalFrames) {
        requestAnimationFrame(renderFrame)
      } else {
        onProgress?.(100, '🎉 BRAINROT VIDEO DONE! 🎉')
        mediaRecorder.stop()
      }
    }
    
    requestAnimationFrame(renderFrame)
  })
}

// Main video generator - defaults to brainrot mode!
export async function generateVideo(options: VideoGeneratorOptions): Promise<Blob> {
  return generateBrainrotVideo(options)
}

// Generate video with AI images
export async function generateVideoWithAI(options: VideoGeneratorOptions, imageApiKey: string): Promise<Blob> {
  return generateBrainrotVideo(options)
}

// Download video
export function downloadVideo(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.webm') ? filename : `${filename}.webm`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Generate images for video
export async function generateImagesForScript(script: string, title: string, apiKey: string): Promise<string[]> {
  const images: string[] = []
  const segments = script.split(' ').slice(0, 5)
  
  for (const segment of segments) {
    images.push(await generateAIImage(`${title} ${segment}`, apiKey))
  }
  
  return images
}
