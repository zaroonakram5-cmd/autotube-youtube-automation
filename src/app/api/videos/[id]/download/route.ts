import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/videos/[id]/download - Download video content
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const video = await prisma.video.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Return JSON with all video content for download
    const content = {
      title: video.title,
      script: video.script,
      description: video.description,
      tags: video.tags,
      hashtags: video.hashtags,
      niche: video.niche,
      topic: video.topic,
      createdAt: video.createdAt,
      status: video.status,
    }

    // Return as downloadable JSON file
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })
    return new NextResponse(blob, {
      headers: {
        'Content-Disposition': `attachment; filename="${video.title.replace(/[^a-z0-9]/gi, '_')}_content.json"`,
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
