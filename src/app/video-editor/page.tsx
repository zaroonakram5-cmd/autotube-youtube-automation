'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, niches, voiceProviders } from '@/lib/utils'
import { Icons } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

type Step = 'niche' | 'topic' | 'generate' | 'voice' | 'images' | 'captions' | 'edit' | 'render'

export default function VideoEditorPage() {
  const [currentStep, setCurrentStep] = useState<Step>('niche')
  const [selectedNiche, setSelectedNiche] = useState<string>('')
  const [customTopic, setCustomTopic] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<{
    title: string
    script: string
    description: string
    tags: string[]
    hashtags: string[]
  } | null>(null)
  
  // Voice settings
  const [voiceProvider, setVoiceProvider] = useState<'EDGE_TTS' | 'ELEVENLABS'>('EDGE_TTS')
  const [selectedVoice, setSelectedVoice] = useState('en-US-AriaNeural')
  const [voiceSpeed, setVoiceSpeed] = useState(1.0)
  const [voicePitch, setVoicePitch] = useState(1.0)
  
  // Resolution
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p')
  
  // Caption settings
  const [captionsEnabled, setCaptionsEnabled] = useState(true)
  const [captionStyle, setCaptionStyle] = useState('modern')
  
  const steps: Step[] = ['niche', 'topic', 'generate', 'voice', 'images', 'captions', 'edit', 'render']
  const stepLabels: Record<Step, string> = {
    niche: 'Choose Niche',
    topic: 'Enter Topic',
    generate: 'AI Generation',
    voice: 'Voice Settings',
    images: 'Images',
    captions: 'Captions',
    edit: 'Edit & Preview',
    render: 'Render',
  }

  const handleGenerate = async () => {
    setGenerating(true)
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    setGeneratedContent({
      title: 'The Future of AI in 2025: What You Need to Know',
      script: 'Welcome to this video about the future of AI...',
      description: 'Discover the latest AI trends and how they will impact our lives in 2025.',
      tags: ['AI', 'technology', 'future', 'innovation', 'automation', 'machine learning', 'robotics', 'AI tools'],
      hashtags: ['#AI', '#Technology', '#FutureTech', '#Innovation', '#MachineLearning', '#AIRevolution'],
    })
    setGenerating(false)
    setCurrentStep('generate')
  }

  const handleNext = () => {
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const handleBack = () => {
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Video Creator</h1>
          <p className="text-muted-foreground mt-1">Create AI-powered YouTube videos in minutes</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between overflow-x-auto">
            {steps.map((step, index) => {
              const currentIndex = steps.indexOf(currentStep)
              const isActive = step === currentStep
              const isCompleted = index < currentIndex
              
              return (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                        isActive && 'bg-primary text-primary-foreground',
                        isCompleted && 'bg-green-500 text-white',
                        !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {isCompleted ? <Icons.check className="h-4 w-4" /> : index + 1}
                    </div>
                    <span className={cn(
                      'text-xs mt-1 hidden sm:block',
                      isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                    )}>
                      {stepLabels[step]}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      'w-8 sm:w-16 h-0.5 mx-1 sm:mx-2',
                      isCompleted ? 'bg-green-500' : 'bg-muted'
                    )} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-[500px]"
          >
            {currentStep === 'niche' && (
              <NicheStep
                selectedNiche={selectedNiche}
                onSelect={setSelectedNiche}
                onNext={handleNext}
              />
            )}

            {currentStep === 'topic' && (
              <TopicStep
                niche={selectedNiche}
                customTopic={customTopic}
                onTopicChange={setCustomTopic}
                onBack={handleBack}
                onNext={() => setCurrentStep('generate')}
              />
            )}

            {currentStep === 'generate' && (
              <GenerateStep
                niche={selectedNiche}
                topic={customTopic}
                generating={generating}
                generatedContent={generatedContent}
                onGenerate={handleGenerate}
                onBack={handleBack}
                onNext={handleNext}
              />
            )}

            {currentStep === 'voice' && (
              <VoiceStep
                provider={voiceProvider}
                setProvider={setVoiceProvider}
                selectedVoice={selectedVoice}
                setSelectedVoice={setSelectedVoice}
                speed={voiceSpeed}
                setSpeed={setVoiceSpeed}
                pitch={voicePitch}
                setPitch={setVoicePitch}
                onBack={handleBack}
                onNext={handleNext}
              />
            )}

            {currentStep === 'images' && (
              <ImagesStep
                onBack={handleBack}
                onNext={handleNext}
              />
            )}

            {currentStep === 'captions' && (
              <CaptionsStep
                enabled={captionsEnabled}
                setEnabled={setCaptionsEnabled}
                style={captionStyle}
                setStyle={setCaptionStyle}
                onBack={handleBack}
                onNext={handleNext}
              />
            )}

            {currentStep === 'edit' && (
              <EditStep
                content={generatedContent}
                resolution={resolution}
                setResolution={setResolution}
                onBack={handleBack}
                onNext={handleNext}
              />
            )}

            {currentStep === 'render' && (
              <RenderStep
                content={generatedContent}
                resolution={resolution}
                onBack={handleBack}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}

function NicheStep({ selectedNiche, onSelect, onNext }: {
  selectedNiche: string
  onSelect: (niche: string) => void
  onNext: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl p-6 border border-border">
        <h2 className="text-xl font-semibold mb-2">Choose Your Niche</h2>
        <p className="text-muted-foreground mb-6">Select the category that best fits your YouTube channel</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {niches.map((niche) => (
            <button
              key={niche.id}
              onClick={() => onSelect(niche.id)}
              className={cn(
                'p-4 rounded-xl border-2 transition-all text-left',
                selectedNiche === niche.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <span className="text-2xl">{niche.icon}</span>
              <h3 className="font-medium mt-2">{niche.name}</h3>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!selectedNiche}>
          Continue
          <Icons.chevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function TopicStep({ niche, customTopic, onTopicChange, onBack, onNext }: {
  niche: string
  customTopic: string
  onTopicChange: (topic: string) => void
  onBack: () => void
  onNext: () => void
}) {
  const nicheData = niches.find(n => n.id === niche)

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl p-6 border border-border">
        <h2 className="text-xl font-semibold mb-2">Enter Your Topic</h2>
        <p className="text-muted-foreground mb-6">
          What would you like to make a video about? Be specific for better results.
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Video Topic</Label>
            <Input
              value={customTopic}
              onChange={(e) => onTopicChange(e.target.value)}
              placeholder="e.g., The Rise of AI Assistants in 2025"
              className="text-lg"
            />
          </div>

          {nicheData && (
            <div className="space-y-2">
              <Label>Suggested Topics</Label>
              <div className="flex flex-wrap gap-2">
                {nicheData.topics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => onTopicChange(topic)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm transition-colors',
                      customTopic === topic
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <Icons.chevronRight className="mr-2 h-4 w-4 rotate-180" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!customTopic}>
          Generate Content
          <Icons.sparkles className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function GenerateStep({ niche, topic, generating, generatedContent, onGenerate, onBack, onNext }: {
  niche: string
  topic: string
  generating: boolean
  generatedContent: { title: string; script: string; description: string; tags: string[]; hashtags: string[] } | null
  onGenerate: () => void
  onBack: () => void
  onNext: () => void
}) {
  const [editingContent, setEditingContent] = useState(generatedContent)

  useState(() => {
    setEditingContent(generatedContent)
  })

  if (!generatedContent && !generating) {
    return (
      <div className="space-y-6">
        <div className="bg-card rounded-xl p-6 border border-border text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Icons.sparkles className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Powered by Gemini AI</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Google&apos;s Gemini AI will create a complete video script with title, description, tags, and hashtags based on your topic.
          </p>
          <Button onClick={onGenerate} size="lg">
            <Icons.sparkles className="mr-2 h-5 w-5" />
            Generate with Gemini
          </Button>
        </div>
        <div className="flex justify-start">
          <Button variant="outline" onClick={onBack}>
            <Icons.chevronRight className="mr-2 h-4 w-4 rotate-180" />
            Back
          </Button>
        </div>
      </div>
    )
  }

  if (generating) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border text-center py-16">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
          <Icons.sparkles className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Gemini is generating...</h2>
        <p className="text-muted-foreground">Creating your video script with AI</p>
        <div className="mt-6 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Icons.check className="h-4 w-4 text-green-500" />
            Analyzing topic with Gemini
          </div>
          <div className="flex items-center justify-center gap-2">
            <Icons.spinner className="h-4 w-4 animate-spin text-blue-500" />
            Writing script
          </div>
          <div className="flex items-center justify-center gap-2">
            <Icons.circle className="h-4 w-4 text-muted-foreground" />
            Generating tags
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Generated Content</h2>
          <span className="badge bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">Gemini Generated</span>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Video Title</Label>
            <Input
              value={generatedContent?.title || ''}
              onChange={(e) => setEditingContent(prev => prev ? { ...prev, title: e.target.value } : null)}
              className="text-lg font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label>Script</Label>
            <textarea
              value={generatedContent?.script || ''}
              onChange={(e) => setEditingContent(prev => prev ? { ...prev, script: e.target.value } : null)}
              className="w-full h-48 px-3 py-2 rounded-md border border-input bg-background text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <textarea
              value={generatedContent?.description || ''}
              onChange={(e) => setEditingContent(prev => prev ? { ...prev, description: e.target.value } : null)}
              className="w-full h-24 px-3 py-2 rounded-md border border-input bg-background text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {generatedContent?.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-muted text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hashtags</Label>
            <div className="flex flex-wrap gap-2">
              {generatedContent?.hashtags.map((hashtag, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  {hashtag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <Icons.chevronRight className="mr-2 h-4 w-4 rotate-180" />
          Back
        </Button>
        <Button onClick={onNext}>
          Continue to Voice
          <Icons.mic className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function VoiceStep({ provider, setProvider, selectedVoice, setSelectedVoice, speed, setSpeed, pitch, setPitch, onBack, onNext }: {
  provider: 'EDGE_TTS' | 'ELEVENLABS'
  setProvider: (p: 'EDGE_TTS' | 'ELEVENLABS') => void
  selectedVoice: string
  setSelectedVoice: (v: string) => void
  speed: number
  setSpeed: (s: number) => void
  pitch: number
  setPitch: (p: number) => void
  onBack: () => void
  onNext: () => void
}) {
  const voices = provider === 'EDGE_TTS' ? voiceProviders.edge_tts.voices : voiceProviders.elevenlabs.voices

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl p-6 border border-border">
        <h2 className="text-xl font-semibold mb-6">Voice Settings</h2>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Voice Provider</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setProvider('EDGE_TTS')}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all text-left',
                  provider === 'EDGE_TTS'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="font-medium">Edge TTS</div>
                <div className="text-sm text-muted-foreground">Free, Microsoft</div>
              </button>
              <button
                onClick={() => setProvider('ELEVENLABS')}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all text-left',
                  provider === 'ELEVENLABS'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="font-medium">ElevenLabs</div>
                <div className="text-sm text-muted-foreground">Premium, requires API key</div>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Voice</Label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
            >
              {voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} ({voice.language})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Speed</Label>
                <span className="text-sm text-muted-foreground">{speed}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Pitch</Label>
                <span className="text-sm text-muted-foreground">{pitch}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Icons.play className="h-5 w-5 text-primary" />
              <span className="text-sm">Preview voice sample</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <Icons.chevronRight className="mr-2 h-4 w-4 rotate-180" />
          Back
        </Button>
        <Button onClick={onNext}>
          Continue to Images
          <Icons.image className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function ImagesStep({ onBack, onNext }: {
  onBack: () => void
  onNext: () => void
}) {
  const [images, setImages] = useState<string[]>([])

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl p-6 border border-border">
        <h2 className="text-xl font-semibold mb-2">AI Image Generation</h2>
        <p className="text-muted-foreground mb-6">
          Generate AI images to use throughout your video. Configure your image provider in Settings.
        </p>

        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
          <Icons.image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Images will be auto-generated based on your script</p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" disabled>
              <Icons.upload className="mr-2 h-4 w-4" />
              Upload Image
            </Button>
            <Button disabled>
              <Icons.sparkles className="mr-2 h-4 w-4" />
              Generate with AI
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-4 text-center">
          Configure an image generation API in Settings to enable AI image generation
        </p>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <Icons.chevronRight className="mr-2 h-4 w-4 rotate-180" />
          Back
        </Button>
        <Button onClick={onNext}>
          Continue to Captions
          <Icons.type className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function CaptionsStep({ enabled, setEnabled, style, setStyle, onBack, onNext }: {
  enabled: boolean
  setEnabled: (v: boolean) => void
  style: string
  setStyle: (s: string) => void
  onBack: () => void
  onNext: () => void
}) {
  const styles = [
    { id: 'default', name: 'Default', preview: 'white' },
    { id: 'modern', name: 'Modern', preview: '#00d4ff' },
    { id: 'minimal', name: 'Minimal', preview: '#ffffff' },
    { id: 'bold', name: 'Bold', preview: '#ffcc00' },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl p-6 border border-border">
        <h2 className="text-xl font-semibold mb-6">Caption Settings</h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Captions</Label>
              <p className="text-sm text-muted-foreground">Add automatic subtitles to your video</p>
            </div>
            <button
              onClick={() => setEnabled(!enabled)}
              className={cn(
                'w-12 h-6 rounded-full transition-colors relative',
                enabled ? 'bg-primary' : 'bg-muted'
              )}
            >
              <div className={cn(
                'w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5',
                enabled ? 'translate-x-6' : 'translate-x-0.5'
              )} />
            </button>
          </div>

          {enabled && (
            <div className="space-y-4 pt-4 border-t border-border">
              <Label>Subtitle Style</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {styles.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all text-center',
                      style === s.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="h-8 rounded bg-black flex items-center justify-center mb-2">
                      <span style={{ color: s.preview }} className="text-xs font-bold">ABC</span>
                    </div>
                    <span className="text-sm">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <Icons.chevronRight className="mr-2 h-4 w-4 rotate-180" />
          Back
        </Button>
        <Button onClick={onNext}>
          Continue to Editor
          <Icons.edit className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function EditStep({ content, resolution, setResolution, onBack, onNext }: {
  content: { title: string; script: string } | null
  resolution: '720p' | '1080p'
  setResolution: (r: '720p' | '1080p') => void
  onBack: () => void
  onNext: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl p-6 border border-border">
        <h2 className="text-xl font-semibold mb-6">Video Preview</h2>

        {/* Video Preview Area */}
        <div className="aspect-video bg-black rounded-xl flex items-center justify-center mb-6">
          <div className="text-center">
            <Icons.video className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Video preview will appear here</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="border border-border rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Icons.layers className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Timeline</span>
          </div>
          <div className="h-20 bg-muted/50 rounded-lg flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Add scenes, transitions, and effects</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label>Resolution</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setResolution('720p')}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all text-center',
                  resolution === '720p'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="font-medium">720p HD</div>
                <div className="text-sm text-muted-foreground">1280 × 720</div>
              </button>
              <button
                onClick={() => setResolution('1080p')}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all text-center',
                  resolution === '1080p'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="font-medium">1080p Full HD</div>
                <div className="text-sm text-muted-foreground">1920 × 1080</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <Icons.chevronRight className="mr-2 h-4 w-4 rotate-180" />
          Back
        </Button>
        <Button onClick={onNext}>
          Render Video
          <Icons.play className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function RenderStep({ content, resolution, onBack }: {
  content: { title: string } | null
  resolution: '720p' | '1080p'
  onBack: () => void
}) {
  const [rendering, setRendering] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const startRender = async () => {
    setRendering(true)
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 300))
      setProgress(i)
    }
  }

  const handleDownload = () => {
    // In production, this would download the actual video
    alert('Download will be available once rendering is complete')
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl p-6 border border-border">
        <h2 className="text-xl font-semibold mb-6">Render & Preview</h2>

        <div className="space-y-6">
          {/* Video Preview */}
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
            {rendering && progress < 100 ? (
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white">Rendering your video...</p>
                <p className="text-sm text-muted-foreground mt-2">{progress}% complete</p>
              </div>
            ) : progress === 100 ? (
              <div className="text-center">
                {isPlaying ? (
                  <video
                    className="w-full h-full"
                    src="/api/videos/preview"
                    autoPlay
                    controls
                    onEnded={() => setIsPlaying(false)}
                  />
                ) : (
                  <>
                    <Icons.playCircle className="h-20 w-20 text-white mx-auto mb-4 cursor-pointer hover:scale-110 transition-transform" />
                    <p className="text-white">Video ready! Click to preview</p>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center">
                <Icons.video className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">Start rendering to preview your video</p>
              </div>
            )}
          </div>

          {/* Render Info */}
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3 mb-2">
              <Icons.video className="h-5 w-5 text-primary" />
              <span className="font-medium">{content?.title || 'Untitled Video'}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Resolution: {resolution}</span>
              <span>•</span>
              <span>Format: MP4</span>
              <span>•</span>
              <span>Est. time: 2-3 min</span>
            </div>
          </div>

          {/* Progress Bar */}
          {rendering && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Rendering progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill bg-gradient-to-r from-blue-500 to-purple-600" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>
          )}

          {/* Actions */}
          {progress === 100 ? (
            <div className="flex gap-3">
              <Button 
                onClick={() => setIsPlaying(true)} 
                size="lg" 
                className="flex-1"
              >
                <Icons.play className="mr-2 h-5 w-5" />
                Preview Video
              </Button>
              <Button 
                onClick={handleDownload} 
                size="lg" 
                className="flex-1"
              >
                <Icons.download className="mr-2 h-5 w-5" />
                Download MP4
              </Button>
            </div>
          ) : (
            <Button 
              onClick={startRender} 
              size="lg" 
              className="w-full"
              disabled={rendering}
            >
              {rendering ? (
                <>
                  <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
                  Rendering...
                </>
              ) : (
                <>
                  <Icons.sparkles className="mr-2 h-5 w-5" />
                  Start Rendering
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <Icons.chevronRight className="mr-2 h-4 w-4 rotate-180" />
          Back to Editor
        </Button>
        <Button variant="outline" onClick={() => window.location.href = '/content-library'}>
          <Icons.library className="mr-2 h-4 w-4" />
          View in Library
        </Button>
      </div>
    </div>
  )
}
