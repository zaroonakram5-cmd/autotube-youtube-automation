'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Icons } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'

interface NavItem {
  name: string
  href: string
  icon: string
  badge?: number
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: 'home' },
  { name: 'Video Creator', href: '/video-editor', icon: 'video' },
  { name: 'Content Library', href: '/content-library', icon: 'library' },
  { name: 'Scheduler', href: '/scheduler', icon: 'calendar' },
  { name: 'Analytics', href: '/analytics', icon: 'chart' },
  { name: 'Settings', href: '/settings', icon: 'settings' },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-border px-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
        >
          <Icons.menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Icons.video className="h-6 w-6 text-primary" />
          <span className="font-bold">AutoTube</span>
        </div>
        <Button variant="ghost" size="icon">
          <Icons.bell className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-card z-50"
            >
              <MobileSidebar
                items={navItems}
                currentPath={pathname}
                onClose={() => setMobileOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[280px] bg-card border-r border-border z-40 transition-all duration-300',
          !sidebarOpen && 'lg:w-[80px]'
        )}
      >
        <SidebarContent
          items={navItems}
          currentPath={pathname}
          collapsed={!sidebarOpen}
        />
      </aside>

      {/* Main content */}
      <main
        className={cn(
          'min-h-screen pt-16 lg:pt-0 transition-all duration-300',
          sidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-[80px]'
        )}
      >
        <div className="p-4 lg:p-8">{children}</div>
      </main>

      {/* Toggle sidebar button (desktop) */}
      <Button
        variant="outline"
        size="icon"
        className="hidden lg:flex fixed bottom-6 left-6 z-30 shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Icons.chevronRight
          className={cn(
            'h-4 w-4 transition-transform',
            sidebarOpen && 'rotate-180'
          )}
        />
      </Button>
    </div>
  )
}

function SidebarContent({
  items,
  currentPath,
  collapsed,
}: {
  items: NavItem[]
  currentPath: string
  collapsed: boolean
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icons.video className="h-6 w-6 text-primary" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-lg gradient-text"
            >
              AutoTube
            </motion.span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/')
          const Icon = Icons[item.icon as keyof typeof Icons] || Icons.square

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                collapsed && 'justify-center'
              )}
            >
              <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-primary')} />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium"
                >
                  {item.name}
                </motion.span>
              )}
              {!collapsed && item.badge && (
                <span className="ml-auto bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-border">
        <div
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent cursor-pointer transition-colors',
            collapsed && 'justify-center'
          )}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-medium">
            JD
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-w-0">
              <p className="font-medium truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">john@example.com</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

function MobileSidebar({
  items,
  currentPath,
  onClose,
}: {
  items: NavItem[]
  currentPath: string
  onClose: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Icons.video className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">AutoTube</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Icons.xClose className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {items.map((item) => {
          const isActive = currentPath === item.href
          const Icon = Icons[item.icon as keyof typeof Icons] || Icons.square

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <Link
          href="/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-accent"
        >
          <Icons.settings className="h-5 w-5" />
          <span className="font-medium">Settings</span>
        </Link>
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-accent mt-1"
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' })
            window.location.href = '/'
          }}
        >
          <Icons.logout className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}
