export interface User {
  id: string
  email: string
  name?: string | null
  role: 'USER' | 'ADMIN'
  credits: number
  createdAt: Date
}

export interface Video {
  id: string
  userId: string
  title: string
  script?: string | null
  description?: string | null
  tags: string[]
  hashtags: string[]
  niche?: string | null
  topic?: string | null
  status: VideoStatus
  videoUrl?: string | null
  thumbnailUrl?: string | null
  duration?: number | null
  resolution?: string | null
  voiceoverUrl?: string | null
  captionsUrl?: string | null
  renderedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  scheduledFor?: Date | null
  channelId?: string | null
}

export type VideoStatus = 'DRAFT' | 'GENERATING' | 'RENDERING' | 'COMPLETED' | 'FAILED' | 'SCHEDULED'

export interface Script {
  id: string
  userId: string
  title: string
  content: string
  niche?: string | null
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Voice {
  id: string
  userId: string
  name: string
  provider: 'EDGE_TTS' | 'ELEVENLABS'
  voiceId?: string | null
  speed: number
  pitch: number
  audioUrl?: string | null
  duration?: number | null
  createdAt: Date
}

export interface Thumbnail {
  id: string
  userId: string
  title: string
  imageUrl: string
  template?: string | null
  metadata?: Record<string, unknown> | null
  createdAt: Date
}

export interface Channel {
  id: string
  userId: string
  name: string
  description?: string | null
  thumbnailUrl?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Schedule {
  id: string
  channelId: string
  videoId?: string | null
  scheduledFor: Date
  status: 'PENDING' | 'PROCESSING' | 'PUBLISHED' | 'FAILED'
  publishedAt?: Date | null
  createdAt: Date
}

export interface ApiKey {
  id: string
  userId: string
  provider: string
  isActive: boolean
  createdAt: Date
}

export interface Analytics {
  id: string
  userId: string
  date: Date
  videosCreated: number
  videosRendered: number
  apiCalls?: Record<string, number>
  storageUsed: bigint
  creditsUsed: number
}

export interface DashboardStats {
  totalVideos: number
  totalScripts: number
  totalVoices: number
  totalStorage: number
  videosThisMonth: number
  apiStatus: ApiStatus[]
  creditsUsage: CreditsUsage
}

export interface ApiStatus {
  provider: string
  connected: boolean
  lastChecked: Date
}

export interface CreditsUsage {
  used: number
  total: number
  percentage: number
}

export interface VideoGenerationRequest {
  niche: string
  topic: string
  voiceProvider: 'EDGE_TTS' | 'ELEVENLABS'
  voiceId: string
  speed: number
  pitch: number
  imageProvider?: string
  resolution: '720p' | '1080p'
}

export interface GeneratedContent {
  title: string
  script: string
  description: string
  tags: string[]
  hashtags: string[]
}

export interface Frame {
  id: string
  videoId: string
  order: number
  type: 'image' | 'text' | 'transition'
  content?: string | null
  duration: number
  effects?: Record<string, unknown> | null
}

export interface AudioTrack {
  id: string
  videoId: string
  order: number
  type: 'voiceover' | 'background_music' | 'sfx'
  audioUrl: string
  volume: number
  startTime: number
  duration?: number | null
}

export interface CaptionStyle {
  id: string
  fontFamily: string
  fontSize: number
  color: string
  strokeColor: string
  strokeWidth: number
  shadowColor: string
  shadowBlur: number
  position: 'top' | 'center' | 'bottom'
  backgroundColor?: string
}

export interface ThumbnailTemplate {
  id: string
  name: string
  background: string
  textColor: string
}
