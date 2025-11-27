'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, Volume2, GripVertical, VolumeX, Music, Zap, Mic } from 'lucide-react'
import { Slider } from '@/components/ui/slider'

type SoundboardSound = {
  id: string
  name: string
  url: string
  slot: number
  category: string
}

export function SoundboardPanel({ onClose }: { onClose: () => void }) {
  const [sounds, setSounds] = useState<SoundboardSound[]>([])
  const [playingAudios, setPlayingAudios] = useState<Set<string>>(new Set())
  const [position, setPosition] = useState({ x: window.innerWidth - 400, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [volume, setVolume] = useState(70)
  const audioRefsRef = useRef<Map<string, HTMLAudioElement>>(new Map())
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    fetchSoundboardSounds()
    const currentAudioRefs = audioRefsRef.current

    // Poll for updates every 3 seconds
    const interval = setInterval(fetchSoundboardSounds, 3000)

    return () => {
      // Clean up all audio instances
      currentAudioRefs.forEach((audio) => {
        audio.pause()
        audio.src = ''
      })
      currentAudioRefs.clear()
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        })
      }

      const handleMouseUp = () => {
        setIsDragging(false)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  const fetchSoundboardSounds = async () => {
    try {
      const response = await fetch('/api/soundboard')
      const data = await response.json()
      // Ensure data is an array
      setSounds(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching soundboard sounds:', error)
      setSounds([])
    }
  }

  const togglePlay = (sound: SoundboardSound) => {
    const audioMap = audioRefsRef.current

    // Check if this sound is already playing
    if (playingAudios.has(sound.id)) {
      // Pause and remove it
      const audio = audioMap.get(sound.id)
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
      setPlayingAudios((prev) => {
        const newSet = new Set(prev)
        newSet.delete(sound.id)
        return newSet
      })
    } else {
      // Create new audio instance or reuse existing one
      let audio = audioMap.get(sound.id)
      if (!audio) {
        audio = new Audio(sound.url)
        audio.volume = volume / 100

        // Loop ambience and music categories
        if (sound.category === 'ambience' || sound.category === 'music') {
          audio.loop = true
        }

        audioMap.set(sound.id, audio)

        // Set up event listener for when audio ends
        audio.onended = () => {
          setPlayingAudios((prev) => {
            const newSet = new Set(prev)
            newSet.delete(sound.id)
            return newSet
          })
        }
      }

      audio.currentTime = 0
      audio.volume = volume / 100
      audio.play()
      setPlayingAudios((prev) => new Set(prev).add(sound.id))
    }
  }

  // Update volume for all audio instances when volume slider changes
  useEffect(() => {
    audioRefsRef.current.forEach((audio) => {
      audio.volume = volume / 100
    })
  }, [volume])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
    }
  }

  // Get category-specific styling
  const getCategoryStyle = (category: string, isPlaying: boolean) => {
    if (isPlaying) {
      return 'bg-orange-600 border-orange-400 hover:bg-orange-700'
    }

    switch (category) {
      case 'ambience':
        return 'bg-slate-700 border-blue-500/50 hover:bg-slate-600'
      case 'music':
        return 'bg-slate-700 border-purple-500/50 hover:bg-slate-600'
      case 'sfx':
        return 'bg-slate-700 border-green-500/50 hover:bg-slate-600'
      case 'voice':
        return 'bg-slate-700 border-yellow-500/50 hover:bg-slate-600'
      default:
        return 'bg-slate-700 border-slate-600 hover:bg-slate-600'
    }
  }

  // Get category-specific icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ambience':
        return <Volume2 className="h-4 w-4 mb-1 text-blue-400" />
      case 'music':
        return <Music className="h-4 w-4 mb-1 text-purple-400" />
      case 'sfx':
        return <Zap className="h-4 w-4 mb-1 text-green-400" />
      case 'voice':
        return <Mic className="h-4 w-4 mb-1 text-yellow-400" />
      default:
        return <Volume2 className="h-4 w-4 mb-1" />
    }
  }

  // Create 5x5 grid (25 slots)
  const renderGrid = () => {
    const slots = []
    for (let i = 0; i < 25; i++) {
      const sound = sounds.find((s) => s.slot === i)
      const isPlaying = sound ? playingAudios.has(sound.id) : false
      slots.push(
        <button
          key={i}
          onClick={() => sound && togglePlay(sound)}
          disabled={!sound}
          className={`
            aspect-square rounded border-2 transition-all
            ${sound
              ? getCategoryStyle(sound.category, isPlaying)
              : 'bg-slate-800 border-slate-700 cursor-not-allowed'
            }
          `}
        >
          {sound && (
            <div className="flex flex-col items-center justify-center p-1 h-full">
              {getCategoryIcon(sound.category)}
              <span className="text-[10px] text-center leading-tight line-clamp-2">
                {sound.name}
              </span>
            </div>
          )}
        </button>
      )
    }
    return slots
  }

  return (
    <Card
      ref={panelRef}
      className="fixed bg-slate-800 border-slate-700 shadow-2xl select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '350px',
        zIndex: 100,
      }}
    >
      {/* Header with drag handle */}
      <div
        className="flex items-center justify-between p-3 border-b border-slate-700 cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-slate-400" />
          <h3 className="font-semibold text-white text-sm">Quick Soundboard</h3>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Volume Control */}
      <div className="px-4 pt-3 pb-2 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            {volume === 0 ? (
              <VolumeX className="h-4 w-4 text-slate-400" />
            ) : (
              <Volume2 className="h-4 w-4 text-slate-400" />
            )}
            <span className="text-xs text-slate-400 w-8">{volume}%</span>
          </div>
          <Slider
            value={[volume]}
            onValueChange={(value) => setVolume(value[0])}
            max={100}
            step={1}
            className="flex-1"
          />
        </div>
      </div>

      {/* 5x5 Grid */}
      <div className="p-4">
        <div className="grid grid-cols-5 gap-2">
          {renderGrid()}
        </div>
      </div>
    </Card>
  )
}
