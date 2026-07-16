// Text-to-Speech Service - WORKING!
// Uses Web Speech API (FREE) + ElevenLabs + OpenAI

export interface TTSOptions {
  text: string
  voiceId?: string
  speed?: number
  pitch?: number
  provider: 'web' | 'elevenlabs' | 'openai'
  apiKey?: string
}

// Brainrot funny voices using Web Speech API (FREE!)
export const brainrotVoices = [
  // Funny/chaotic voices
  { id: 'funny-high', name: 'Silly High', pitch: 1.8, rate: 1.2 },
  { id: 'funny-low', name: 'Silly Deep', pitch: 0.6, rate: 1.3 },
  { id: 'cartoon', name: 'Cartoon Voice', pitch: 1.5, rate: 1.1 },
  { id: 'robot', name: 'Robot Voice', pitch: 0.8, rate: 0.9 },
  { id: 'alien', name: 'Alien Voice', pitch: 2.0, rate: 1.0 },
  { id: 'demon', name: 'Demon Voice', pitch: 0.4, rate: 0.8 },
  { id: 'chipmunk', name: 'Chipmunk', pitch: 2.2, rate: 1.4 },
  // Normal voices
  { id: 'adult-male', name: 'Adult Male', pitch: 1.0, rate: 1.0 },
  { id: 'adult-female', name: 'Adult Female', pitch: 1.2, rate: 1.0 },
  { id: 'child', name: 'Child Voice', pitch: 1.5, rate: 1.1 },
]

// Web Speech API TTS (FREE - works in browser!)
export function generateWebSpeech(
  text: string, 
  voiceId: string = 'funny-high',
  speed: number = 1.0,
  pitch: number = 1.0
): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text)
  
  // Set brainrot voice parameters
  const voiceConfig = brainrotVoices.find(v => v.id === voiceId) || brainrotVoices[0]
  
  utterance.rate = (speed || 1.0) * voiceConfig.rate
  utterance.pitch = (pitch || 1.0) * voiceConfig.pitch
  utterance.volume = 1.0
  
  // Try to find a good voice in browser
  const voices = speechSynthesis.getVoices()
  if (voices.length > 0) {
    // Prefer Google US English for fun voices
    const preferredVoice = voices.find(v => 
      v.name.includes('Google US English') ||
      v.name.includes('Microsoft') ||
      v.lang.startsWith('en')
    )
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }
  }
  
  return utterance
}

// ElevenLabs TTS (Premium)
export async function generateWithElevenLabs(options: TTSOptions): Promise<Blob> {
  if (!options.apiKey) {
    throw new Error('ElevenLabs API key required')
  }

  const voiceId = options.voiceId || 'rachel'

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

// OpenAI TTS (Premium)
export async function generateWithOpenAI(options: TTSOptions): Promise<Blob> {
  if (!options.apiKey) {
    throw new Error('OpenAI API key required')
  }

  const voiceId = options.voiceId || 'alloy'

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
        speed: options.speed || 1.0,
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`OpenAI TTS error: ${response.status}`)
  }

  return response.blob()
}

// Main TTS function - Tries providers in order
export async function generateSpeech(options: TTSOptions): Promise<{ type: 'web' | 'api'; audio?: Blob; utterance?: SpeechSynthesisUtterance }> {
  // Try Web Speech API first (FREE!)
  try {
    const utterance = generateWebSpeech(options.text, options.voiceId, options.speed, options.pitch)
    return { type: 'web', utterance }
  } catch (e) {
    console.error('Web Speech failed:', e)
  }
  
  // Try ElevenLabs
  if (options.provider === 'elevenlabs' && options.apiKey) {
    try {
      const blob = await generateWithElevenLabs(options)
      return { type: 'api', audio: blob }
    } catch (e) {
      console.error('ElevenLabs failed:', e)
    }
  }
  
  // Try OpenAI
  if (options.provider === 'openai' && options.apiKey) {
    try {
      const blob = await generateWithOpenAI(options)
      return { type: 'api', audio: blob }
    } catch (e) {
      console.error('OpenAI failed:', e)
    }
  }
  
  // Fallback to Web Speech
  const utterance = generateWebSpeech(options.text, options.voiceId || 'funny-high', options.speed || 1.0, options.pitch || 1.0)
  return { type: 'web', utterance }
}

// Get all available brainrot voices
export function getBrainrotVoices() {
  return brainrotVoices
}
