'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Music,
  Swords,
  StickyNote,
  Plus,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { SoundboardPanel } from './SoundboardPanel'

export function QuickControls() {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [showSoundboard, setShowSoundboard] = useState(false)
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    category: 'general',
  })

  const handleQuickNote = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteForm),
    })
    setNoteForm({ title: '', content: '', category: 'general' })
    setShowNoteDialog(false)
  }

  const openCombat = () => {
    router.push('/combat')
    setIsExpanded(false)
  }

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Expanded Options */}
        {isExpanded && (
          <Card className="bg-slate-800 border-slate-700 p-3 shadow-xl animate-in slide-in-from-bottom-2">
            <div className="flex flex-col gap-2">
              {/* Quick Note */}
              <Button
                onClick={() => {
                  setShowNoteDialog(true)
                  setIsExpanded(false)
                }}
                className="bg-yellow-600 hover:bg-yellow-700 justify-start"
                size="sm"
              >
                <StickyNote className="h-4 w-4 mr-2" />
                Quick Note
              </Button>

              {/* Music Controls */}
              <Button
                onClick={() => {
                  setShowSoundboard(!showSoundboard)
                  setIsExpanded(false)
                }}
                className="bg-purple-600 hover:bg-purple-700 justify-start"
                size="sm"
              >
                <Music className="h-4 w-4 mr-2" />
                Music
              </Button>

              {/* Combat Tracker */}
              <Button
                onClick={openCombat}
                className="bg-red-600 hover:bg-red-700 justify-start"
                size="sm"
              >
                <Swords className="h-4 w-4 mr-2" />
                Combat
              </Button>
            </div>
          </Card>
        )}

        {/* Main FAB Button */}
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          size="icon"
        >
          {isExpanded ? (
            <ChevronDown className="h-6 w-6" />
          ) : (
            <ChevronUp className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Soundboard Panel */}
      {showSoundboard && <SoundboardPanel onClose={() => setShowSoundboard(false)} />}

      {/* Quick Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent className="bg-slate-800 text-white border-slate-700">
          <DialogHeader>
            <DialogTitle>Quick Note</DialogTitle>
            <DialogDescription className="text-slate-400">
              Quickly jot down something important
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleQuickNote} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                value={noteForm.title}
                onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                className="bg-slate-900 border-slate-700"
                placeholder="NPC name, location, etc."
                required
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select
                value={noteForm.category}
                onValueChange={(value) => setNoteForm({ ...noteForm, category: value })}
              >
                <SelectTrigger className="bg-slate-900 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {['general', 'npc', 'location', 'quest', 'item'].map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-white">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Note</label>
              <Textarea
                value={noteForm.content}
                onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                className="bg-slate-900 border-slate-700 min-h-[100px]"
                placeholder="Quick note..."
                required
              />
            </div>
            <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700">
              <Plus className="h-4 w-4 mr-2" />
              Save Note
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
