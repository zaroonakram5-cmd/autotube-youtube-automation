'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Icons } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

const apiProviders = [
  {
    id: 'xai',
    name: 'xAI Grok',
    description: 'Grok AI for script generation',
    icon: 'sparkles',
    color: 'text-orange-500',
    website: 'https://console.x.ai/',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4 for script generation',
    icon: 'sparkles',
    color: 'text-green-500',
    website: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Gemini Pro for content generation',
    icon: 'sparkles',
    color: 'text-blue-500',
    website: 'https://makersuite.google.com/app/apikey',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access multiple AI models',
    icon: 'globe',
    color: 'text-purple-500',
    website: 'https://openrouter.ai/keys',
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Fast LPU inference',
    icon: 'zap',
    color: 'text-yellow-500',
    website: 'https://console.groq.com/keys',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude for advanced tasks',
    icon: 'sparkles',
    color: 'text-red-500',
    website: 'https://console.anthropic.com/settings/keys',
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    description: 'Premium voice synthesis',
    icon: 'mic',
    color: 'text-pink-500',
    website: 'https://elevenlabs.io/speech-synthesis',
  },
  {
    id: 'stability',
    name: 'Stability AI',
    description: 'Stable Diffusion image generation',
    icon: 'image',
    color: 'text-cyan-500',
    website: 'https://platform.stability.ai/api-keys',
  },
  {
    id: 'replicate',
    name: 'Replicate',
    description: 'Flux and other image models',
    icon: 'box',
    color: 'text-yellow-500',
    website: 'https://replicate.com/account/api-tokens',
  },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'apis' | 'profile' | 'billing'>('apis')
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [connectedApis, setConnectedApis] = useState<string[]>([])

  // Fetch connected API keys on mount
  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const res = await fetch('/api/settings/api-keys')
        if (res.ok) {
          const data = await res.json()
          setConnectedApis(data.apiKeys?.filter((k: { isActive: boolean }) => k.isActive).map((k: { provider: string }) => k.provider) || [])
        }
      } catch (error) {
        console.error('Failed to fetch API keys')
      }
    }
    fetchApiKeys()
  }, [])

  const handleSaveApiKey = async (provider: string, key: string) => {
    if (!key.trim()) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, key }),
      })
      if (res.ok) {
        setConnectedApis((prev) => [...prev, provider])
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (error) {
      console.error('Failed to save API key')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'apis', label: 'API Keys', icon: 'key' },
    { id: 'profile', label: 'Profile', icon: 'user' },
    { id: 'billing', label: 'Billing', icon: 'credit' },
  ]

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and API configuration</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {tabs.map((tab) => {
            const Icon = Icons[tab.icon as keyof typeof Icons] || Icons.square
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
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

        {/* API Keys Tab */}
        {activeTab === 'apis' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icons.alert className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-primary">API Key Security</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your API keys are encrypted and stored securely. We never share your keys with third parties.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {apiProviders.map((provider, index) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl p-6 border border-border"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={cn('w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center', provider.color)}>
                        {Icons[provider.icon as keyof typeof Icons] && 
                          React.createElement(Icons[provider.icon as keyof typeof Icons] as React.ComponentType<{className?: string}> , { className: 'h-5 w-5' })
                        }
                      </div>
                      <div>
                        <h3 className="font-semibold">{provider.name}</h3>
                        <p className="text-sm text-muted-foreground">{provider.description}</p>
                      </div>
                    </div>
                    {connectedApis.includes(provider.id) && (
                      <span className="badge badge-success">Connected</span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Input
                        type={showKeys[provider.id] ? 'text' : 'password'}
                        placeholder={`Enter ${provider.name} API key`}
                        value={apiKeys[provider.id] || ''}
                        onChange={(e) => setApiKeys((prev) => ({ ...prev, [provider.id]: e.target.value }))}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys((prev) => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showKeys[provider.id] ? (
                          <Icons.eyeOff className="h-4 w-4" />
                        ) : (
                          <Icons.eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <Button
                      onClick={() => handleSaveApiKey(provider.id, apiKeys[provider.id] || '')}
                      disabled={!apiKeys[provider.id] || saving}
                    >
                      {saving ? (
                        <Icons.spinner className="animate-spin h-4 w-4" />
                      ) : saved ? (
                        <Icons.check className="h-4 w-4" />
                      ) : (
                        'Save'
                      )}
                    </Button>
                  </div>

                  <div className="mt-3">
                    <a
                      href={provider.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Get API Key
                      <Icons.external className="h-3 w-3" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Edge TTS Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-xl p-6 border border-border"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                    <Icons.mic className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Edge TTS</h3>
                    <p className="text-sm text-muted-foreground">Free Microsoft Edge text-to-speech</p>
                  </div>
                </div>
                <span className="badge badge-success">No API Required</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Edge TTS is completely free and doesn't require any API key. It's included by default and ready to use.
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <h3 className="font-semibold mb-6">Profile Information</h3>
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="john@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select id="timezone" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>UTC</option>
                  <option>America/New_York</option>
                  <option>America/Los_Angeles</option>
                  <option>Europe/London</option>
                  <option>Asia/Tokyo</option>
                </select>
              </div>
              <Button>Save Changes</Button>
            </form>
          </motion.div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold">Current Plan</h3>
                  <p className="text-2xl font-bold mt-1">Free Tier</p>
                </div>
                <Button>Upgrade to Pro</Button>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✓ 100 video credits per month</p>
                <p>✓ Basic AI features</p>
                <p>✓ Edge TTS voice</p>
                <p>✗ Premium voices (ElevenLabs)</p>
                <p>✗ Priority rendering</p>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-semibold mb-4">Usage This Month</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Video Credits</span>
                    <span>45 / 100</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: '45%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>API Calls</span>
                    <span>230 / Unlimited</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill bg-green-500" style={{ width: '23%' }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}

import React from 'react'
