import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/videos - Get all videos for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: Record<string, unknown> = { userId: user.id }
    if (status) {
      where.status = status
    }

    const videos = await prisma.video.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        channel: {
          select: { name: true },
        },
      },
    })

    const total = await prisma.video.count({ where })

    return NextResponse.json({
      videos,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Get videos error:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}

// POST /api/videos - Create a new video
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { title, script, description, tags, hashtags, niche, topic, channelId } = data

    const video = await prisma.video.create({
      data: {
        userId: user.id,
        title,
        script,
        description,
        tags: tags || [],
        hashtags: hashtags || [],
        niche,
        topic,
        channelId,
        status: 'DRAFT',
      },
    })

    return NextResponse.json({ video }, { status: 201 })
  } catch (error) {
    console.error('Create video error:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
