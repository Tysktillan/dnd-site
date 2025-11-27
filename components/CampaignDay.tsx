'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Input } from './ui/input'

export function CampaignDay() {
  const { data: session } = useSession()
  const [currentDay, setCurrentDay] = useState<number>(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newDay, setNewDay] = useState<string>('')
  const isDM = session?.user?.role === 'dm'

  useEffect(() => {
    fetchCurrentDay()
  }, [])

  const fetchCurrentDay = async () => {
    try {
      const res = await fetch('/api/campaign-settings')
      if (res.ok) {
        const data = await res.json()
        setCurrentDay(data.currentDay)
      }
    } catch (error) {
      console.error('Failed to fetch campaign day:', error)
    }
  }

  const updateDay = async (day: number) => {
    try {
      const res = await fetch('/api/campaign-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentDay: day })
      })

      if (res.ok) {
        const data = await res.json()
        setCurrentDay(data.currentDay)
      }
    } catch (error) {
      console.error('Failed to update campaign day:', error)
    }
  }

  const handleDayChange = (increment: number) => {
    const newDayValue = Math.max(1, currentDay + increment)
    updateDay(newDayValue)
  }

  const handleSetDay = () => {
    const dayNum = parseInt(newDay)
    if (!isNaN(dayNum) && dayNum >= 1) {
      updateDay(dayNum)
      setIsDialogOpen(false)
      setNewDay('')
    }
  }

  return (
    <>
      <div
        className="fixed top-4 right-4 z-30 bg-gradient-to-br from-stone-900 to-stone-950 backdrop-blur-xl border-2 border-amber-900/40 rounded-lg px-4 py-2 shadow-2xl"
        style={{ fontFamily: 'serif' }}
      >
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-amber-600" />
          <div className="text-center">
            <div className="text-xs text-stone-500 uppercase tracking-wider">Campaign</div>
            <div className="text-xl font-bold text-amber-100">Day {currentDay}</div>
          </div>
          {isDM && (
            <div className="flex items-center gap-1 border-l border-stone-700 pl-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDayChange(-1)}
                className="h-7 w-7 p-0 text-stone-400 hover:text-stone-200 hover:bg-stone-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDayChange(1)}
                className="h-7 w-7 p-0 text-stone-400 hover:text-stone-200 hover:bg-stone-800"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsDialogOpen(true)}
                className="h-7 px-2 text-xs text-stone-400 hover:text-stone-200 hover:bg-stone-800"
              >
                Set
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Set Day Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-800 text-white border-slate-700">
          <DialogHeader>
            <DialogTitle>Set Campaign Day</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Day Number</label>
              <Input
                type="number"
                min="1"
                value={newDay}
                onChange={(e) => setNewDay(e.target.value)}
                placeholder="Enter day number"
                className="bg-slate-900 border-slate-700 text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSetDay()
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsDialogOpen(false)
                  setNewDay('')
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSetDay}>
                Set Day
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
