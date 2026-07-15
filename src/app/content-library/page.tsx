'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { cn, formatDate, formatDuration } from '@/lib/utils'
import { Icons } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

type Tab = 'videos' | 'scripts' | 'voices' | 'thumbnails'

interface LibraryItem {
  id: string
  title?: string | null
  name?: string | null
  thumbnailUrl?: string | null
  duration?: number | null
  status?: string
  createdAt: string | Date
  videoUrl?: string | null
  resolution?: string | null
  script?: string | null
  content?: string | null
  niche?: string | null
  provider?: string | null
  imageUrl?: string | null
  template?: string | null
}

export default function ContentLibraryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('videos')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [previewVideo, setPreviewVideo] = useState<LibraryItem | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [videos, setVideos] = useState<LibraryItem[]>([])
  const [scripts, setScripts] = useState<LibraryItem[]>([])
  const [voices, setVoices] = useState<LibraryItem[]>([])
  const [thumbnails, setThumbnails] = useState<LibraryItem[]>([])

  useEffect(() => {
    fetchLibrary()
  }, [])

  const fetchLibrary = async () => {
    try {
      const res = await fetch('/api/library')
      const data = await res.json()
      if (res.ok) {
        setVideos(data.videos || [])
        setScripts(data.scripts || [])
        setVoices(data.voices || [])
        setThumbnails(data.thumbnails || [])
      }
    } catch (error) {
      console.error('Failed to fetch library:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'videos' as Tab, label: 'Videos', icon: 'video', count: videos.length },
    { id: 'scripts' as Tab, label: 'Scripts', icon: 'file', count: scripts.length },
    { id: 'voices' as Tab, label: 'Voices', icon: 'mic', count: voices.length },
    { id: 'thumbnails' as Tab, label: 'Thumbnails', icon: 'image', count: thumbnails.length },
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Content Library</h1>
            <p className="text-muted-foreground mt-1">Manage all your generated content</p>
          </div>
          <Link href="/video-editor">
            <Button>
              <Icons.plus className="mr-2 h-4 w-4" />
              New Video
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-border overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = Icons[tab.icon as keyof typeof Icons] || Icons.square
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                <span className="bg-muted px-2 py-0.5 rounded-full text-xs">{tab.count}</span>
              </button>
            )
          })}
        </div>

        {/* Search and View */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-1 border border-border rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded transition-colors',
                viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              )}
            >
              <Icons.grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded transition-colors',
                viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              )}
            >
              <Icons.list className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Empty State */}
        {activeTab === 'videos' && videos.length === 0 && (
          <div className="text-center py-12">
            <Icons.video className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No videos yet</h3>
            <p className="text-muted-foreground mb-4">Create your first AI-generated video</p>
            <Link href="/video-editor">
              <Button>Create Video</Button>
            </Link>
          </div>
        )}

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            viewMode === 'grid' ? 'video-grid' : 'space-y-3'
          )}
        >
          {activeTab === 'videos' && videos.map((video) => (
            <VideoCard 
              key={video.id} 
              video={video} 
              viewMode={viewMode}
              onPreview={setPreviewVideo}
              onDownload={handleDownload}
            />
          ))}
          {activeTab === 'scripts' && scripts.map((script) => (
            <ScriptCard key={script.id} script={script} viewMode={viewMode} />
          ))}
          {activeTab === 'voices' && voices.map((voice) => (
            <VoiceCard key={voice.id} voice={voice} viewMode={viewMode} />
          ))}
          {activeTab === 'thumbnails' && thumbnails.map((thumb) => (
            <ThumbnailCard key={thumb.id} thumbnail={thumb} viewMode={viewMode} />
          ))}
        </motion.div>

        {/* Video Preview Modal */}
        {previewVideo && (
          <VideoPreviewModal 
            video={previewVideo} 
            onClose={() => setPreviewVideo(null)} 
            onDownload={() => handleDownload(previewVideo)}
          />
        )}
      </div>
    </DashboardLayout>
  )

  function handleDownload(video: LibraryItem) {
    if (video.videoUrl) {
      window.open(video.videoUrl, '_blank')
    }
  }
}

function VideoCard({ video, viewMode, onPreview, onDownload }: { 
  video: LibraryItem; 
  viewMode: 'grid' | 'list'
  onPreview: (video: LibraryItem) => void
  onDownload: (video: LibraryItem) => void
}) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    COMPLETED: { label: 'Completed', className: 'badge-success' },
    DRAFT: { label: 'Draft', className: 'badge-warning' },
    SCHEDULED: { label: 'Scheduled', className: 'badge-info' },
    RENDERING: { label: 'Rendering', className: 'badge-info' },
    GENERATING: { label: 'Generating', className: 'badge-info' },
  }

  const isPlayable = video.status === 'COMPLETED' && video.duration

  if (viewMode === 'list') {
    return (
      <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-4 hover:border-primary/50 transition-colors">
        <button
          onClick={() => isPlayable && onPreview(video)}
          disabled={!isPlayable}
          className={cn(
            'w-24 h-14 rounded bg-muted flex-shrink-0 flex items-center justify-center',
            isPlayable && 'cursor-pointer hover:bg-muted/80'
          )}
        >
          {isPlayable ? (
            <Icons.playCircle className="h-8 w-8 text-primary" />
          ) : (
            <Icons.video className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{video.title}</p>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-muted-foreground">{formatDate(video.createdAt)}</p>
            {video.duration && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Icons.clock className="h-3 w-3" />
                {formatDuration(video.duration)}
              </span>
            )}
          </div>
        </div>
        <span className={cn('badge', statusConfig[video.status || '']?.className || 'badge-info')}>
          {statusConfig[video.status || '']?.label || 'Unknown'}
        </span>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => isPlayable && onPreview(video)}
            disabled={!isPlayable}
            title="Preview"
          >
            {isPlayable ? <Icons.play className="h-4 w-4" /> : <Icons.clock className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => isPlayable && onDownload(video)}
            disabled={!isPlayable}
            title="Download"
          >
            <Icons.download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Delete">
            <Icons.trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors group">
      <button
        onClick={() => isPlayable && onPreview(video)}
        disabled={!isPlayable}
        className="w-full aspect-video bg-muted flex items-center justify-center relative"
      >
        {isPlayable ? (
          <>
            <Icons.playCircle className="h-16 w-16 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <Icons.video className="h-10 w-10 text-muted-foreground absolute" />
          </>
        ) : (
          <div className="text-center">
            <Icons.clock className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">
              {video.status === 'RENDERING' || video.status === 'GENERATING' 
                ? 'Processing...' 
                : 'Not ready'}
            </p>
          </div>
        )}
        {video.duration && isPlayable && (
          <span className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-xs">
            {formatDuration(video.duration)}
          </span>
        )}
        {isPlayable && (
          <span className="absolute top-2 right-2 bg-primary px-2 py-0.5 rounded text-xs text-primary-foreground">
            HD
          </span>
        )}
      </button>
      <div className="p-4">
        <p className="font-medium truncate mb-2">{video.title}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{formatDate(video.createdAt)}</span>
          <span className={cn('badge', statusConfig[video.status || '']?.className || 'badge-info')}>
            {statusConfig[video.status || '']?.label || 'Unknown'}
          </span>
        </div>
        {isPlayable && (
          <div className="flex items-center gap-2 mt-3">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => onPreview(video)}
            >
              <Icons.play className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onDownload(video)}
            >
              <Icons.download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function ScriptCard({ script, viewMode }: { script: { id: string; title?: string | null; content?: string | null; niche?: string | null; createdAt: string | Date }; viewMode: 'grid' | 'list' }) {
  if (viewMode === 'list') {
    return (
      <div className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{script.title || 'Untitled'}</p>
            <p className="text-sm text-muted-foreground mt-1">{script.content?.substring(0, 100) || ''}...</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs bg-muted px-2 py-1 rounded">{script.niche || 'General'}</span>
              <span className="text-xs text-muted-foreground">{formatDate(script.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button variant="ghost" size="icon">
              <Icons.edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Icons.copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-medium">{script.title || 'Untitled'}</p>
          <span className="text-xs bg-muted px-2 py-1 rounded mt-1 inline-block">{script.niche || 'General'}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-3">{script.content || ''}</p>
      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-muted-foreground">{formatDate(script.createdAt)}</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon">
            <Icons.edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Icons.copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function VoiceCard({ voice, viewMode }: { voice: { id: string; name?: string | null; provider?: string | null; duration?: number | null; createdAt: string | Date }; viewMode: 'grid' | 'list' }) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Icons.mic className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{voice.name}</p>
          <p className="text-sm text-muted-foreground">{voice.provider}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {voice.duration ? `${Math.floor(voice.duration / 60)}:${(voice.duration % 60).toString().padStart(2, '0')}` : '0:00'}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Icons.play className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Icons.download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function ThumbnailCard({ thumbnail, viewMode }: { thumbnail: { id: string; title?: string | null; template?: string | null; createdAt: string | Date }; viewMode: 'grid' | 'list' }) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors">
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-900/20 flex items-center justify-center">
        <Icons.image className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="p-4">
        <p className="font-medium truncate mb-2">{thumbnail.title}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{thumbnail.template}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon">
              <Icons.edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Icons.download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface VideoPreviewModalProps {
  video: LibraryItem
  onClose: () => void
  onDownload: () => void
}

function VideoPreviewModal({ video, onClose, onDownload }: VideoPreviewModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const duration = video.duration || 0

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    setProgress(percent * 100)
    setCurrentTime(percent * duration)
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-xl w-full max-w-4xl overflow-hidden border border-border"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="font-semibold">{video.title}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="badge badge-success">HD</span>
              <span>{video.resolution || '1080p'}</span>
              {video.duration && (
                <span>{formatTime(video.duration)}</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onDownload} size="sm">
              <Icons.download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icons.xClose className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Video Player */}
        <div className="aspect-video bg-black relative flex items-center justify-center">
          {isPlaying ? (
            <video
              src={`/api/videos/${video.id}/preview`}
              className="w-full h-full"
              autoPlay
              onEnded={() => setIsPlaying(false)}
              onTimeUpdate={(e) => {
                const videoEl = e.target as HTMLVideoElement
                setCurrentTime(videoEl.currentTime)
                setProgress((videoEl.currentTime / duration) * 100)
              }}
            />
          ) : (
            <div className="text-center">
              <button
                onClick={handlePlayPause}
                className="w-20 h-20 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Icons.play className="h-10 w-10 text-primary-foreground ml-1" />
              </button>
              <p className="text-white mt-4">Click to preview video</p>
            </div>
          )}
        </div>

        {/* Video Controls */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayPause}
              className="text-white"
            >
              {isPlaying ? (
                <Icons.pause className="h-5 w-5" />
              ) : (
                <Icons.play className="h-5 w-5" />
              )}
            </Button>

            {/* Progress Bar */}
            <div className="flex-1">
              <div
                className="h-1 bg-muted rounded-full cursor-pointer"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Time */}
            <span className="text-sm text-muted-foreground">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Volume (placeholder) */}
            <Button variant="ghost" size="icon" className="text-white">
              <Icons.volume className="h-5 w-5" />
            </Button>

            {/* Fullscreen (placeholder) */}
            <Button variant="ghost" size="icon" className="text-white">
              <Icons.maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
