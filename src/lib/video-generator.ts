// AI-Enhanced Video Generator
// Creates professional quality videos with AI-generated images and animations

export interface VideoGeneratorOptions {
  title: string
  script: string
  description?: string
  tags?: string[]
  voiceId?: string
  speed?: number
  images?: string[] // AI-generated images
  onProgress?: (progress: number, status: string) => void
}

// AI Image Generation using Replicate API
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
          negative_prompt: 'blurry, low quality, watermark, text',
          width: 1280,
          height: 720,
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
      }),
    })
    
    const prediction = await response.json()
    
    // Poll for completion
    let result = prediction
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise(r => setTimeout(r, 1000))
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { 'Authorization': `Token ${apiKey}` },
      })
      result = await pollRes.json()
    }
    
    if (result.status === 'failed') {
      throw new Error('Image generation failed')
    }
    
    return result.output[0]
  } catch (error) {
    console.error('Image generation error:', error)
    // Return placeholder gradient if AI fails
    return 'gradient'
  }
}

// Generate images based on script content
export async function generateImagesForScript(script: string, title: string, apiKey: string): Promise<string[]> {
  const images: string[] = []
  
  // Split script into segments (roughly 10 words per segment)
  const words = script.split(' ')
  const segments: string[] = []
  let currentSegment = ''
  
  words.forEach((word, i) => {
    currentSegment += word + ' '
    if ((i + 1) % 15 === 0 || i === words.length - 1) {
      segments.push(currentSegment.trim())
      currentSegment = ''
    }
  })
  
  // Generate up to 5 images
  const numImages = Math.min(5, segments.length)
  for (let i = 0; i < numImages; i++) {
    const prompt = `${title} - ${segments[i]}`
    images.push(await generateAIImage(prompt, apiKey))
  }
  
  return images
}

// Professional video styles
const videoStyles = {
  modern: {
    gradient1: '#667eea',
    gradient2: '#764ba2',
    accent: '#f093fb',
    textColor: '#ffffff',
    fontSize: { title: 52, subtitle: 28, caption: 24 },
  },
  cinematic: {
    gradient1: '#0f0c29',
    gradient2: '#302b63',
    accent: '#24243e',
    textColor: '#ffffff',
    fontSize: { title: 48, subtitle: 26, caption: 22 },
  },
  vibrant: {
    gradient1: '#ff0844',
    gradient2: '#ffb199',
    accent: '#f77062',
    textColor: '#ffffff',
    fontSize: { title: 54, subtitle: 30, caption: 26 },
  },
  minimal: {
    gradient1: '#1a1a2e',
    gradient2: '#16213e',
    accent: '#0f3460',
    textColor: '#e94560',
    fontSize: { title: 50, subtitle: 28, caption: 24 },
  },
}

// Select random style
const style = videoStyles.minimal

// Load image from URL
async function loadImage(src: string): Promise<HTMLImageElement | null> {
  if (src === 'gradient' || !src.startsWith('http')) return null
  
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

// Draw animated background
function drawAnimatedBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) {
  const t = time * 0.001
  
  // Animated gradient
  const gradient = ctx.createLinearGradient(
    Math.sin(t) * 200 + canvas.width / 2,
    0,
    Math.cos(t) * 200 + canvas.width / 2,
    canvas.height
  )
  gradient.addColorStop(0, style.gradient1)
  gradient.addColorStop(0.5, style.gradient2)
  gradient.addColorStop(1, style.accent)
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // Animated particles
  ctx.globalAlpha = 0.3
  for (let i = 0; i < 20; i++) {
    const x = (Math.sin(t + i * 0.5) + 1) * canvas.width / 2
    const y = (Math.cos(t * 0.7 + i * 0.3) + 1) * canvas.height / 2
    const radius = 2 + Math.sin(t + i) * 2
    
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

// Draw text with outline
function drawTextWithOutline(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, fontSize: number, align: 'left' | 'center' | 'right' = 'center') {
  ctx.font = `bold ${fontSize}px Inter, sans-serif`
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  
  // Text shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetX = 3
  ctx.shadowOffsetY = 3
  
  // Text outline
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)'
  ctx.lineWidth = 6
  ctx.strokeText(text, x, y)
  
  // Main text
  ctx.fillStyle = style.textColor
  ctx.fillText(text, x, y)
  
  // Reset shadow
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
}

// Main video generation function
export async function generateVideo(options: VideoGeneratorOptions): Promise<Blob> {
  const { title, script, images, onProgress } = options
  
  const canvas = document.createElement('canvas')
  canvas.width = 1920 // Full HD
  canvas.height = 1080 // Full HD
  const ctx = canvas.getContext('2d')!
  
  const fps = 30
  const duration = Math.max(15, Math.min(script.length / 8, 90)) // 15-90 seconds
  const totalFrames = Math.floor(duration * fps)
  
  // Parse script into segments
  const words = script.split(' ')
  const segments: { text: string; startFrame: number; endFrame: number }[] = []
  const wordsPerSegment = 20
  const framesPerSegment = Math.floor(totalFrames / Math.ceil(words.length / wordsPerSegment))
  
  let currentText = ''
  words.forEach((word, i) => {
    currentText += word + ' '
    if ((i + 1) % wordsPerSegment === 0 || i === words.length - 1) {
      segments.push({
        text: currentText.trim(),
        startFrame: Math.floor((i / words.length) * totalFrames),
        endFrame: Math.min(Math.floor(((i + wordsPerSegment) / words.length) * totalFrames), totalFrames),
      })
      currentText = ''
    }
  })
  
  // Pre-load images
  const loadedImages: (HTMLImageElement | null)[] = []
  if (images && images.length > 0) {
    onProgress?.(5, 'Loading AI images...')
    for (const imgUrl of images.slice(0, 5)) {
      const img = await loadImage(imgUrl)
      loadedImages.push(img)
    }
  }
  
  onProgress?.(10, 'Creating video...')
  
  // Create MediaRecorder
  const stream = canvas.captureStream(fps)
  
  // Try to get better quality codec
  let mimeType = 'video/webm;codecs=vp9'
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp8'
  }
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm'
  }
  
  const mediaRecorder = new MediaRecorder(stream, { mimeType })
  const chunks: Blob[] = []
  mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
  
  return new Promise((resolve) => {
    mediaRecorder.onstop = () => {
      const webmBlob = new Blob(chunks, { type: mimeType })
      resolve(webmBlob)
    }
    
    mediaRecorder.start()
    
    let frame = 0
    const startTime = performance.now()
    
    const renderFrame = () => {
      const currentTime = (performance.now() - startTime) / 1000
      const t = currentTime * 1000 // milliseconds for animations
      
      // Draw animated background
      drawAnimatedBackground(ctx, canvas, t)
      
      // Draw AI image as background (if available)
      const currentSegment = segments.find(s => frame >= s.startFrame && frame < s.endFrame)
      const imageIndex = currentSegment ? Math.floor((currentSegment.startFrame / totalFrames) * loadedImages.length) : 0
      const bgImage = loadedImages[imageIndex]
      
      if (bgImage) {
        // Draw image with overlay
        ctx.globalAlpha = 0.4
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height)
        ctx.globalAlpha = 1
        
        // Add dark overlay for readability
        const overlay = ctx.createLinearGradient(0, 0, 0, canvas.height)
        overlay.addColorStop(0, 'rgba(0,0,0,0.3)')
        overlay.addColorStop(0.5, 'rgba(0,0,0,0.5)')
        overlay.addColorStop(1, 'rgba(0,0,0,0.7)')
        ctx.fillStyle = overlay
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      
      // Title card (first 2 seconds)
      if (frame < fps * 2) {
        const titleProgress = Math.min(1, frame / (fps * 0.5))
        ctx.globalAlpha = titleProgress
        
        // Title background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
        ctx.fillRect(canvas.width / 2 - 600, canvas.height / 2 - 100, 1200, 200)
        
        // Title text
        drawTextWithOutline(ctx, title, canvas.width / 2, canvas.height / 2, style.fontSize.title + 10)
        
        // Animated accent line
        const lineWidth = 400 * titleProgress
        ctx.fillStyle = style.accent
        ctx.fillRect(canvas.width / 2 - lineWidth / 2, canvas.height / 2 + 60, lineWidth, 4)
        
        ctx.globalAlpha = 1
      } else {
        // Script text display
        if (currentSegment) {
          const segmentProgress = (frame - currentSegment.startFrame) / (currentSegment.endFrame - currentSegment.startFrame)
          
          // Fade in/out effect
          if (segmentProgress < 0.1) {
            ctx.globalAlpha = segmentProgress * 10
          } else if (segmentProgress > 0.9) {
            ctx.globalAlpha = (1 - segmentProgress) * 10
          } else {
            ctx.globalAlpha = 1
          }
          
          // Text background
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
          ctx.fillRect(100, canvas.height - 200, canvas.width - 200, 150)
          
          // Script text
          const lines = wrapText(ctx, currentSegment.text, canvas.width - 300, style.fontSize.caption)
          lines.forEach((line, i) => {
            drawTextWithOutline(ctx, line, canvas.width / 2, canvas.height - 130 + i * 35, style.fontSize.caption)
          })
          
          ctx.globalAlpha = 1
        }
        
        // Progress bar
        const progress = frame / totalFrames
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.fillRect(100, canvas.height - 30, canvas.width - 200, 4)
        ctx.fillStyle = style.accent
        ctx.fillRect(100, canvas.height - 30, (canvas.width - 200) * progress, 4)
      }
      
      // Frame counter (small, bottom right)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.font = '14px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(`${Math.floor(currentTime)}s / ${duration}s`, canvas.width - 100, 40)
      
      frame++
      
      // Update progress
      if (frame % 10 === 0) {
        const progress = Math.min(90, 10 + (frame / totalFrames) * 80)
        onProgress?.(progress, `Rendering frame ${frame}/${totalFrames}...`)
      }
      
      if (frame < totalFrames) {
        requestAnimationFrame(renderFrame)
      } else {
        onProgress?.(100, 'Finalizing video...')
        mediaRecorder.stop()
      }
    }
    
    requestAnimationFrame(renderFrame)
  })
}

// Wrap text into lines
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] {
  ctx.font = `bold ${fontSize}px Inter, sans-serif`
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''
  
  words.forEach(word => {
    const testLine = currentLine + word + ' '
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && currentLine !== '') {
      lines.push(currentLine.trim())
      currentLine = word + ' '
    } else {
      currentLine = testLine
    }
  })
  
  if (currentLine.trim()) {
    lines.push(currentLine.trim())
  }
  
  return lines.slice(0, 3) // Max 3 lines
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

// Generate video with AI images
export async function generateVideoWithAI(options: VideoGeneratorOptions, imageApiKey: string): Promise<Blob> {
  if (imageApiKey && options.script) {
    options.onProgress?.(5, 'Generating AI images...')
    options.images = await generateImagesForScript(options.script, options.title, imageApiKey)
  }
  return generateVideo(options)
}
