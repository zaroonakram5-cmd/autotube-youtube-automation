import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { generateVideoContent } from '@/lib/ai-services'

// POST /api/videos/generate - Generate video content using AI
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Please refresh the page and try again' }, { status: 401 })
    }

    const { niche, topic, voiceProvider, voiceId, speed, pitch, resolution } = await request.json()

    if (!niche || !topic) {
      return NextResponse.json(
        { error: 'Niche and topic are required' },
        { status: 400 }
      )
    }

    // Check user credits
    if (user.credits < 5) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please contact support.' },
        { status: 402 }
      )
    }

    // Generate content using AI
    const generatedContent = await generateVideoContent(user.id, {
      niche,
      topic,
      voiceProvider: voiceProvider || 'EDGE_TTS',
      voiceId: voiceId || 'en-US-AriaNeural',
      speed: speed || 1.0,
      pitch: pitch || 1.0,
      resolution: resolution || '1080p',
    })

    // Create video record
    const video = await prisma.video.create({
      data: {
        userId: user.id,
        title: generatedContent.title,
        script: generatedContent.script,
        description: generatedContent.description,
        tags: generatedContent.tags,
        hashtags: generatedContent.hashtags,
        niche,
        topic,
        status: 'DRAFT',
      },
    })

    // Deduct credits (skip for demo)
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: { credits: { decrement: 5 } },
    // })

    // Save script to library
    await prisma.script.create({
      data: {
        userId: user.id,
        title: generatedContent.title,
        content: generatedContent.script,
        niche,
        tags: generatedContent.tags,
      },
    })

    return NextResponse.json({
      video,
      content: generatedContent,
    })
  } catch (error) {
    console.error('Generate video error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred. Make sure you have a Gemini API key configured in Settings.' },
      { status: 500 }
    )
  }
}
