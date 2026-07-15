import prisma from './prisma'
import type { GeneratedContent, VideoGenerationRequest } from '@/types'

// Get API key - first check environment variable, then user database
async function getApiKey(userId: string, provider: string): Promise<string | null> {
  // First check environment variable (global fallback)
  const envKey = process.env[`${provider.toUpperCase()}_API_KEY`]
  if (envKey) return envKey
  
  // Then check user-saved API key in database
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

// Primary content generation using xAI Grok
export async function generateVideoContent(
  userId: string,
  request: VideoGenerationRequest
): Promise<GeneratedContent> {
  try {
    // Try Grok 2 first
    return await generateContentWithGrok(userId, request.niche, request.topic)
  } catch (error) {
    // If Grok 2 fails, try Grok Beta as fallback
    console.error('Grok 2 failed, trying Grok Beta:', error)
    return await generateContentWithGrokBeta(userId, request.niche, request.topic)
  }
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
