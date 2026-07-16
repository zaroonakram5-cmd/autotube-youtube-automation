import prisma from './prisma'
import type { GeneratedContent, VideoGenerationRequest } from '@/types'

// Get API key from user's saved keys in database
async function getApiKey(userId: string, provider: string): Promise<string | null> {
  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
    })
    return apiKey?.encryptedKey || null
  } catch {
    return null
  }
}

// xAI Grok Content Generation (Primary)
export async function generateContentWithGrok(
  userId: string,
  niche: string,
  topic: string
): Promise<GeneratedContent> {
  const apiKey = await getApiKey(userId, 'xai')
  if (!apiKey) {
    throw new Error('xAI API key not configured. Please add your xAI API key in Settings.')
  }

  const response = await fetch(
    'https://api.x.ai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-2-1212',
        messages: [
          {
            role: 'system',
            content: 'You are an expert YouTube script writer. Create engaging, viral-worthy video content.',
          },
          {
            role: 'user',
            content: `Niche: ${niche}
Topic: ${topic}

Create a complete YouTube video script with:
1. A catchy, attention-grabbing title (max 100 characters)
2. A full video script (800-1200 words, conversational and engaging tone)
3. A compelling video description (150-200 characters)
4. 8-10 relevant tags for SEO
5. 5-7 trending hashtags

IMPORTANT: Return ONLY valid JSON in this exact format, no markdown, no code blocks, just pure JSON:
{"title":"Your video title here","script":"Your full script text here...","description":"Your description here","tags":["tag1","tag2","tag3"],"hashtags":["#hashtag1","#hashtag2"]}`,
          },
        ],
        temperature: 0.9,
        max_tokens: 8192,
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`xAI API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  
  if (!data.choices || !data.choices[0]?.message?.content) {
    throw new Error('Invalid xAI response format')
  }

  let content = data.choices[0].message.content
  
  // Clean up the response - remove markdown code blocks if present
  content = content.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
  
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response as JSON')
  }

  const result = JSON.parse(jsonMatch[0])
  
  // Validate required fields
  if (!result.title || !result.script || !result.description || !result.tags || !result.hashtags) {
    throw new Error('AI response missing required fields')
  }

  return {
    title: result.title,
    script: result.script,
    description: result.description,
    tags: Array.isArray(result.tags) ? result.tags : [],
    hashtags: Array.isArray(result.hashtags) ? result.hashtags : [],
  }
}

// Fallback: Grok Beta model
export async function generateContentWithGrokBeta(
  userId: string,
  niche: string,
  topic: string
): Promise<GeneratedContent> {
  const apiKey = await getApiKey(userId, 'xai')
  if (!apiKey) {
    throw new Error('xAI API key not configured')
  }

  const response = await fetch(
    'https://api.x.ai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          {
            role: 'user',
            content: `Create a YouTube video script for niche: ${niche}, topic: ${topic}. 
                       Return JSON: {"title":"...","script":"...","description":"...","tags":[...],"hashtags":[...]}`,
          },
        ],
        temperature: 0.8,
        max_tokens: 4096,
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`xAI Grok Beta API error: ${response.statusText}`)
  }

  const data = await response.json()
  const content = data.choices[0].message.content
  
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response')
  }

  return JSON.parse(jsonMatch[0])
}

// Gemini Content Generation
async function generateContentWithGemini(
  userId: string,
  niche: string,
  topic: string
): Promise<GeneratedContent> {
  const apiKey = await getApiKey(userId, 'gemini')
  if (!apiKey) throw new Error('Gemini API key not configured')

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Create a YouTube video script for niche: ${niche}, topic: ${topic}. Return JSON: {"title":"...","script":"...","description":"...","tags":[...],"hashtags":[...]}`,
          }],
        }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 4096 },
      }),
    }
  )

  if (!response.ok) throw new Error(`Gemini API error: ${response.status}`)

  const data = await response.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Failed to parse Gemini response')
  return JSON.parse(jsonMatch[0])
}

// Primary content generation - tries multiple AI providers
export async function generateVideoContent(
  userId: string,
  request: VideoGenerationRequest
): Promise<GeneratedContent> {
  // Try providers in order of preference
  const providers = ['xai', 'openai', 'gemini', 'openrouter', 'groq']
  
  let lastError = null
  
  for (const provider of providers) {
    const apiKey = await getApiKey(userId, provider)
    if (!apiKey) continue
    
    try {
      switch (provider) {
        case 'xai':
          return await generateContentWithGrok(userId, request.niche, request.topic)
        case 'openai':
          return await generateContentWithOpenAI(userId, request.niche, request.topic)
        case 'gemini':
          return await generateContentWithGemini(userId, request.niche, request.topic)
        case 'openrouter':
          return await generateContentWithOpenRouter(userId, request.niche, request.topic)
        case 'groq':
          return await generateContentWithGroq(userId, request.niche, request.topic)
      }
    } catch (error) {
      console.error(`${provider} failed:`, error)
      lastError = error
      continue
    }
  }
  
  throw lastError || new Error('No AI API keys configured. Please add an API key in Settings.')
}

// OpenAI Content Generation
async function generateContentWithOpenAI(
  userId: string,
  niche: string,
  topic: string
): Promise<GeneratedContent> {
  const apiKey = await getApiKey(userId, 'openai')
  if (!apiKey) throw new Error('OpenAI API key not configured')

  const response = await fetch(
    'https://api.openai.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert YouTube script writer.',
          },
          {
            role: 'user',
            content: `Niche: ${niche}\nTopic: ${topic}\n\nReturn JSON: {"title":"...","script":"...","description":"...","tags":[...],"hashtags":[...]}`,
          },
        ],
        temperature: 0.9,
        max_tokens: 4096,
      }),
    }
  )

  if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`)

  const data = await response.json()
  const content = data.choices[0].message.content
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Failed to parse OpenAI response')
  return JSON.parse(jsonMatch[0])
}

// OpenRouter Content Generation
async function generateContentWithOpenRouter(
  userId: string,
  niche: string,
  topic: string
): Promise<GeneratedContent> {
  const apiKey = await getApiKey(userId, 'openrouter')
  if (!apiKey) throw new Error('OpenRouter API key not configured')

  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://your-site.com',
        'X-Title': 'YouTube Automation',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Create a YouTube video script for niche: ${niche}, topic: ${topic}. Return JSON: {"title":"...","script":"...","description":"...","tags":[...],"hashtags":[...]}`,
          },
        ],
        max_tokens: 4096,
      }),
    }
  )

  if (!response.ok) throw new Error(`OpenRouter API error: ${response.status}`)

  const data = await response.json()
  const content = data.choices[0].message.content
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Failed to parse OpenRouter response')
  return JSON.parse(jsonMatch[0])
}

// Groq Content Generation
async function generateContentWithGroq(
  userId: string,
  niche: string,
  topic: string
): Promise<GeneratedContent> {
  const apiKey = await getApiKey(userId, 'groq')
  if (!apiKey) throw new Error('Groq API key not configured')

  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'user',
            content: `Create a YouTube video script for niche: ${niche}, topic: ${topic}. Return JSON: {"title":"...","script":"...","description":"...","tags":[...],"hashtags":[...]}`,
          },
        ],
        max_tokens: 4096,
      }),
    }
  )

  if (!response.ok) throw new Error(`Groq API error: ${response.status}`)

  const data = await response.json()
  const content = data.choices[0].message.content
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Failed to parse Groq response')
  return JSON.parse(jsonMatch[0])
}

// Check API key validity
export async function validateApiKey(userId: string, provider: string): Promise<boolean> {
  try {
    const apiKey = await getApiKey(userId, provider)
    if (!apiKey) return false

    switch (provider) {
      case 'xai': {
        // Test xAI API with a simple request
        const response = await fetch('https://api.x.ai/v1/models', {
          headers: { Authorization: `Bearer ${apiKey}` },
        })
        return response.ok
      }
      case 'openai': {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${apiKey}` },
        })
        return response.ok
      }
      case 'elevenlabs': {
        const response = await fetch('https://api.elevenlabs.io/v1/user', {
          headers: { 'xi-api-key': apiKey },
        })
        return response.ok
      }
      case 'replicate': {
        const response = await fetch('https://api.replicate.com/v1/models', {
          headers: { Authorization: `Token ${apiKey}` },
        })
        return response.ok
      }
      case 'stability': {
        const response = await fetch('https://api.stability.ai/v1/user/balance', {
          headers: { Authorization: `Bearer ${apiKey}` },
        })
        return response.ok
      }
      case 'gemini': {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        )
        return response.ok
      }
      default:
        return false
    }
  } catch {
    return false
  }
}
