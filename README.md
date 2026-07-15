# AutoTube - AI-Powered YouTube Automation Platform

A comprehensive full-stack web application for creating, editing, and scheduling AI-powered YouTube videos. Built with Next.js 14, React, TypeScript, and Tailwind CSS.

![AutoTube Dashboard](https://via.placeholder.com/800x400?text=AutoTube+Dashboard)

## ✨ Features

### 🎬 Video Creation
- **Gemini AI Script Generation**: Powered by Google Gemini for intelligent, engaging video scripts
- **Smart Title & Description**: AI creates SEO-optimized titles, descriptions, tags, and hashtags
- **Custom Topics**: Enter any topic for AI to generate relevant content

### 🎙️ Voice Synthesis
- **Edge TTS (Free)**: High-quality Microsoft Edge text-to-speech, no API key required
- **ElevenLabs Integration**: Premium AI voices with realistic emotional range
- **Voice Controls**: Adjustable speed and pitch for perfect delivery
- **Multiple Languages**: Support for English, German, French, Spanish, and more

### 🎨 AI Image Generation
- **Stable Diffusion**: High-quality image generation via Stability AI
- **Flux Models**: State-of-the-art image generation via Replicate
- **DALL-E 3**: OpenAI's latest image generation model
- **Custom Prompts**: Auto-generated image prompts from your script content

### 📝 Captions & Subtitles
- **Automatic Transcription**: Convert voiceovers to text automatically
- **Multiple Styles**: Choose from various subtitle styling options
- **Custom Fonts**: Select fonts that match your brand
- **Colors & Effects**: Customize colors, stroke, and shadows

### 🎞️ Video Editor
- **Timeline Preview**: Visual timeline for arranging scenes
- **Background Music**: Add background music tracks
- **Intro/Outro**: Add branded intro and outro clips
- **Transitions**: Smooth transitions between scenes
- **Progress Bar**: Real-time render progress tracking

### 📊 Analytics & Dashboard
- **Usage Statistics**: Track videos created, API calls, and storage usage
- **API Status**: Monitor connected API services
- **Credits System**: Track credit usage across features
- **Render History**: Complete history of rendered videos

### 📅 Scheduler
- **Calendar View**: Visual calendar for planning uploads
- **Multiple Channels**: Schedule videos for different YouTube channels
- **Queue Management**: Manage your video upload queue
- **Time Zone Support**: Schedule for optimal upload times

### 🔐 Security & Authentication
- **Email/Password Auth**: Simple and secure authentication
- **Admin Dashboard**: Admin controls for user management
- **Encrypted API Keys**: Secure storage of your API credentials
- **Role-Based Access**: User and admin roles

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **React 18**: UI library with hooks
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations
- **Radix UI**: Accessible UI components

### Backend
- **Next.js API Routes**: Server-side API endpoints
- **Prisma ORM**: Type-safe database access
- **PostgreSQL**: Primary database
- **Redis**: Caching and job queues

### External Services
- **Google Gemini**: Primary AI for script generation (gemini-2.0-flash with fallback to 1.5-flash)
- **ElevenLabs**: Premium voice synthesis
- **Stability AI**: Image generation
- **Replicate**: ML model hosting (Flux, etc.)
- **Edge TTS**: Free text-to-speech

## 📦 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 15+ (or Docker)
- Redis 7+ (or Docker)
- FFmpeg (for video rendering)

### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/yourusername/autotube.git
cd autotube

# Start all services
docker-compose up -d

# Initialize the database
docker-compose exec app npx prisma db push
docker-compose exec app npx prisma db seed

# Open the app
open http://localhost:3000
```

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/autotube.git
cd autotube

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
# DATABASE_URL=postgresql://user:password@localhost:5432/autotube
# REDIS_URL=redis://localhost:6379
# JWT_SECRET=your-secure-random-string

# Setup the database
npx prisma generate
npx prisma db push
npx prisma db seed

# Start the development server
npm run dev
```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/autotube?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# FFmpeg Path (optional, for video rendering)
FFMPEG_PATH="/usr/bin/ffmpeg"

# Storage (local path or S3 compatible)
STORAGE_PATH="./storage"
```

## 🔑 API Configuration

After installation, configure your API keys in the Settings page:

1. **Google Gemini** (Required for script generation)
   - Get API key at: https://makersuite.google.com/app/apikey
   - Uses Gemini 2.0 Flash (primary) with fallback to Gemini 1.5 Flash

2. **ElevenLabs** - Premium voice synthesis
   - Get API key at: https://elevenlabs.io/speech-synthesis

3. **Stability AI** - Image generation
   - Get API key at: https://platform.stability.ai/api-keys

4. **Replicate** - ML models (Flux, etc.)
   - Get API key at: https://replicate.com/account/api-tokens

5. **Edge TTS** - Free text-to-speech (no API key required)

## 📁 Project Structure

```
autotube/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication
│   │   │   ├── videos/         # Video operations
│   │   │   ├── settings/       # Settings & API keys
│   │   │   └── ...
│   │   ├── dashboard/         # Dashboard page
│   │   ├── video-editor/      # Video editor page
│   │   ├── content-library/   # Content library page
│   │   ├── scheduler/         # Video scheduler page
│   │   ├── analytics/         # Analytics page
│   │   ├── settings/          # Settings page
│   │   ├── admin/             # Admin dashboard
│   │   └── ...
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components
│   │   ├── layout/           # Layout components
│   │   └── ...
│   ├── lib/                   # Utility functions
│   │   ├── auth.ts           # Authentication utilities
│   │   ├── prisma.ts         # Database client
│   │   ├── ai-services.ts    # AI API integrations
│   │   ├── voice-services.ts # TTS integrations
│   │   ├── image-services.ts # Image generation
│   │   ├── render-service.ts # Video rendering
│   │   └── utils.ts          # General utilities
│   └── types/                # TypeScript types
├── prisma/
│   └── schema.prisma         # Database schema
├── public/                    # Static assets
├── docker-compose.yml         # Docker services
├── Dockerfile                 # Container build
└── ...
```

## 🔌 API Documentation

### Authentication

```
POST /api/auth/register - Create new account
POST /api/auth/login - Login to account
POST /api/auth/logout - Logout
GET /api/auth/me - Get current user
```

### Videos

```
GET /api/videos - List user videos
POST /api/videos - Create new video
GET /api/videos/:id - Get video details
PATCH /api/videos/:id - Update video
DELETE /api/videos/:id - Delete video
POST /api/videos/generate - Generate video content
```

### Settings

```
GET /api/settings/api-keys - List configured API keys
POST /api/settings/api-keys - Save API key
DELETE /api/settings/api-keys - Delete API key
```

### Scripts

```
GET /api/scripts - List user scripts
POST /api/scripts - Save script
```

### Channels

```
GET /api/channels - List user channels
POST /api/channels - Create channel
```

### Scheduler

```
GET /api/schedule - List scheduled videos
POST /api/schedule - Schedule a video
DELETE /api/schedule/:id - Remove from schedule
```

## 🎨 UI Components

The application includes a comprehensive set of UI components:

- **Buttons**: Primary, secondary, outline, ghost, destructive variants
- **Inputs**: Text, email, password, search with icons
- **Cards**: Stat cards, content cards with hover effects
- **Badges**: Status indicators (success, warning, error, info)
- **Modals**: Dialog overlays with animations
- **Tables**: Responsive data tables
- **Progress**: Progress bars and loading states
- **Navigation**: Sidebar with active indicators

## 🔒 Security

- Passwords are hashed using bcrypt with 12 salt rounds
- JWT tokens expire after 7 days
- API keys are encrypted at rest
- HTTP-only cookies prevent XSS attacks
- CORS configured for production deployments
- Input validation on all endpoints

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Docker

```bash
# Build image
docker build -t autotube .

# Run container
docker run -p 3000:3000 autotube
```

### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

## 📈 Performance

- Server-side rendering for fast initial load
- Image optimization with Next.js Image
- Code splitting and lazy loading
- Redis caching for API responses
- Database indexing for fast queries
- CDN-ready static assets

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Prisma](https://prisma.io/) - Database ORM
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Lucide](https://lucide.dev/) - Icons
- [Radix UI](https://radix-ui.com/) - UI primitives

---

Built with ❤️ for content creators everywhere.
