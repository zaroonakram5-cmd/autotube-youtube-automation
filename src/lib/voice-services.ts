import prisma from './prisma'

interface TTSOptions {
  text: string
  voiceId: string
  speed?: number
  pitch?: number
  outputPath?: string
}

interface TTSResult {
  audioUrl: string
  duration: number
}

// Get user's API key for a provider
async function getApiKey(userId: string, provider: string): Promise<string | null> {
  const apiKey = await prisma.apiKey.findUnique({
    where: {
      userId_provider: {
        userId,
        provider,
      },
    },
  })
  return apiKey?.encryptedKey || null
}

// Edge TTS (Free - no API key required)
export async function generateVoiceEdgeTTS(
  userId: string,
  options: TTSOptions
): Promise<TTSResult> {
  // Edge TTS uses edge-tts-node library
  // For production, this would use a proper Edge TTS implementation
  
  // Since we're building a web app without actual FFmpeg/Edge TTS in this demo,
  // we'll simulate the output
  const outputPath = options.outputPath || `./storage/voices/${Date.now()}.mp3`
  
  // In production, this would call edge-tts-node:
  // const edge = new EdgeTTS();
  // await edge.synthesize(options.text, options.voiceId, outputPath, {
  //   rate: options.speed || 1,
  //   pitch: options.pitch || 0,
  // });
  
  // Simulate duration calculation (roughly 150 words per minute)
  const words = options.text.split(/\s+/).length
  const duration = Math.ceil((words / 150) * 60 / (options.speed || 1))
  
  return {
    audioUrl: `/api/storage/voices/${Date.now()}.mp3`,
    duration,
  }
}

// ElevenLabs TTS
export async function generateVoiceElevenLabs(
  userId: string,
  options: TTSOptions
): Promise<TTSResult> {
  const apiKey = await getApiKey(userId, 'elevenlabs')
  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured')
  }

  const voiceId = options.voiceId || 'EXAVITQu4vr4xnSDxMaL'
  
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: options.text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
          speed: options.speed || 1.0,
          pitch: (options.pitch || 1.0) * 50 - 50, // Convert 0.5-2.0 to -50 to 50
        },
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.statusText}`)
  }

  const audioBuffer = await response.arrayBuffer()
  const filename = `${Date.now()}.mp3`
  const outputPath = `./storage/voices/${filename}`
  
  // In production, save the buffer to file storage
  // For now, return a mock URL
  const audioUrl = `/api/storage/voices/${filename}`
  
  // Estimate duration (ElevenLabs returns duration in headers or we estimate)
  const words = options.text.split(/\s+/).length
  const duration = Math.ceil((words / 150) * 60 / (options.speed || 1))
  
  return {
    audioUrl,
    duration,
  }
}

// Unified voice generation
export async function generateVoice(
  userId: string,
  provider: 'EDGE_TTS' | 'ELEVENLABS',
  options: TTSOptions
): Promise<TTSResult> {
  switch (provider) {
    case 'EDGE_TTS':
      return await generateVoiceEdgeTTS(userId, options)
    case 'ELEVENLABS':
      return await generateVoiceElevenLabs(userId, options)
    default:
      throw new Error(`Unsupported voice provider: ${provider}`)
  }
}

// Get available voices for a provider
export async function getAvailableVoices(
  userId: string,
  provider: 'EDGE_TTS' | 'ELEVENLABS'
): Promise<Array<{ id: string; name: string; language: string }>> {
  switch (provider) {
    case 'EDGE_TTS':
      return [
        { id: 'en-US-AriaNeural', name: 'Aria (Female)', language: 'en-US' },
        { id: 'en-US-GuyNeural', name: 'Guy (Male)', language: 'en-US' },
        { id: 'en-US-JennyNeural', name: 'Jenny (Female)', language: 'en-US' },
        { id: 'en-US-SteffanNeural', name: 'Steffan (Male)', language: 'en-US' },
        { id: 'en-GB-SoniaNeural', name: 'Sonia (Female)', language: 'en-GB' },
        { id: 'en-AU-NatashaNeural', name: 'Natasha (Female)', language: 'en-AU' },
        { id: 'en-IN-NeerjaNeural', name: 'Neerja (Female)', language: 'en-IN' },
        { id: 'de-DE-KatjaNeural', name: 'Katja (Female)', language: 'de-DE' },
        { id: 'fr-FR-DeniseNeural', name: 'Denise (Female)', language: 'fr-FR' },
        { id: 'es-ES-ElviraNeural', name: 'Elvira (Female)', language: 'es-ES' },
      ]
    case 'ELEVENLABS':
      const apiKey = await getApiKey(userId, 'elevenlabs')
      if (!apiKey) {
        return [{ id: 'custom', name: 'Custom Voice (API Required)', language: 'multi' }]
      }
      
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': apiKey },
      })
      
      if (!response.ok) {
        return [{ id: 'custom', name: 'Custom Voice', language: 'multi' }]
      }
      
      const data = await response.json()
      return data.voices.map((v: { voice_id: string; name: string; languages: string[] }) => ({
        id: v.voice_id,
        name: v.name,
        language: v.languages?.[0] || 'multi',
      }))
    default:
      return []
  }
}
