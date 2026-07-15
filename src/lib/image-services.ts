import prisma from './prisma'

interface ImageGenerationOptions {
  prompt: string
  width?: number
  height?: number
  model?: string
  style?: string
}

interface ImageResult {
  imageUrl: string
  revisedPrompt?: string
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

// Stability AI Image Generation
export async function generateImageStability(
  userId: string,
  options: ImageGenerationOptions
): Promise<ImageResult> {
  const apiKey = await getApiKey(userId, 'stability')
  if (!apiKey) {
    throw new Error('Stability AI API key not configured')
  }

  const engineId = options.model || 'stable-diffusion-xl-1024-v1-0'
  
  const response = await fetch(
    `https://api.stability.ai/v1/generation/${engineId}/text-to-image`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: options.prompt,
            weight: 1,
          },
        ],
        cfg_scale: 7,
        height: options.height || 1024,
        width: options.width || 1024,
        steps: 30,
        samples: 1,
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Stability AI API error: ${response.statusText}`)
  }

  const data = await response.json()
  const base64Image = data.artifacts[0].base64
  
  const filename = `stability_${Date.now()}.png`
  const imageUrl = `/api/storage/images/${filename}`
  
  // In production, save the base64 image to storage
  return {
    imageUrl,
    revisedPrompt: data.artifacts[0].finishReason === 'SUCCESS' ? options.prompt : undefined,
  }
}

// Replicate Image Generation (Flux, SDXL, etc.)
export async function generateImageReplicate(
  userId: string,
  options: ImageGenerationOptions
): Promise<ImageResult> {
  const apiKey = await getApiKey(userId, 'replicate')
  if (!apiKey) {
    throw new Error('Replicate API key not configured')
  }

  const model = options.model || 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a568f7ad526c505129d75b9b1e05d0e1b59f9f4b1e'
  
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${apiKey}`,
    },
    body: JSON.stringify({
      version: model,
      input: {
        prompt: options.prompt,
        width: options.width || 1024,
        height: options.height || 1024,
        num_inference_steps: options.style === 'fast' ? 20 : 50,
        guidance_scale: 7.5,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Replicate API error: ${response.statusText}`)
  }

  const prediction = await response.json()
  
  // Poll for completion (in production, use webhooks)
  let status = prediction.status
  while (status !== 'succeeded' && status !== 'failed') {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const statusResponse = await fetch(
      `https://api.replicate.com/v1/predictions/${prediction.id}`,
      {
        headers: { Authorization: `Token ${apiKey}` },
      }
    )
    
    const statusData = await statusResponse.json()
    status = statusData.status
    
    if (status === 'failed') {
      throw new Error('Image generation failed')
    }
  }

  const output = prediction.output || prediction.urls?.get
  const imageUrl = Array.isArray(output) ? output[0] : output
  
  return {
    imageUrl,
    revisedPrompt: options.prompt,
  }
}

// OpenAI DALL-E Image Generation
export async function generateImageOpenAI(
  userId: string,
  options: ImageGenerationOptions
): Promise<ImageResult> {
  const apiKey = await getApiKey(userId, 'openai')
  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const size = options.width === 1024 && options.height === 1024 
    ? '1024x1024' 
    : options.width === 1792 && options.height === 1024 
    ? '1792x1024' 
    : options.width === 1024 && options.height === 1792 
    ? '1024x1792' 
    : '1024x1024'

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: options.prompt,
      n: 1,
      size,
      quality: 'standard',
      style: options.style === 'vivid' ? 'vivid' : 'natural',
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI DALL-E API error: ${response.statusText}`)
  }

  const data = await response.json()
  
  return {
    imageUrl: data.data[0].url,
    revisedPrompt: data.data[0].revised_prompt,
  }
}

// Unified image generation
export async function generateImage(
  userId: string,
  provider: string,
  options: ImageGenerationOptions
): Promise<ImageResult> {
  switch (provider) {
    case 'stability':
      return await generateImageStability(userId, options)
    case 'replicate':
      return await generateImageReplicate(userId, options)
    case 'openai':
      return await generateImageOpenAI(userId, options)
    default:
      throw new Error(`Unsupported image provider: ${provider}`)
  }
}

// Get available image models
export function getAvailableModels(provider: string): Array<{ id: string; name: string; description: string }> {
  switch (provider) {
    case 'stability':
      return [
        { id: 'stable-diffusion-xl-1024-v1-0', name: 'SDXL 1.0', description: 'High quality, 1024x1024' },
        { id: 'stable-diffusion-v1-6', name: 'SD 1.6', description: 'Classic Stable Diffusion' },
      ]
    case 'replicate':
      return [
        { id: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a568f7ad526c505129d75b9b1e05d0e1b59f9f4b1e', name: 'SDXL', description: 'Stable Diffusion XL' },
        { id: 'black-forest-labs/flux-schnell', name: 'Flux Schnell', description: 'Fast generation' },
        { id: 'black-forest-labs/flux-dev', name: 'Flux Dev', description: 'Developer model' },
      ]
    case 'openai':
      return [
        { id: 'dall-e-3', name: 'DALL-E 3', description: 'Latest OpenAI model' },
      ]
    default:
      return []
  }
}
