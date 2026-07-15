'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn, formatDateTime } from '@/lib/utils'
import { Icons } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

interface ScheduledVideo {
  id: string
  title: string
  channel: string
  scheduledFor: Date
  status: 'PENDING' | 'PROCESSING' | 'PUBLISHED' | 'FAILED'
}

export default function SchedulerPage() {
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const scheduledVideos: ScheduledVideo[] = [
    { id: '1', title: 'Morning Motivation', channel: 'Tech Channel', scheduledFor: new Date('2024-01-20T09:00'), status: 'PENDING' },
    { id: '2', title: 'Weekly News Roundup', channel: 'News Hub', scheduledFor: new Date('2024-01-21T18:00'), status: 'PENDING' },
    { id: '3', title: 'Tech Tips Tuesday', channel: 'Tech Channel', scheduledFor: new Date('2024-01-23T12:00'), status: 'PENDING' },
    { id: '4', title: 'Weekend Vibes', channel: 'Lifestyle Channel', scheduledFor: new Date('2024-01-27T10:00'), status: 'PENDING' },
  ]

  const channels = [
    { id: '1', name: 'Tech Channel', subscribers: '50K' },
    { id: '2', name: 'News Hub', subscribers: '25K' },
    { id: '3', name: 'Lifestyle Channel', subscribers: '100K' },
  ]

  // Group videos by date
  const getVideosByDate = (date: Date) => {
    return scheduledVideos.filter(v => 
      v.scheduledFor.toDateString() === date.toDateString()
    )
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    
    // Add padding for days before first day of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }
    
    // Add all days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const days = getDaysInMonth(selectedDate)
  const today = new Date()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Video Scheduler</h1>
            <p className="text-muted-foreground mt-1">Schedule and manage your video uploads</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Icons.plus className="mr-2 h-4 w-4" />
            Schedule Video
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-card rounded-xl p-6 border border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}
                >
                  <Icons.chevronRight className="h-4 w-4 rotate-180" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
                >
                  <Icons.chevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
              {days.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="h-12" />
                }
                const isToday = day.toDateString() === today.toDateString()
                const isSelected = day.toDateString() === selectedDate.toDateString()
                const hasVideos = getVideosByDate(day).length > 0

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'h-12 rounded-lg transition-all relative',
                      isToday && 'bg-primary/10',
                      isSelected && 'bg-primary text-primary-foreground',
                      !isSelected && 'hover:bg-accent'
                    )}
                  >
                    <span className={cn(isToday && !isSelected && 'text-primary font-bold')}>
                      {day.getDate()}
                    </span>
                    {hasVideos && !isSelected && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Scheduled for selected date */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <h2 className="text-lg font-semibold mb-4">
              {selectedDate.toDateString() === today.toDateString()
                ? 'Today'
                : selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </h2>
            
            <div className="space-y-3">
              {getVideosByDate(selectedDate).length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">
                  No videos scheduled for this day
                </p>
              ) : (
                getVideosByDate(selectedDate).map((video) => (
                  <div
                    key={video.id}
                    className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <p className="font-medium text-sm">{video.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {video.scheduledFor.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-muted-foreground">{video.channel}</p>
                  </div>
                ))
              )}
            </div>

            {/* Queue Summary */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="font-medium mb-3">Queue Summary</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-medium">{scheduledVideos.filter(v => v.status === 'PENDING').length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">This Week</span>
                  <span className="font-medium">
                    {scheduledVideos.filter(v => {
                      const weekFromNow = new Date()
                      weekFromNow.setDate(weekFromNow.getDate() + 7)
                      return v.scheduledFor <= weekFromNow && v.scheduledFor >= today
                    }).length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">This Month</span>
                  <span className="font-medium">{scheduledVideos.length}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* All Scheduled Videos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <h2 className="text-lg font-semibold mb-4">All Scheduled Videos</h2>
          <div className="space-y-3">
            {scheduledVideos.map((video) => (
              <div
                key={video.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="w-16 h-10 rounded bg-muted flex items-center justify-center">
                  <Icons.video className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{video.title}</p>
                  <p className="text-sm text-muted-foreground">{video.channel}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatDateTime(video.scheduledFor)}</p>
                  <span className={cn(
                    'badge',
                    video.status === 'PENDING' ? 'badge-warning' : 'badge-info'
                  )}>
                    {video.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Icons.edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Icons.trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Schedule Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-xl p-6 w-full max-w-md border border-border"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Schedule Video</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                  <Icons.xClose className="h-5 w-5" />
                </Button>
              </div>

              <form className="space-y-4">
                <div className="space-y-2">
                  <Label>Video</Label>
                  <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                    <option>Select a video</option>
                    <option>The Future of AI in 2025</option>
                    <option>Top 10 Tech Gadgets</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Channel</Label>
                  <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                    {channels.map((channel) => (
                      <option key={channel.id} value={channel.id}>
                        {channel.name} ({channel.subscribers})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input type="time" />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1">Schedule</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
