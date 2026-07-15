import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

// POST /api/settings/api-keys - Save API key
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { provider, key } = await request.json()

    if (!provider || !key) {
      return NextResponse.json(
        { error: 'Provider and key are required' },
        { status: 400 }
      )
    }

    // Upsert API key (create or update)
    const apiKey = await prisma.apiKey.upsert({
      where: {
        userId_provider: {
          userId: user.id,
          provider,
        },
      },
      update: {
        encryptedKey: key,
        isActive: true,
      },
      create: {
        userId: user.id,
        provider,
        encryptedKey: key,
        isActive: true,
      },
    })

    return NextResponse.json({
      message: 'API key saved successfully',
      provider: apiKey.provider,
    })
  } catch (error) {
    console.error('Save API key error:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}

// GET /api/settings/api-keys - Get configured API keys (without exposing the actual keys)
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      select: {
        provider: true,
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ apiKeys })
  } catch (error) {
    console.error('Get API keys error:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}

// DELETE /api/settings/api-keys - Delete an API key
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { provider } = await request.json()

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      )
    }

    await prisma.apiKey.delete({
      where: {
        userId_provider: {
          userId: user.id,
          provider,
        },
      },
    })

    return NextResponse.json({ message: 'API key deleted' })
  } catch (error) {
    console.error('Delete API key error:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
