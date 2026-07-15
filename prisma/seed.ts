import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@autotube.app' },
    update: {},
    create: {
      email: 'admin@autotube.app',
      password: adminPassword,
      name: 'Admin',
      role: 'ADMIN',
      credits: 9999,
    },
  })
  console.log('✅ Created admin user:', admin.email)

  // Create demo user
  const userPassword = await bcrypt.hash('demo123', 12)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@autotube.app' },
    update: {},
    create: {
      email: 'demo@autotube.app',
      password: userPassword,
      name: 'Demo User',
      role: 'USER',
      credits: 100,
    },
  })
  console.log('✅ Created demo user:', demoUser.email)

  // Create sample channels for demo user
  const channels = await Promise.all([
    prisma.channel.upsert({
      where: { id: 'channel-tech' },
      update: {},
      create: {
        id: 'channel-tech',
        userId: demoUser.id,
        name: 'Tech Reviews',
        description: 'Latest technology reviews and tutorials',
      },
    }),
    prisma.channel.upsert({
      where: { id: 'channel-lifestyle' },
      update: {},
      create: {
        id: 'channel-lifestyle',
        userId: demoUser.id,
        name: 'Lifestyle Hub',
        description: 'Daily lifestyle tips and motivation',
      },
    }),
  ])
  console.log('✅ Created', channels.length, 'channels')

  // Create sample videos
  const videos = await Promise.all([
    prisma.video.upsert({
      where: { id: 'video-1' },
      update: {},
      create: {
        id: 'video-1',
        userId: demoUser.id,
        title: 'The Future of AI in 2025',
        script: 'Welcome to this video about the future of AI...',
        description: 'Discover the latest AI trends and innovations.',
        tags: ['AI', 'technology', 'future', 'innovation'],
        hashtags: ['#AI', '#Tech', '#Future'],
        niche: 'tech',
        topic: 'AI trends 2025',
        status: 'COMPLETED',
        duration: 180,
        resolution: '1080p',
        channelId: channels[0].id,
      },
    }),
    prisma.video.upsert({
      where: { id: 'video-2' },
      update: {},
      create: {
        id: 'video-2',
        userId: demoUser.id,
        title: 'Top 10 Tech Gadgets',
        script: 'In this video, we will explore the top 10...',
        description: 'A comprehensive review of the best gadgets.',
        tags: ['gadgets', 'review', 'technology'],
        hashtags: ['#Tech', '#Gadgets', '#Review'],
        niche: 'tech',
        topic: 'Tech gadgets review',
        status: 'DRAFT',
        channelId: channels[0].id,
      },
    }),
  ])
  console.log('✅ Created', videos.length, 'videos')

  // Create sample scripts
  const scripts = await Promise.all([
    prisma.script.upsert({
      where: { id: 'script-1' },
      update: {},
      create: {
        id: 'script-1',
        userId: demoUser.id,
        title: 'AI Revolution Script',
        content: 'Welcome everyone to another exciting video...',
        niche: 'tech',
        tags: ['AI', 'revolution', 'future'],
      },
    }),
    prisma.script.upsert({
      where: { id: 'script-2' },
      update: {},
      create: {
        id: 'script-2',
        userId: demoUser.id,
        title: 'Morning Motivation',
        content: 'Good morning! Today we are going to talk about...',
        niche: 'lifestyle',
        tags: ['motivation', 'morning', 'success'],
      },
    }),
  ])
  console.log('✅ Created', scripts.length, 'scripts')

  console.log('🎉 Database seeded successfully!')
  console.log('')
  console.log('Demo accounts:')
  console.log('  Admin: admin@autotube.app / admin123')
  console.log('  User:  demo@autotube.app / demo123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
