'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Icons } from '@/components/ui/icons'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Auto-redirect to dashboard
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <Icons.video className="w-16 h-16 mx-auto text-primary mb-4 animate-pulse" />
        <h1 className="text-2xl font-bold gradient-text mb-2">AutoTube</h1>
        <p className="text-muted-foreground">Loading...</p>
      </motion.div>
    </div>
  )
}
