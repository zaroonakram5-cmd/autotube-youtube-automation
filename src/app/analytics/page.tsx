'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn, formatBytes, formatDate } from '@/lib/utils'
import { Icons } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

type TimeRange = '7d' | '30d' | '90d' | 'all'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')

  const stats = {
    videosCreated: 24,
    videosCreatedChange: 12,
    videosRendered: 18,
    videosRenderedChange: 8,
    apiCalls: 1247,
    apiCallsChange: -5,
    storageUsed: 2.5 * 1024 * 1024 * 1024, // 2.5 GB
    storageChange: 15,
  }

  const apiUsage = [
    { name: 'OpenAI', calls: 450, color: 'bg-green-500' },
    { name: 'ElevenLabs', calls: 320, color: 'bg-pink-500' },
    { name: 'Stability AI', calls: 180, color: 'bg-cyan-500' },
    { name: 'Replicate', calls: 150, color: 'bg-yellow-500' },
    { name: 'Other', calls: 147, color: 'bg-gray-500' },
  ]

  const renderHistory = [
    { id: '1', title: 'AI Trends 2025', duration: 180, resolution: '1080p', renderedAt: '2024-01-15 14:30', status: 'SUCCESS' },
    { id: '2', title: 'Tech Review', duration: 240, resolution: '1080p', renderedAt: '2024-01-14 10:15', status: 'SUCCESS' },
    { id: '3', title: 'Morning Motivation', duration: 120, resolution: '720p', renderedAt: '2024-01-13 16:45', status: 'SUCCESS' },
    { id: '4', title: 'Startup Guide', duration: 300, resolution: '1080p', renderedAt: '2024-01-12 09:00', status: 'FAILED' },
    { id: '5', title: 'Fitness Tips', duration: 150, resolution: '1080p', renderedAt: '2024-01-11 11:30', status: 'SUCCESS' },
  ]

  const timeRanges = [
    { id: '7d' as TimeRange, label: '7 Days' },
    { id: '30d' as TimeRange, label: '30 Days' },
    { id: '90d' as TimeRange, label: '90 Days' },
    { id: 'all' as TimeRange, label: 'All Time' },
  ]

  const totalApiCalls = apiUsage.reduce((sum, api) => sum + api.calls, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-1">Track your usage and performance</p>
          </div>
          <div className="flex items-center gap-2">
            {timeRanges.map((range) => (
              <Button
                key={range.id}
                variant={timeRange === range.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range.id)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard
            title="Videos Created"
            value={stats.videosCreated}
            change={stats.videosCreatedChange}
            icon="video"
          />
          <StatCard
            title="Videos Rendered"
            value={stats.videosRendered}
            change={stats.videosRenderedChange}
            icon="play"
          />
          <StatCard
            title="API Calls"
            value={stats.apiCalls.toLocaleString()}
            change={stats.apiCallsChange}
            icon="activity"
            invertTrend
          />
          <StatCard
            title="Storage Used"
            value={formatBytes(stats.storageUsed)}
            change={stats.storageChange}
            icon="storage"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* API Usage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-card rounded-xl p-6 border border-border"
          >
            <h2 className="text-lg font-semibold mb-6">API Usage Breakdown</h2>
            
            <div className="space-y-4">
              {apiUsage.map((api) => (
                <div key={api.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{api.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {api.calls.toLocaleString()} calls ({((api.calls / totalApiCalls) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', api.color)}
                      style={{ width: `${(api.calls / totalApiCalls) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{totalApiCalls.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total API Calls</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-sm text-muted-foreground">Active APIs</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">$12.45</p>
                  <p className="text-sm text-muted-foreground">Est. Cost</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <h2 className="text-lg font-semibold mb-6">Quick Stats</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span className="font-medium">94%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '94%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Avg. Render Time</span>
                  <span className="font-medium">2m 34s</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Credits Remaining</span>
                  <span className="font-medium">55</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '55%' }} />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Most Used Niche</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl">💻</span>
                  <span className="font-medium">Technology</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Render History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Render History</h2>
            <Button variant="outline" size="sm">
              <Icons.download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Video</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Duration</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Resolution</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rendered</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {renderHistory.map((video) => (
                  <tr key={video.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 rounded bg-muted flex items-center justify-center">
                          <Icons.video className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{video.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{video.resolution}</td>
                    <td className="py-3 px-4 text-muted-foreground">{formatDate(video.renderedAt)}</td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        'badge',
                        video.status === 'SUCCESS' ? 'badge-success' : 'badge-error'
                      )}>
                        {video.status === 'SUCCESS' ? (
                          <Icons.check className="h-3 w-3 mr-1" />
                        ) : (
                          <Icons.x className="h-3 w-3 mr-1" />
                        )}
                        {video.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({
  title,
  value,
  change,
  icon,
  invertTrend = false,
}: {
  title: string
  value: string | number
  change: number
  icon: string
  invertTrend?: boolean
}) {
  const Icon = Icons[icon as keyof typeof Icons] || Icons.square
  const isPositive = invertTrend ? change < 0 : change > 0

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className={cn(
          'flex items-center gap-1 text-sm font-medium',
          isPositive ? 'text-green-500' : 'text-red-500'
        )}>
          {isPositive ? <Icons.trendingUp className="h-4 w-4" /> : <Icons.trendingUp className="h-4 w-4 rotate-180" />}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </div>
  )
}
