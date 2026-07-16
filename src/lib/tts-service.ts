// Text-to-Speech Service
// Supports multiple providers: Edge TTS (free), ElevenLabs, OpenAI TTS

export interface TTSOptions {
  text: string
  voiceId?: string
  speed?: number
  pitch?: number
  provider: 'edge' | 'elevenlabs' | 'openai'
  apiKey?: string
}

// Voice presets
export const voices = {
  edge: [
    { id: 'en-US-AriaNeural', name: 'Aria (US)', language: 'English' },
    { id: 'en-US-GuyNeural', name: 'Guy (US)', language: 'English' },
    { id: 'en-US-JennyNeural', name: 'Jenny (US)', language: 'English' },
    { id: 'en-GB-RyanNeural', name: 'Ryan (UK)', language: 'English' },
    { id: 'en-AU-NatashaNeural', name: 'Natasha (AU)', language: 'English' },
    { id: 'es-ES-ElviraNeural', name: 'Elvira (Spain)', language: 'Spanish' },
    { id: 'fr-FR-DeniseNeural', name: 'Denise (France)', language: 'French' },
    { id: 'de-DE-KatjaNeural', name: 'Katja (Germany)', language: 'German' },
    { id: 'ja-JP-NanamiNeural', name: 'Nanami (Japan)', language: 'Japanese' },
    { id: 'ko-KR-SunHiNeural', name: 'SunHi (Korea)', language: 'Korean' },
    { id: 'zh-CN-XiaoxiaoNeural', name: 'Xiaoxiao (China)', language: 'Chinese' },
    { id: 'hi-IN-MadhurNeural', name: 'Madhur (India)', language: 'Hindi' },
  ],
  elevenlabs: [
    { id: 'rachel', name: 'Rachel', language: 'English' },
    { id: 'domi', name: 'Domi', language: 'English' },
    { id: 'bella', name: 'Bella', language: 'English' },
    { id: 'anton', name: 'Anton', language: 'English' },
    { id: 'taylor', name: 'Taylor', language: 'English' },
    { id: 'james', name: 'James', language: 'English' },
  ],
  openai: [
    { id: 'alloy', name: 'Alloy', language: 'English' },
    { id: 'echo', name: 'Echo', language: 'English' },
    { id: 'fable', name: 'Fable', language: 'English' },
    { id: 'onyx', name: 'Onyx', language: 'English' },
    { id: 'nova', name: 'Nova', language: 'English' },
    { id: 'shimmer', name: 'Shimmer', language: 'English' },
  ],
}

// ElevenLabs TTS
export async function generateWithElevenLabs(options: TTSOptions): Promise<Blob> {
  if (!options.apiKey) {
    throw new Error('ElevenLabs API key required')
  }

  const voiceId = options.voiceId || 'rachel'
  const speed = options.speed || 1.0

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': options.apiKey,
      },
      body: JSON.stringify({
        text: options.text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`ElevenLabs error: ${response.status}`)
  }

  return response.blob()
}

// OpenAI TTS
export async function generateWithOpenAI(options: TTSOptions): Promise<Blob> {
  if (!options.apiKey) {
    throw new Error('OpenAI API key required')
  }

  const voiceId = options.voiceId || 'alloy'
  const speed = options.speed || 1.0

  const response = await fetch(
    'https://api.openai.com/v1/audio/speech',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: options.text,
        voice: voiceId,
        speed: speed,
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`OpenAI TTS error: ${response.status}`)
  }

  return response.blob()
}

// Edge TTS (browser-based, free)
export async function generateWithEdge(options: TTSOptions): Promise<Blob> {
  const voiceId = options.voiceId || 'en-US-AriaNeural'
  const speed = options.speed || 1.0

  // Edge TTS uses Web Speech API in browser
  return new Promise((resolve, reject) => {
    // Fallback: use Web Speech API
    const utterance = new SpeechSynthesisUtterance(options.text)
    utterance.rate = speed
    utterance.pitch = options.pitch || 1.0
    
    // Try to find the voice
    const voices = speechSynthesis.getVoices()
    const voice = voices.find(v => v.name.includes(voiceId.replace('Neural', ''))) || voices[0]
    if (voice) {
      utterance.voice = voice
    }
    
    // Create audio context for recording
    const audioContext = new AudioContext()
    const destination = audioContext.createMediaStreamDestination()
    
    // For now, return a placeholder - full implementation would use Edge TTS API directly
    // This is a simplified version
    reject(new Error('Edge TTS recording not fully implemented. Use ElevenLabs or OpenAI for audio.'))
  })
}

// Main TTS function
export async function generateSpeech(options: TTSOptions): Promise<Blob> {
  switch (options.provider) {
    case 'elevenlabs':
      return generateWithElevenLabs(options)
    case 'openai':
      return generateWithOpenAI(options)
    case 'edge':
      return generateWithEdge(options)
    default:
      throw new Error('Invalid TTS provider')
  }
}

// Get available voices for a provider
export function getVoicesForProvider(provider: 'edge' | 'elevenlabs' | 'openai') {
  return voices[provider] || []
}
