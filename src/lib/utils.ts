import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export const niches = [
  { id: 'tech', name: 'Technology', icon: '💻', topics: ['AI', 'Gadgets', 'Software', 'Coding'] },
  { id: 'business', name: 'Business', icon: '💼', topics: ['Startup', 'Marketing', 'Finance', 'Leadership'] },
  { id: 'lifestyle', name: 'Lifestyle', icon: '🌟', topics: ['Fitness', 'Travel', 'Food', 'Fashion'] },
  { id: 'education', name: 'Education', icon: '📚', topics: ['Learning', 'Tips', 'Tutorials', 'Facts'] },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', topics: ['Gaming', 'Movies', 'Music', 'Comedy'] },
  { id: 'finance', name: 'Finance', icon: '💰', topics: ['Investing', 'Crypto', 'Budgeting', 'Trading'] },
  { id: 'health', name: 'Health', icon: '🏥', topics: ['Wellness', 'Mental Health', 'Nutrition', 'Exercise'] },
  { id: 'news', name: 'News', icon: '📰', topics: ['World News', 'Local', 'Politics', 'Current Events'] },
]

export const voiceProviders = {
  edge_tts: {
    name: 'Edge TTS',
    description: 'Free Microsoft Edge text-to-speech',
    voices: [
      { id: 'en-US-AriaNeural', name: 'Aria (Female)', language: 'en-US' },
      { id: 'en-US-GuyNeural', name: 'Guy (Male)', language: 'en-US' },
      { id: 'en-US-JennyNeural', name: 'Jenny (Female)', language: 'en-US' },
      { id: 'en-US-SteffanNeural', name: 'Steffan (Male)', language: 'en-US' },
      { id: 'en-GB-SoniaNeural', name: 'Sonia (Female)', language: 'en-GB' },
      { id: 'en-AU-NatashaNeural', name: 'Natasha (Female)', language: 'en-AU' },
    ],
  },
  elevenlabs: {
    name: 'ElevenLabs',
    description: 'High-quality AI voice synthesis',
    voices: [
      { id: 'custom', name: 'Custom Voice (API Required)', language: 'multi' },
    ],
  },
}

export const subtitleStyles = [
  { id: 'default', name: 'Default', fontFamily: 'Arial', position: 'bottom' },
  { id: 'modern', name: 'Modern', fontFamily: 'Inter', position: 'bottom' },
  { id: 'minimal', name: 'Minimal', fontFamily: 'Roboto', position: 'center' },
  { id: 'bold', name: 'Bold', fontFamily: 'Montserrat', position: 'bottom' },
]

export const thumbnailTemplates = [
  { id: 'minimal', name: 'Minimal Dark', background: '#1a1a1a', textColor: '#ffffff' },
  { id: 'gradient', name: 'Gradient Purple', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', textColor: '#ffffff' },
  { id: 'neon', name: 'Neon Blue', background: '#0f0f23', textColor: '#00d4ff' },
  { id: 'warm', name: 'Warm Orange', background: '#ff6b35', textColor: '#ffffff' },
  { id: 'nature', name: 'Nature Green', background: '#2d5016', textColor: '#ffffff' },
]
