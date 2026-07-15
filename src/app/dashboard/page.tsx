'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { cn, formatDate, formatBytes, niches } from '@/lib/utils'
import { Icons } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

interface DashboardStats {
  totalVideos: number
  totalScripts: number
  totalVoices: number
  storageUsed: number
  videosThisMonth: number
  credits: { used: number; total: number }
  recentVideos: Array<{
    id: string
    title: string
    status: string
    thumbnailUrl?: string
    createdAt: string
  }>
  scheduledVideos: Array<{
    id: string
    title: string
    scheduledFor: string
    channel: string
  }>
  apiStatus: Array<{
    provider: string
    connected: boolean
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulated data for demo
    setTimeout(() => {
      setStats({
        totalVideos: 24,
        totalScripts: 156,
        totalVoices: 89,
        storageUsed: 2.5 * 1024 * 1024 * 1024, // 2.5 GB
        videosThisMonth: 8,
        credits: { used: 45, total: 100 },
        recentVideos: [
          { id: '1', title: 'The Future of AI in 2025', status: 'COMPLETED', thumbnailUrl: '', createdAt: '2024-01-15' },
          { id: '2', title: 'Top 10 Tech Gadgets Review', status: 'RENDERING', thumbnailUrl: '', createdAt: '2024-01-14' },
          { id: '3', title: 'How to Build a Startup', status: 'DRAFT', thumbnailUrl: '', createdAt: '2024-01-13' },
          { id: '4', title: 'Healthy Living Tips', status: 'COMPLETED', thumbnailUrl: '', createdAt: '2024-01-12' },
        ],
        scheduledVideos: [
          { id: '1', title: 'Morning Motivation', scheduledFor: '2024-01-20 09:00', channel: 'Tech Channel' },
          { id: '2', title: 'Weekly News Roundup', scheduledFor: '2024-01-21 18:00', channel: 'News Hub' },
        ],
        apiStatus: [
          { provider: 'OpenAI', connected: true },
          { provider: 'ElevenLabs', connected: true },
          { provider: 'Stability AI', connected: false },
          { provider: 'Replicate', connected: true },
        ],
      })
      setLoading(false)
    }, 500)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here's your overview.</p>
          </div>
          <Link href="/video-editor">
            <Button size="lg" className="gap-2">
              <Icons.plus className="h-5 w-5" />
              Create Video
            </Button>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Videos"
            value={stats?.totalVideos || 0}
            subtitle={`${stats?.videosThisMonth || 0} this month`}
            icon="video"
            trend={{ value: 12, positive: true }}
          />
          <StatCard
            title="Scripts Generated"
            value={stats?.totalScripts || 0}
            subtitle="All time"
            icon="file"
            trend={{ value: 8, positive: true }}
          />
          <StatCard
            title="Voiceovers"
            value={stats?.totalVoices || 0}
            subtitle="Created"
            icon="mic"
          />
          <StatCard
            title="Storage Used"
            value={formatBytes(stats?.storageUsed || 0)}
            subtitle="Of unlimited"
            icon="storage"
          />
        </motion.div>

        {/* Credits Usage */}
        <motion.div variants={itemVariants}>
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icons.credit className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Credits Usage</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats?.credits.used} of {stats?.credits.total} used
                  </p>
                </div>
              </div>
              <Link href="/settings">
                <Button variant="outline" size="sm">
                  Manage Credits
                </Button>
              </Link>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${(stats?.credits.used || 0) / (stats?.credits.total || 100) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Videos */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Recent Videos</h3>
              <Link href="/content-library" className="text-primary text-sm hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {stats?.recentVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="w-20 h-12 rounded bg-muted flex-shrink-0 flex items-center justify-center">
                    {video.thumbnailUrl ? (
                      <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover rounded" />
                    ) : (
                      <Icons.video className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{video.title}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(video.createdAt)}</p>
                  </div>
                  <StatusBadge status={video.status} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Scheduled Videos */}
          <motion.div variants={itemVariants} className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Scheduled</h3>
              <Link href="/scheduler" className="text-primary text-sm hover:underline">
                Manage
              </Link>
            </div>
            <div className="space-y-4">
              {stats?.scheduledVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <p className="font-medium truncate">{video.title}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Icons.clock className="h-4 w-4" />
                    <span>{video.scheduledFor}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{video.channel}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* API Status */}
        <motion.div variants={itemVariants} className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">API Status</h3>
            <Link href="/settings">
              <Button variant="outline" size="sm">
                Configure APIs
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats?.apiStatus.map((api) => (
              <div
                key={api.provider}
                className={cn(
                  'p-4 rounded-lg border',
                  api.connected
                    ? 'border-green-500/20 bg-green-500/5'
                    : 'border-yellow-500/20 bg-yellow-500/5'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      api.connected ? 'bg-green-500' : 'bg-yellow-500'
                    )}
                  />
                  <span className="font-medium">{api.provider}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {api.connected ? 'Connected' : 'Not configured'}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'New Video', icon: 'video', href: '/video-editor', color: 'text-blue-500' },
              { name: 'Browse Scripts', icon: 'library', href: '/content-library', color: 'text-purple-500' },
              { name: 'Schedule Post', icon: 'calendar', href: '/scheduler', color: 'text-green-500' },
              { name: 'View Analytics', icon: 'chart', href: '/analytics', color: 'text-orange-500' },
            ].map((action) => (
              <Link key={action.name} href={action.href}>
                <div className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 transition-all cursor-pointer group">
                  <div className={cn('mb-3', action.color)}>
                    {Icons[action.icon as keyof typeof Icons] && 
                      React.createElement(Icons[action.icon as keyof typeof Icons] as React.ComponentType<{className?: string}> , { className: 'h-6 w-6' })
                    }
                  </div>
                  <p className="font-medium group-hover:text-primary transition-colors">{action.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
}: {
  title: string
  value: string | number
  subtitle: string
  icon: string
  trend?: { value: number; positive: boolean }
}) {
  const Icon = Icons[icon as keyof typeof Icons] || Icons.square

  return (
    <div className="bg-card rounded-xl p-6 border border-border card-hover">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trend.positive ? 'text-green-500' : 'text-red-500'
            )}
          >
            <Icons.trendingUp className="h-3 w-3" />
            {trend.value}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    COMPLETED: { label: 'Completed', className: 'badge-success' },
    RENDERING: { label: 'Rendering', className: 'badge-info' },
    DRAFT: { label: 'Draft', className: 'badge-warning' },
    FAILED: { label: 'Failed', className: 'badge-error' },
    SCHEDULED: { label: 'Scheduled', className: 'badge-info' },
  }

  const { label, className } = config[status] || { label: status, className: 'badge-info' }

  return <span className={cn('badge', className)}>{label}</span>
}

// Need to import React for JSX
import React from 'react'
