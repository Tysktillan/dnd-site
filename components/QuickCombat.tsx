'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { X, GripVertical, Plus, Swords, Heart, Shield, Trash2, Play } from 'lucide-react'

type Initiative = {
  id: string
  name: string
  initiativeRoll: number
  armorClass: number | null
  maxHp: number | null
  damageTaken: number
  isPlayer: boolean
  isActive: boolean
  order: number
}

type Combat = {
  id: string
  name: string
  round: number
  phase: string
  initiatives: Initiative[]
}

export function QuickCombat({ onClose }: { onClose: () => void }) {
  const [combat, setCombat] = useState<Combat | null>(null)
  const [position, setPosition] = useState({ x: window.innerWidth - 450, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [newCombatName, setNewCombatName] = useState('')
  const [showNewCombat, setShowNewCombat] = useState(false)
  const [newInitiative, setNewInitiative] = useState({
    name: '',
    initiativeRoll: '',
    armorClass: '',
    maxHp: '',
    isPlayer: false
  })
  const [showAddInitiative, setShowAddInitiative] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    fetchActiveCombat()
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

  const fetchActiveCombat = async () => {
    try {
      const response = await fetch('/api/combat')
      const data = await response.json()
      const activeCombat = data.find((c: Combat) => c.phase === 'active')

      if (activeCombat) {
        // Fetch initiatives for this combat
        const initResponse = await fetch(`/api/combat/${activeCombat.id}/initiative`)
        const initiatives = await initResponse.json()
        setCombat({ ...activeCombat, initiatives })
      } else {
        setCombat(null)
      }
    } catch (error) {
      console.error('Error fetching combat:', error)
    }
  }

  const createCombat = async () => {
    if (!newCombatName.trim()) return

    try {
      const response = await fetch('/api/combat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCombatName,
          phase: 'active'
        }),
      })
      const newCombat = await response.json()
      setCombat({ ...newCombat, initiatives: [] })
      setNewCombatName('')
      setShowNewCombat(false)
    } catch (error) {
      console.error('Error creating combat:', error)
    }
  }

  const addInitiative = async () => {
    if (!combat || !newInitiative.name.trim() || !newInitiative.initiativeRoll) return

    try {
      await fetch(`/api/combat/${combat.id}/initiative`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newInitiative.name,
          initiativeRoll: parseInt(newInitiative.initiativeRoll),
          armorClass: newInitiative.armorClass ? parseInt(newInitiative.armorClass) : null,
          maxHp: newInitiative.maxHp ? parseInt(newInitiative.maxHp) : null,
          damageTaken: 0,
          isPlayer: newInitiative.isPlayer,
        }),
      })

      setNewInitiative({
        name: '',
        initiativeRoll: '',
        armorClass: '',
        maxHp: '',
        isPlayer: false
      })
      setShowAddInitiative(false)
      fetchActiveCombat()
    } catch (error) {
      console.error('Error adding initiative:', error)
    }
  }

  const updateDamage = async (initiativeId: string, newDamage: number) => {
    if (!combat) return

    try {
      await fetch(`/api/combat/${combat.id}/initiative/${initiativeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ damageTaken: Math.max(0, newDamage) }),
      })
      fetchActiveCombat()
    } catch (error) {
      console.error('Error updating damage:', error)
    }
  }

  const deleteInitiative = async (initiativeId: string) => {
    if (!combat) return

    try {
      await fetch(`/api/combat/${combat.id}/initiative/${initiativeId}`, {
        method: 'DELETE',
      })
      fetchActiveCombat()
    } catch (error) {
      console.error('Error deleting initiative:', error)
    }
  }

  const nextRound = async () => {
    if (!combat) return

    try {
      await fetch(`/api/combat/${combat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ round: combat.round + 1 }),
      })
      fetchActiveCombat()
    } catch (error) {
      console.error('Error advancing round:', error)
    }
  }

  const endCombat = async () => {
    if (!combat) return

    try {
      await fetch(`/api/combat/${combat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: 'setup', isActive: false }),
      })
      setCombat(null)
    } catch (error) {
      console.error('Error ending combat:', error)
    }
  }

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

  const getCurrentHp = (init: Initiative) => {
    if (!init.maxHp) return null
    return Math.max(0, init.maxHp - init.damageTaken)
  }

  return (
    <Card
      ref={panelRef}
      className="fixed bg-stone-950/95 backdrop-blur-xl border-stone-900 shadow-2xl select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '400px',
        maxHeight: '80vh',
        zIndex: 100,
      }}
    >
      {/* Header with drag handle */}
      <div
        className="flex items-center justify-between p-3 border-b border-stone-900 cursor-move bg-gradient-to-r from-red-950/50 to-transparent"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-stone-500" />
          <Swords className="h-4 w-4 text-red-400" />
          <h3 className="font-semibold text-stone-100 text-sm">Quick Combat</h3>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          className="h-6 w-6 p-0 hover:bg-stone-900"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 60px)' }}>
        {!combat ? (
          <div className="p-4 space-y-3">
            {!showNewCombat ? (
              <Button
                onClick={() => setShowNewCombat(true)}
                className="w-full bg-gradient-to-r from-red-950 via-red-900 to-red-950 hover:from-red-900 hover:via-red-800 hover:to-red-900"
              >
                <Play className="h-4 w-4 mr-2" />
                Start New Combat
              </Button>
            ) : (
              <div className="space-y-2">
                <Input
                  value={newCombatName}
                  onChange={(e) => setNewCombatName(e.target.value)}
                  placeholder="Combat name..."
                  className="bg-black/50 border-stone-900"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && createCombat()}
                />
                <div className="flex gap-2">
                  <Button onClick={createCombat} size="sm" className="flex-1 bg-green-900 hover:bg-green-800">
                    Create
                  </Button>
                  <Button onClick={() => setShowNewCombat(false)} size="sm" variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            <p className="text-xs text-stone-600 text-center">No active combat</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {/* Combat header */}
            <div className="flex items-center justify-between pb-2 border-b border-stone-900">
              <div>
                <h4 className="font-bold text-stone-100">{combat.name}</h4>
                <p className="text-xs text-stone-500">Round {combat.round}</p>
              </div>
              <div className="flex gap-1">
                <Button onClick={nextRound} size="sm" className="bg-stone-900 hover:bg-stone-800 text-xs">
                  Next Round
                </Button>
                <Button onClick={endCombat} size="sm" variant="outline" className="text-xs border-red-900 text-red-400 hover:bg-red-950/30">
                  End
                </Button>
              </div>
            </div>

            {/* Add initiative button */}
            {!showAddInitiative ? (
              <Button
                onClick={() => setShowAddInitiative(true)}
                size="sm"
                className="w-full bg-stone-900 hover:bg-stone-800"
              >
                <Plus className="h-3 w-3 mr-2" />
                Add Combatant
              </Button>
            ) : (
              <div className="space-y-2 p-3 bg-black/30 rounded-lg border border-stone-900">
                <Input
                  value={newInitiative.name}
                  onChange={(e) => setNewInitiative({ ...newInitiative, name: e.target.value })}
                  placeholder="Name"
                  className="bg-black/50 border-stone-900 text-sm"
                  autoFocus
                />
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    type="number"
                    value={newInitiative.initiativeRoll}
                    onChange={(e) => setNewInitiative({ ...newInitiative, initiativeRoll: e.target.value })}
                    placeholder="Init"
                    className="bg-black/50 border-stone-900 text-sm"
                  />
                  <Input
                    type="number"
                    value={newInitiative.armorClass}
                    onChange={(e) => setNewInitiative({ ...newInitiative, armorClass: e.target.value })}
                    placeholder="AC"
                    className="bg-black/50 border-stone-900 text-sm"
                  />
                  <Input
                    type="number"
                    value={newInitiative.maxHp}
                    onChange={(e) => setNewInitiative({ ...newInitiative, maxHp: e.target.value })}
                    placeholder="HP"
                    className="bg-black/50 border-stone-900 text-sm"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs text-stone-400">
                  <input
                    type="checkbox"
                    checked={newInitiative.isPlayer}
                    onChange={(e) => setNewInitiative({ ...newInitiative, isPlayer: e.target.checked })}
                    className="rounded"
                  />
                  Player Character
                </label>
                <div className="flex gap-2">
                  <Button onClick={addInitiative} size="sm" className="flex-1 bg-green-900 hover:bg-green-800">
                    Add
                  </Button>
                  <Button onClick={() => setShowAddInitiative(false)} size="sm" variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Initiative list */}
            <div className="space-y-2">
              {combat.initiatives
                .sort((a, b) => b.initiativeRoll - a.initiativeRoll)
                .map((init, index) => {
                  const currentHp = getCurrentHp(init)
                  const isDead = currentHp !== null && currentHp <= 0

                  return (
                    <div
                      key={init.id}
                      className={`p-2 rounded-lg border transition-all ${
                        isDead
                          ? 'bg-stone-950/50 border-stone-900 opacity-50'
                          : index === 0
                          ? 'bg-red-950/30 border-red-900/50 shadow-lg'
                          : 'bg-stone-900/50 border-stone-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${index === 0 ? 'text-red-400' : 'text-stone-500'}`}>
                              {init.initiativeRoll}
                            </span>
                            <span className={`text-sm font-medium truncate ${isDead ? 'line-through text-stone-600' : 'text-stone-200'}`}>
                              {init.name}
                              {init.isPlayer && <span className="text-xs text-blue-400 ml-1">(PC)</span>}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            {init.armorClass !== null && (
                              <div className="flex items-center gap-1 text-xs text-stone-500">
                                <Shield className="h-3 w-3" />
                                {init.armorClass}
                              </div>
                            )}
                            {init.maxHp !== null && (
                              <div className="flex items-center gap-1 text-xs">
                                <Heart className={`h-3 w-3 ${isDead ? 'text-stone-700' : 'text-red-400'}`} />
                                <span className={isDead ? 'text-stone-600' : 'text-stone-400'}>
                                  {currentHp}/{init.maxHp}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {init.maxHp !== null && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateDamage(init.id, init.damageTaken + 5)}
                                className="h-6 w-6 p-0 text-xs border-stone-800 hover:bg-red-950/30"
                              >
                                -5
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateDamage(init.id, init.damageTaken - 5)}
                                className="h-6 w-6 p-0 text-xs border-stone-800 hover:bg-green-950/30"
                              >
                                +5
                              </Button>
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteInitiative(init.id)}
                            className="h-6 w-6 p-0 hover:bg-red-950/30"
                          >
                            <Trash2 className="h-3 w-3 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              {combat.initiatives.length === 0 && (
                <p className="text-xs text-stone-600 text-center py-4">No combatants yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
