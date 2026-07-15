import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/videos/[id] - Get single video
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const video = await prisma.video.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        channel: {
          select: { name: true },
        },
        frames: {
          orderBy: { order: 'asc' },
        },
        audioTracks: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    return NextResponse.json({ video })
  } catch (error) {
    console.error('Get video error:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}

// PATCH /api/videos/[id] - Update video
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    const video = await prisma.video.findFirst({
      where: { id: params.id, userId: user.id },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const updatedVideo = await prisma.video.update({
      where: { id: params.id },
      data: {
        title: data.title ?? video.title,
        script: data.script ?? video.script,
        description: data.description ?? video.description,
        tags: data.tags ?? video.tags,
        hashtags: data.hashtags ?? video.hashtags,
        status: data.status ?? video.status,
        videoUrl: data.videoUrl ?? video.videoUrl,
        thumbnailUrl: data.thumbnailUrl ?? video.thumbnailUrl,
        scheduledFor: data.scheduledFor ?? video.scheduledFor,
      },
    })

    return NextResponse.json({ video: updatedVideo })
  } catch (error) {
    console.error('Update video error:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}

// DELETE /api/videos/[id] - Delete video
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const video = await prisma.video.findFirst({
      where: { id: params.id, userId: user.id },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    await prisma.video.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Video deleted' })
  } catch (error) {
    console.error('Delete video error:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
