import prisma from './prisma'
import type { GeneratedContent, VideoGenerationRequest } from '@/types'

// Get user's API key for a specific provider
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

// Gemini Content Generation (Primary)
export async function generateContentWithGemini(
  userId: string,
  niche: string,
  topic: string
): Promise<GeneratedContent> {
  const apiKey = await getApiKey(userId, 'gemini')
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Please add your Gemini API key in Settings.')
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an expert YouTube script writer. Create engaging, viral-worthy video content.

Niche: ${niche}
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
          },
        ],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  
  if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid Gemini response format')
  }

  let content = data.candidates[0].content.parts[0].text
  
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

// Fallback: Gemini 1.5 Flash (if 2.0 is not available)
export async function generateContentWithGeminiFlash(
  userId: string,
  niche: string,
  topic: string
): Promise<GeneratedContent> {
  const apiKey = await getApiKey(userId, 'gemini')
  if (!apiKey) {
    throw new Error('Gemini API key not configured')
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Create a YouTube video script for niche: ${niche}, topic: ${topic}. 
                       Return JSON: {"title":"...","script":"...","description":"...","tags":[...],"hashtags":[...]}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 4096,
        },
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Gemini Flash API error: ${response.statusText}`)
  }

  const data = await response.json()
  const content = data.candidates[0].content.parts[0].text
  
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response')
  }

  return JSON.parse(jsonMatch[0])
}

// Primary content generation using Gemini
export async function generateVideoContent(
  userId: string,
  request: VideoGenerationRequest
): Promise<GeneratedContent> {
  try {
    // Try Gemini 2.0 Flash first
    return await generateContentWithGemini(userId, request.niche, request.topic)
  } catch (error) {
    // If 2.0 fails, try 1.5 Flash as fallback
    console.error('Gemini 2.0 failed, trying 1.5 Flash:', error)
    return await generateContentWithGeminiFlash(userId, request.niche, request.topic)
  }
}

// Check API key validity
export async function validateApiKey(userId: string, provider: string): Promise<boolean> {
  try {
    const apiKey = await getApiKey(userId, provider)
    if (!apiKey) return false

    switch (provider) {
      case 'gemini': {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        )
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
      default:
        return false
    }
  } catch {
    return false
  }
}
