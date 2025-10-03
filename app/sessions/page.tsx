'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Plus, Edit2, Trash2, Play, ChevronUp, ChevronDown, CheckCircle2, Circle, Music, Image as ImageIcon, StickyNote, X, ChevronRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import AssetPicker from '@/components/AssetPicker'

type EventNote = {
  id: string
  timelineEventId: string
  content: string
  createdAt: string
  updatedAt: string
}

type TimelineEvent = {
  id: string
  sessionId: string
  order: number
  title: string
  description: string | null
  soundUrls: string | null
  imageUrls: string | null
  completed: boolean
  createdAt: string
  updatedAt: string
  notes?: EventNote[]
}

type Session = {
  id: string
  sessionNumber: number
  title: string
  date: string
  notes: string | null
  summary: string | null
  status: string
  createdAt: string
  updatedAt: string
  timeline?: TimelineEvent[]
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [isPrepEventDialogOpen, setIsPrepEventDialogOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [prepEvents, setPrepEvents] = useState<{ title: string; description: string; soundUrls: string; imageUrls: string; order: number }[]>([])
  const [eventFormData, setEventFormData] = useState({
    title: '',
    description: '',
    soundUrls: '',
    imageUrls: '',
  })
  const [keyDetails, setKeyDetails] = useState<string[]>(['', '', ''])
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
  const [newNoteContent, setNewNoteContent] = useState<{ [key: string]: string }>({})
  const [isAudioPickerOpen, setIsAudioPickerOpen] = useState(false)
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false)
  const [selectedAudioIds, setSelectedAudioIds] = useState<string[]>([])
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([])
  const [assetUrls, setAssetUrls] = useState<{ [assetId: string]: string }>({})
  const [audioAssets, setAudioAssets] = useState<{ [assetId: string]: any }>({})
  const audioRefs = useRef<{ [assetId: string]: HTMLAudioElement }>({})

  useEffect(() => {
    fetchSessions()
  }, [])

  // Get or create a persistent audio element for an asset
  const getAudioElement = (assetId: string, url: string) => {
    if (!audioRefs.current[assetId]) {
      const audio = new Audio(url)
      audio.controls = true
      audioRefs.current[assetId] = audio
    }
    return audioRefs.current[assetId]
  }

  const fetchSessions = async () => {
    const response = await fetch('/api/sessions')
    const data = await response.json()

    // Load timeline for each session to get event counts
    const sessionsWithTimeline = await Promise.all(
      data.map(async (session: Session) => {
        const timelineRes = await fetch(`/api/sessions/${session.id}/timeline`)
        const timeline = await timelineRes.json()
        return { ...session, timeline }
      })
    )

    console.log('Loaded sessions with timelines:', sessionsWithTimeline)
    setSessions(sessionsWithTimeline)

    // Check if there's an active session
    const active = sessionsWithTimeline.find((s: Session) => s.status === 'active')
    if (active) {
      loadSessionWithTimeline(active.id)
    }
  }

  const loadSessionWithTimeline = async (sessionId: string) => {
    const [sessionRes, timelineRes] = await Promise.all([
      fetch(`/api/sessions/${sessionId}`),
      fetch(`/api/sessions/${sessionId}/timeline`)
    ])
    const session = await sessionRes.json()
    const timeline = await timelineRes.json()

    // Fetch all asset URLs for the timeline events
    const allImageIds = new Set<string>()
    const allAudioIds = new Set<string>()
    timeline.forEach((event: TimelineEvent) => {
      if (event.imageUrls) {
        JSON.parse(event.imageUrls).forEach((id: string) => allImageIds.add(id))
      }
      if (event.soundUrls) {
        JSON.parse(event.soundUrls).forEach((id: string) => allAudioIds.add(id))
      }
    })

    // Fetch all assets
    const [audioAssetsArray, imageAssets] = await Promise.all([
      fetch('/api/media/audio').then(r => r.json()),
      fetch('/api/media/images').then(r => r.json())
    ])

    // Build URL lookup map and audio asset map
    const urlMap: { [assetId: string]: string } = {}
    const audioMap: { [assetId: string]: any } = {}
    audioAssetsArray.forEach((asset: any) => {
      urlMap[asset.id] = asset.url
      audioMap[asset.id] = asset
    })
    imageAssets.forEach((asset: any) => {
      urlMap[asset.id] = asset.url
    })

    setAssetUrls(urlMap)
    setAudioAssets(audioMap)
    setActiveSession({ ...session, timeline })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('Submitting session with prepEvents:', prepEvents)

    const url = editingSession ? `/api/sessions/${editingSession.id}` : '/api/sessions'
    const method = editingSession ? 'PUT' : 'POST'

    // Auto-calculate session number for new sessions
    const sessionNumber = editingSession
      ? editingSession.sessionNumber
      : Math.max(0, ...sessions.map(s => s.sessionNumber)) + 1

    const sessionResponse = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        sessionNumber,
        date: new Date(formData.date).toISOString(),
      }),
    })

    const session = await sessionResponse.json()
    console.log('Session created:', session)

    // Create timeline events for this session
    console.log('Creating timeline events. prepEvents.length:', prepEvents.length, 'editingSession:', editingSession)
    if (prepEvents.length > 0 && !editingSession) {
      for (let i = 0; i < prepEvents.length; i++) {
        console.log('Creating event:', prepEvents[i])
        const response = await fetch(`/api/sessions/${session.id}/timeline`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: prepEvents[i].title,
            description: prepEvents[i].description,
            soundUrls: prepEvents[i].soundUrls,
            imageUrls: prepEvents[i].imageUrls,
            order: prepEvents[i].order,
          }),
        })
        const eventResult = await response.json()
        console.log('Event created result:', eventResult)
      }
    }

    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
    })
    setPrepEvents([])
    setEditingSession(null)
    setIsDialogOpen(false)
    fetchSessions()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      await fetch(`/api/sessions/${id}`, { method: 'DELETE' })
      fetchSessions()
    }
  }

  const handleEdit = async (session: Session) => {
    setEditingSession(session)
    setFormData({
      title: session.title,
      date: new Date(session.date).toISOString().split('T')[0],
    })

    // Load existing timeline events for this session
    const response = await fetch(`/api/sessions/${session.id}/timeline`)
    const timeline = await response.json()
    console.log('Loaded timeline for editing:', timeline)

    // Convert timeline events to prepEvents format
    const events = timeline.map((event: TimelineEvent) => ({
      title: event.title,
      description: event.description || '',
      soundUrls: event.soundUrls || '',
      imageUrls: event.imageUrls || '',
      order: event.order
    }))
    setPrepEvents(events)

    setIsDialogOpen(true)
  }

  const addPrepEvent = () => {
    if (!eventFormData.title.trim()) return
    const newOrder = prepEvents.length > 0 ? Math.max(...prepEvents.map(e => e.order)) + 1 : 0

    // Convert key details array to description string (one per line, filter empty)
    const description = keyDetails.filter(d => d.trim()).join('\n')

    // Convert asset IDs to JSON strings
    const soundUrls = selectedAudioIds.length > 0 ? JSON.stringify(selectedAudioIds) : ''
    const imageUrls = selectedImageIds.length > 0 ? JSON.stringify(selectedImageIds) : ''

    setPrepEvents([...prepEvents, { ...eventFormData, description, soundUrls, imageUrls, order: newOrder }])
    setEventFormData({ title: '', description: '', soundUrls: '', imageUrls: '' })
    setKeyDetails(['', '', ''])
    setSelectedAudioIds([])
    setSelectedImageIds([])
    setIsPrepEventDialogOpen(false)
  }

  const addKeyDetail = () => {
    setKeyDetails([...keyDetails, ''])
  }

  const removeKeyDetail = (index: number) => {
    if (keyDetails.length <= 1) return
    setKeyDetails(keyDetails.filter((_, i) => i !== index))
  }

  const updateKeyDetail = (index: number, value: string) => {
    const updated = [...keyDetails]
    updated[index] = value
    setKeyDetails(updated)
  }

  const removePrepEvent = (index: number) => {
    setPrepEvents(prepEvents.filter((_, i) => i !== index))
  }

  const movePrepEvent = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === prepEvents.length - 1)
    ) {
      return
    }
    const newEvents = [...prepEvents]
    const newIndex = direction === 'up' ? index - 1 : index + 1

    // Swap the order values
    const tempOrder = newEvents[index].order
    newEvents[index].order = newEvents[newIndex].order
    newEvents[newIndex].order = tempOrder

    // Swap positions
    ;[newEvents[index], newEvents[newIndex]] = [newEvents[newIndex], newEvents[index]]
    setPrepEvents(newEvents)
  }

  const startSession = async (session: Session) => {
    await fetch(`/api/sessions/${session.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' }),
    })
    loadSessionWithTimeline(session.id)
    fetchSessions()
  }

  const endSession = async () => {
    if (!activeSession) return
    if (confirm('End this session and return to prep mode?')) {
      await fetch(`/api/sessions/${activeSession.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'prep' }),
      })
      setActiveSession(null)
      fetchSessions()
    }
  }

  const addTimelineEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeSession) return

    const order = activeSession.timeline?.length || 0

    await fetch(`/api/sessions/${activeSession.id}/timeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...eventFormData,
        order,
      }),
    })

    setEventFormData({ title: '', description: '', soundUrls: '', imageUrls: '' })
    setIsEventDialogOpen(false)
    loadSessionWithTimeline(activeSession.id)
  }

  const toggleEventComplete = async (event: TimelineEvent) => {
    if (!activeSession) return
    await fetch(`/api/sessions/${activeSession.id}/timeline/${event.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !event.completed }),
    })
    loadSessionWithTimeline(activeSession.id)
  }

  const deleteTimelineEvent = async (eventId: string) => {
    if (!activeSession) return
    if (confirm('Delete this timeline event?')) {
      await fetch(`/api/sessions/${activeSession.id}/timeline/${eventId}`, {
        method: 'DELETE',
      })
      loadSessionWithTimeline(activeSession.id)
    }
  }

  const moveEvent = async (event: TimelineEvent, direction: 'up' | 'down') => {
    if (!activeSession || !activeSession.timeline) return

    const currentIndex = activeSession.timeline.findIndex(e => e.id === event.id)
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === activeSession.timeline.length - 1)
    ) {
      return
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const swapEvent = activeSession.timeline[newIndex]

    await Promise.all([
      fetch(`/api/sessions/${activeSession.id}/timeline/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: swapEvent.order }),
      }),
      fetch(`/api/sessions/${activeSession.id}/timeline/${swapEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: event.order }),
      }),
    ])

    loadSessionWithTimeline(activeSession.id)
  }

  const playSounds = (soundUrls: string | null) => {
    if (!soundUrls) return
    try {
      const urls = JSON.parse(soundUrls)
      urls.forEach((url: string) => {
        const audio = new Audio(url)
        audio.play()
      })
    } catch (error) {
      console.error('Failed to play sounds:', error)
    }
  }

  const addEventNote = async (eventId: string) => {
    if (!activeSession || !newNoteContent[eventId]?.trim()) return

    await fetch(`/api/sessions/${activeSession.id}/timeline/${eventId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newNoteContent[eventId] }),
    })

    setNewNoteContent({ ...newNoteContent, [eventId]: '' })
    loadSessionWithTimeline(activeSession.id)
  }

  const deleteEventNote = async (eventId: string, noteId: string) => {
    if (!activeSession) return
    await fetch(`/api/sessions/${activeSession.id}/timeline/${eventId}/notes/${noteId}`, {
      method: 'DELETE',
    })
    loadSessionWithTimeline(activeSession.id)
  }

  // Active session view
  if (activeSession) {
    return (
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🎲 Session {activeSession.sessionNumber}: {activeSession.title}
            </h1>
            <p className="text-slate-400">Live session in progress</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 text-white border-slate-700">
                <DialogHeader>
                  <DialogTitle>Add Timeline Event</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Add a new event to the session timeline
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={addTimelineEvent} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input
                      value={eventFormData.title}
                      onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                      className="bg-slate-900 border-slate-700"
                      placeholder="Vampire encounter"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description / Key Details</label>
                    <Textarea
                      value={eventFormData.description}
                      onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                      className="bg-slate-900 border-slate-700 min-h-[100px]"
                      placeholder="Important notes, NPC info, key items..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sound URLs (JSON array)</label>
                    <Input
                      value={eventFormData.soundUrls}
                      onChange={(e) => setEventFormData({ ...eventFormData, soundUrls: e.target.value })}
                      className="bg-slate-900 border-slate-700"
                      placeholder='["url1.mp3", "url2.mp3"]'
                    />
                  </div>
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                    Add Event
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button onClick={endSession} variant="outline" className="border-red-600 text-red-400 hover:bg-red-900/20">
              End Session
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {activeSession.timeline && activeSession.timeline.length > 0 ? (
            activeSession.timeline.map((event, index) => {
              const isExpanded = expandedEvent === event.id
              const hasImages = event.imageUrls && JSON.parse(event.imageUrls || '[]').length > 0
              const hasSounds = event.soundUrls && JSON.parse(event.soundUrls || '[]').length > 0
              const hasNotes = event.notes && event.notes.length > 0

              return (
                <Card
                  key={event.id}
                  className={`border transition-all ${
                    event.completed
                      ? 'bg-slate-900/50 border-slate-800'
                      : isExpanded
                      ? 'bg-slate-800 border-purple-600 shadow-lg shadow-purple-900/20'
                      : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {/* Event Header */}
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleEventComplete(event)}
                        className="mt-1 flex-shrink-0"
                      >
                        {event.completed ? (
                          <CheckCircle2 className="h-6 w-6 text-green-400" />
                        ) : (
                          <Circle className="h-6 w-6 text-slate-500 hover:text-slate-400" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <button
                            onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                            className="flex-1 text-left"
                          >
                            <div className="flex items-center gap-2">
                              <h3 className={`text-lg font-semibold ${event.completed ? 'text-slate-500 line-through' : 'text-white'}`}>
                                {index + 1}. {event.title}
                              </h3>
                              <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </div>

                            {/* Asset badges */}
                            <div className="flex gap-2 mt-2">
                              {hasImages && (
                                <span className="text-xs px-2 py-1 rounded-full bg-blue-900/30 text-blue-400 flex items-center gap-1">
                                  <ImageIcon className="h-3 w-3" />
                                  {JSON.parse(event.imageUrls || '[]').length} image{JSON.parse(event.imageUrls || '[]').length > 1 ? 's' : ''}
                                </span>
                              )}
                              {hasSounds && (
                                <span className="text-xs px-2 py-1 rounded-full bg-green-900/30 text-green-400 flex items-center gap-1">
                                  <Music className="h-3 w-3" />
                                  {JSON.parse(event.soundUrls || '[]').length} sound{JSON.parse(event.soundUrls || '[]').length > 1 ? 's' : ''}
                                </span>
                              )}
                              {hasNotes && (
                                <span className="text-xs px-2 py-1 rounded-full bg-purple-900/30 text-purple-400 flex items-center gap-1">
                                  <StickyNote className="h-3 w-3" />
                                  {event.notes.length} note{event.notes.length > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </button>

                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveEvent(event, 'up')}
                              disabled={index === 0}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveEvent(event, 'down')}
                              disabled={index === activeSession.timeline!.length - 1}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteTimelineEvent(event.id)}
                              className="h-8 w-8 p-0 hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-slate-700 p-4 space-y-4 bg-slate-900/50">
                      {/* Key Details as bullet list */}
                      {event.description && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-400 mb-3">Key Details</h4>
                          <ul className="space-y-2">
                            {event.description.split('\n').filter(line => line.trim()).map((detail, idx) => (
                              <li key={idx} className="text-base text-slate-200 flex gap-3 leading-relaxed">
                                <span className="text-purple-400 text-lg">•</span>
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Images */}
                      {hasImages && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-400 mb-2">Images</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {JSON.parse(event.imageUrls || '[]').map((assetId: string, idx: number) => {
                              const url = assetUrls[assetId]
                              if (!url) return null
                              return (
                                <img
                                  key={idx}
                                  src={url}
                                  alt={`Event image ${idx + 1}`}
                                  className="w-full h-auto max-h-96 object-contain rounded"
                                />
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Sounds */}
                      {hasSounds && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-400 mb-2">Audio</h4>
                          <div className="space-y-2">
                            {JSON.parse(event.soundUrls || '[]').map((assetId: string, idx: number) => {
                              const asset = audioAssets[assetId]
                              if (!asset) return null

                              return (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-700 rounded">
                                  <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                    <Music className="h-4 w-4 text-green-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="text-sm font-medium text-white truncate">{asset.name}</h5>
                                    <p className="text-xs text-slate-400 capitalize">{asset.category}</p>
                                  </div>
                                  {asset.sourceType === 'youtube' ? (
                                    <a
                                      href={asset.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white flex-shrink-0"
                                    >
                                      YouTube
                                    </a>
                                  ) : (
                                    <div
                                      ref={(container) => {
                                        if (container && !container.querySelector('audio')) {
                                          const audioEl = getAudioElement(assetId, asset.url)
                                          audioEl.className = 'h-8'
                                          container.appendChild(audioEl)
                                        }
                                      }}
                                    />
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Notes Section */}
                      <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-3">Session Notes</h4>

                        {/* Existing notes */}
                        {event.notes && event.notes.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {event.notes.map((note) => (
                              <div key={note.id} className="bg-slate-800 p-3 rounded border border-slate-700 group">
                                <div className="flex justify-between items-start gap-2">
                                  <p className="text-sm text-slate-300 flex-1">{note.content}</p>
                                  <button
                                    onClick={() => deleteEventNote(event.id, note.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-4 w-4 text-red-400 hover:text-red-300" />
                                  </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                  {new Date(note.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add new note */}
                        <div className="flex gap-2">
                          <Textarea
                            value={newNoteContent[event.id] || ''}
                            onChange={(e) => setNewNoteContent({ ...newNoteContent, [event.id]: e.target.value })}
                            placeholder="Add a note about what happened..."
                            className="bg-slate-800 border-slate-700 min-h-[60px] text-sm"
                          />
                          <Button
                            onClick={() => addEventNote(event.id)}
                            disabled={!newNoteContent[event.id]?.trim()}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              )
            })
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">No timeline events yet</p>
              <p className="text-sm text-slate-500">Add events to track your session flow</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Session prep view (list of sessions)
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Session Prep</h1>
          <p className="text-slate-400">Plan and manage your game sessions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingSession(null)
                setFormData({
                  title: '',
                  date: new Date().toISOString().split('T')[0],
                })
                setPrepEvents([])
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingSession ? 'Edit Session' : 'Create New Session'}</DialogTitle>
              <DialogDescription className="text-slate-400">
                {editingSession ? 'Update session details' : 'Plan a new game session'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-slate-900 border-slate-700"
                    placeholder="The Dragon's Lair"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Date</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-slate-900 border-slate-700"
                    required
                  />
                </div>
              </div>
              {!editingSession && (
                <div className="text-sm text-slate-400 bg-slate-900 p-3 rounded-lg">
                  📋 This will be Session #{Math.max(0, ...sessions.map(s => s.sessionNumber)) + 1}
                </div>
              )}

              {/* Planned Key Events Section */}
              <div className="border-t border-slate-700 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="text-sm font-medium block">📍 Planned Key Events</label>
                    <p className="text-xs text-slate-400">Plan the events you expect to happen during this session</p>
                  </div>
                  <Dialog open={isPrepEventDialogOpen} onOpenChange={setIsPrepEventDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 text-white border-slate-700">
                      <DialogHeader>
                        <DialogTitle>Add Key Event</DialogTitle>
                        <DialogDescription className="text-slate-400">
                          Add a planned event for this session
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">Event Title</label>
                          <Input
                            value={eventFormData.title}
                            onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                            className="bg-slate-900 border-slate-700"
                            placeholder="e.g., Meeting with Fiona Wachter"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs text-slate-400 block">Key Details</label>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={addKeyDetail}
                              className="h-6 text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Detail
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {keyDetails.map((detail, index) => (
                              <div key={index} className="flex gap-2">
                                <span className="text-slate-500 text-sm pt-2">•</span>
                                <Input
                                  value={detail}
                                  onChange={(e) => updateKeyDetail(index, e.target.value)}
                                  className="bg-slate-900 border-slate-700 flex-1"
                                  placeholder="e.g., Lady Wachter wants the party's help"
                                />
                                {keyDetails.length > 1 && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeKeyDetail(index)}
                                    className="h-9 w-9 p-0 hover:bg-red-900/20"
                                  >
                                    <X className="h-4 w-4 text-red-400" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">Audio Assets (optional)</label>
                          <Button
                            type="button"
                            onClick={() => setIsAudioPickerOpen(true)}
                            variant="outline"
                            className="w-full justify-start bg-slate-900 border-slate-700"
                          >
                            <Music className="h-4 w-4 mr-2" />
                            {selectedAudioIds.length > 0
                              ? `${selectedAudioIds.length} audio asset${selectedAudioIds.length > 1 ? 's' : ''} selected`
                              : 'Select Audio Assets'}
                          </Button>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">Image Assets (optional)</label>
                          <Button
                            type="button"
                            onClick={() => setIsImagePickerOpen(true)}
                            variant="outline"
                            className="w-full justify-start bg-slate-900 border-slate-700"
                          >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            {selectedImageIds.length > 0
                              ? `${selectedImageIds.length} image${selectedImageIds.length > 1 ? 's' : ''} selected`
                              : 'Select Images'}
                          </Button>
                        </div>
                        <Button
                          type="button"
                          onClick={addPrepEvent}
                          className="w-full bg-green-600 hover:bg-green-700"
                          disabled={!eventFormData.title.trim()}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Event
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* List of planned events */}
                {prepEvents.length > 0 ? (
                  <div className="space-y-3 mt-4">
                    {prepEvents
                      .sort((a, b) => a.order - b.order)
                      .map((event, index) => (
                        <div key={index} className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center text-purple-400 text-xs font-bold">
                              {event.order + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-white text-sm mb-1">Key Event #{event.order + 1}</h4>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => movePrepEvent(index, 'up')}
                                disabled={index === 0}
                                className="h-7 w-7 p-0"
                                title="Move up"
                              >
                                <ChevronUp className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => movePrepEvent(index, 'down')}
                                disabled={index === prepEvents.length - 1}
                                className="h-7 w-7 p-0"
                                title="Move down"
                              >
                                <ChevronDown className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => removePrepEvent(index)}
                                className="h-7 w-7 p-0 hover:bg-red-900/20"
                                title="Remove"
                              >
                                <Trash2 className="h-3 w-3 text-red-400" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-3 pl-11">
                            <div>
                              <label className="text-xs text-slate-500 mb-1 block">Event Title</label>
                              <p className="text-sm text-white">{event.title}</p>
                            </div>
                            {event.description && (
                              <div>
                                <label className="text-xs text-slate-500 mb-1 block">Key Details</label>
                                <ul className="space-y-1">
                                  {event.description.split('\n').filter(line => line.trim()).map((detail, idx) => (
                                    <li key={idx} className="text-xs text-slate-300 flex gap-2">
                                      <span className="text-purple-400">•</span>
                                      <span>{detail}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {(event.soundUrls || event.imageUrls) && (
                              <div>
                                <label className="text-xs text-slate-500 mb-1 block">Assets</label>
                                <div className="flex gap-2">
                                  {event.soundUrls && (
                                    <p className="text-xs text-green-400">🔊 Sounds</p>
                                  )}
                                  {event.imageUrls && (
                                    <p className="text-xs text-blue-400">🖼️ Images</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    No events planned yet. Click "Add Event" to start.
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                {editingSession ? 'Update Session' : `Create Session${prepEvents.length > 0 ? ` with ${prepEvents.length} events` : ''}`}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {sessions
          .sort((a, b) => b.sessionNumber - a.sessionNumber)
          .map((session) => (
            <Card key={session.id} className="p-6 bg-slate-800 border-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-blue-900/30">
                      <Calendar className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        Session {session.sessionNumber}: {session.title}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {new Date(session.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {session.timeline && session.timeline.length > 0 && (
                    <div className="mt-3 pl-14">
                      <p className="text-xs text-purple-400">
                        📍 {session.timeline.length} planned event{session.timeline.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}

                  {session.summary && (
                    <div className="mt-4 pl-14">
                      <p className="text-slate-300 text-sm">{session.summary}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    onClick={() => startSession(session)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Session
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(session)}
                    className="hover:bg-slate-700"
                  >
                    <Edit2 className="h-4 w-4 text-slate-400" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(session.id)}
                    className="hover:bg-slate-700"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">No sessions yet</p>
          <p className="text-sm text-slate-500">Create your first session to start planning</p>
        </div>
      )}

      {/* Asset Pickers */}
      <AssetPicker
        type="audio"
        open={isAudioPickerOpen}
        onClose={() => setIsAudioPickerOpen(false)}
        onSelect={(ids) => setSelectedAudioIds(ids)}
        selectedIds={selectedAudioIds}
        multiple={true}
      />
      <AssetPicker
        type="image"
        open={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        onSelect={(ids) => setSelectedImageIds(ids)}
        selectedIds={selectedImageIds}
        multiple={true}
      />
    </div>
  )
}
