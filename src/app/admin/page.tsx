'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn, formatDate, formatBytes } from '@/lib/utils'
import { Icons } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

interface AdminStats {
  totalUsers: number
  totalVideos: number
  totalApiCalls: number
  storageUsed: number
}

interface User {
  id: string
  email: string
  name: string | null
  role: string
  credits: number
  createdAt: string
  _count: {
    videos: number
  }
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'system'>('overview')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    // Simulated admin data
    setStats({
      totalUsers: 156,
      totalVideos: 1247,
      totalApiCalls: 45000,
      storageUsed: 25 * 1024 * 1024 * 1024,
    })
    setUsers([
      { id: '1', email: 'john@example.com', name: 'John Doe', role: 'USER', credits: 85, createdAt: '2024-01-01', _count: { videos: 24 } },
      { id: '2', email: 'jane@example.com', name: 'Jane Smith', role: 'USER', credits: 100, createdAt: '2024-01-05', _count: { videos: 18 } },
      { id: '3', email: 'admin@example.com', name: 'Admin', role: 'ADMIN', credits: 999, createdAt: '2023-12-01', _count: { videos: 156 } },
    ])
  }, [])

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: 'activity' },
    { id: 'users' as const, label: 'Users', icon: 'users' },
    { id: 'system' as const, label: 'System', icon: 'server' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage users, system, and analytics</p>
        </div>

        {/* Admin Notice */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icons.shield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-primary">Admin Access</p>
              <p className="text-sm text-muted-foreground mt-1">
                You have full administrative access to manage all users and system settings.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {tabs.map((tab) => {
            const Icon = Icons[tab.icon as keyof typeof Icons] || Icons.square
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Icons.users className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Icons.video className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalVideos}</p>
                    <p className="text-sm text-muted-foreground">Total Videos</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Icons.activity className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalApiCalls.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">API Calls</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Icons.storage className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatBytes(stats.storageUsed)}</p>
                    <p className="text-sm text-muted-foreground">Storage Used</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {[
                  { user: 'john@example.com', action: 'Generated new video', time: '2 minutes ago' },
                  { user: 'jane@example.com', action: 'Rendered video in 1080p', time: '5 minutes ago' },
                  { user: 'admin@example.com', action: 'Updated API settings', time: '15 minutes ago' },
                  { user: 'john@example.com', action: 'Created new script', time: '30 minutes ago' },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-sm">{activity.user}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">User Management</h2>
              <Button>
                <Icons.plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Credits</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Videos</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                            {user.name?.charAt(0) || user.email.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{user.name || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          'badge',
                          user.role === 'ADMIN' ? 'badge-info' : 'badge-success'
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">{user.credits}</td>
                      <td className="py-3 px-4 text-muted-foreground">{user._count.videos}</td>
                      <td className="py-3 px-4 text-muted-foreground">{formatDate(user.createdAt)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon">
                            <Icons.edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Icons.trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* System Status */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4">System Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Database', status: 'Operational', color: 'green' },
                  { name: 'Redis Cache', status: 'Operational', color: 'green' },
                  { name: 'API Server', status: 'Operational', color: 'green' },
                  { name: 'FFmpeg Worker', status: 'Operational', color: 'green' },
                  { name: 'File Storage', status: 'Operational', color: 'green' },
                  { name: 'Background Jobs', status: 'Operational', color: 'green' },
                ].map((service) => (
                  <div key={service.name} className="p-4 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{service.name}</span>
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        service.color === 'green' ? 'bg-green-500' : 'bg-red-500'
                      )} />
                    </div>
                    <p className="text-sm text-muted-foreground">{service.status}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Environment Variables */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4">Environment Configuration</h2>
              <div className="space-y-3">
                {[
                  { name: 'DATABASE_URL', value: 'postgresql://***' },
                  { name: 'REDIS_URL', value: 'redis://***' },
                  { name: 'JWT_SECRET', value: '*** (configured)' },
                  { name: 'NEXT_PUBLIC_APP_URL', value: 'http://localhost:3000' },
                ].map((env) => (
                  <div key={env.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <code className="text-sm bg-muted px-2 py-1 rounded">{env.name}</code>
                    <span className="text-sm text-muted-foreground">{env.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline">
                  <Icons.refresh className="mr-2 h-4 w-4" />
                  Clear Cache
                </Button>
                <Button variant="outline">
                  <Icons.database className="mr-2 h-4 w-4" />
                  Backup Database
                </Button>
                <Button variant="outline">
                  <Icons.storage className="mr-2 h-4 w-4" />
                  Cleanup Storage
                </Button>
                <Button variant="outline">
                  <Icons.file className="mr-2 h-4 w-4" />
                  View Logs
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}
