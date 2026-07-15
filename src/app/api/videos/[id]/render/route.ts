import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

// POST /api/videos/[id]/render - Start video rendering
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { resolution = '1080p' } = await request.json()

    const video = await prisma.video.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Update video status to rendering
    await prisma.video.update({
      where: { id },
      data: {
        status: 'RENDERING',
        resolution,
      },
    })

    // Simulate rendering completion after 5 seconds
    setTimeout(async () => {
      try {
        await prisma.video.update({
          where: { id },
          data: {
            status: 'COMPLETED',
            duration: Math.floor(Math.random() * 180) + 60,
          },
        })
      } catch (e) {
        console.error('Failed to update video status:', e)
      }
    }, 5000)

    return NextResponse.json({
      message: 'Rendering started',
      videoId: id,
      resolution,
      estimatedTime: '5 seconds',
    })
  } catch (error) {
    console.error('Render error:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}

// GET /api/videos/[id]/render - Get render status
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

    return NextResponse.json({
      id: video.id,
      status: video.status,
      duration: video.duration,
      resolution: video.resolution,
      videoUrl: video.videoUrl,
    })
  } catch (error) {
    console.error('Get render status error:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
