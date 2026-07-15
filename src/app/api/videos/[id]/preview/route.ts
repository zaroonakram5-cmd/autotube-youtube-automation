import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import * as fs from 'fs'
import * as path from 'path'

// GET /api/videos/[id]/preview - Get video for preview/download
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
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // If video URL is stored, redirect to it
    if (video.videoUrl) {
      // For actual file paths
      const videoPath = path.join(process.cwd(), 'storage', 'videos', `${video.id}.mp4`)
      
      if (fs.existsSync(videoPath)) {
        const stat = fs.statSync(videoPath)
        const fileSize = stat.size
        const range = request.headers.get('range')

        if (range) {
          // Handle range request for video streaming
          const parts = range.replace(/bytes=/, '').split('-')
          const start = parseInt(parts[0], 10)
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
          const chunksize = end - start + 1
          const fileBuffer = fs.readFileSync(videoPath)
          const chunk = fileBuffer.slice(start, end + 1)
          const head: Record<string, string> = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': String(chunksize),
            'Content-Type': 'video/mp4',
          }
          return new NextResponse(chunk, { status: 206, headers: head })
        }

        // Full file download
        const fileBuffer = fs.readFileSync(videoPath)
        const head: Record<string, string> = {
          'Content-Length': String(fileSize),
          'Content-Type': 'video/mp4',
          'Content-Disposition': `attachment; filename="${video.title}.mp4"`,
        }
        return new NextResponse(fileBuffer, { status: 200, headers: head })
      }

      // If using external URL, redirect
      return NextResponse.redirect(video.videoUrl)
    }

    // If video is not rendered yet, return status
    return NextResponse.json({
      status: video.status,
      message: video.status === 'COMPLETED' 
        ? 'Video is ready for download' 
        : `Video is ${video.status.toLowerCase()}. Please wait for rendering to complete.`,
      videoUrl: video.videoUrl,
      duration: video.duration,
      resolution: video.resolution,
    })
  } catch (error) {
    console.error('Preview video error:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
