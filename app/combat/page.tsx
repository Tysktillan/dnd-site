'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Swords, Plus, Trash2, SkipForward, Save, Users, Skull, Play } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type Initiative = {
  id: string
  name: string
  initiativeRoll: number
  armorClass: number | null
  maxHp: number | null
  damageTaken: number
  isPlayer: boolean
  isActive: boolean
  conditions: string | null
  notes: string | null
  order: number
}

type Combat = {
  id: string
  name: string
  phase: string
  round: number
  isActive: boolean
  outcome: string | null
  notes: string | null
  initiatives: Initiative[]
}

type Player = {
  id: string
  name: string
  maxHp: number | null
  armorClass: number | null
}

export default function CombatPage() {
  const [combats, setCombats] = useState<Combat[]>([])
  const [activeCombat, setActiveCombat] = useState<Combat | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [currentTurn, setCurrentTurn] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAddEnemyOpen, setIsAddEnemyOpen] = useState(false)
  const [newCombatName, setNewCombatName] = useState('')

  // Player initiatives (temporary state during setup)
  const [playerInitiatives, setPlayerInitiatives] = useState<{[key: string]: string}>({})

  // Enemy form
  const [newEnemy, setNewEnemy] = useState({
    name: '',
    initiativeRoll: '',
    armorClass: '',
    maxHp: '',
  })

  useEffect(() => {
    fetchCombats()
    fetchPlayers()
  }, [])

  const fetchCombats = async () => {
    const response = await fetch('/api/combat')
    const data = await response.json()
    setCombats(data)
    const active = data.find((c: Combat) => c.isActive)
    if (active) {
      setActiveCombat(active)
    }
  }

  const fetchPlayers = async () => {
    const response = await fetch('/api/players')
    const data = await response.json()
    setPlayers(data)
  }

  const deleteCombat = async (combatId: string) => {
    if (!confirm('Are you sure you want to delete this combat? This cannot be undone.')) {
      return
    }

    try {
      await fetch(`/api/combat/${combatId}`, {
        method: 'DELETE',
      })
      fetchCombats()
    } catch (error) {
      console.error('Error deleting combat:', error)
      alert('Failed to delete combat. Please try again.')
    }
  }

  const createCombat = async () => {
    const response = await fetch('/api/combat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCombatName }),
    })
    const combat = await response.json()
    setActiveCombat(combat)
    setNewCombatName('')
    setIsDialogOpen(false)
    setPlayerInitiatives({})
    fetchCombats()
  }

  const addPlayerToCombat = async (player: Player, initiative: number) => {
    if (!activeCombat) return

    await fetch(`/api/combat/${activeCombat.id}/initiative`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: player.name,
        initiativeRoll: initiative,
        armorClass: player.armorClass,
        maxHp: player.maxHp,
        isPlayer: true,
      }),
    })
    fetchCombats()
  }

  const addEnemy = async () => {
    if (!activeCombat) return

    await fetch(`/api/combat/${activeCombat.id}/initiative`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newEnemy.name,
        initiativeRoll: parseInt(newEnemy.initiativeRoll),
        armorClass: newEnemy.armorClass ? parseInt(newEnemy.armorClass) : null,
        maxHp: newEnemy.maxHp ? parseInt(newEnemy.maxHp) : null,
        isPlayer: false,
      }),
    })

    setNewEnemy({
      name: '',
      initiativeRoll: '',
      armorClass: '',
      maxHp: '',
    })
    setIsAddEnemyOpen(false)
    fetchCombats()
  }

  const startFight = async () => {
    if (!activeCombat) return

    // Add all players with initiative values
    for (const [playerName, initiative] of Object.entries(playerInitiatives)) {
      if (initiative && parseInt(initiative) > 0) {
        const player = players.find(p => p.name === playerName)
        if (player) {
          await addPlayerToCombat(player, parseInt(initiative))
        }
      }
    }

    // Set combat to active phase
    await fetch(`/api/combat/${activeCombat.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phase: 'active' }),
    })

    setPlayerInitiatives({})
    fetchCombats()
  }

  const addDamage = async (initiativeId: string, currentDamage: number, damageAmount: number) => {
    if (!activeCombat) return
    await fetch(`/api/combat/${activeCombat.id}/initiative/${initiativeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ damageTaken: currentDamage + damageAmount }),
    })
    fetchCombats()
  }

  const healDamage = async (initiativeId: string, currentDamage: number, healAmount: number) => {
    if (!activeCombat) return
    await fetch(`/api/combat/${activeCombat.id}/initiative/${initiativeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ damageTaken: Math.max(0, currentDamage - healAmount) }),
    })
    fetchCombats()
  }

  const removeInitiative = async (initiativeId: string) => {
    if (!activeCombat) return
    await fetch(`/api/combat/${activeCombat.id}/initiative/${initiativeId}`, {
      method: 'DELETE',
    })
    fetchCombats()
  }

  const nextTurn = async () => {
    if (!activeCombat) return
    const sortedInitiatives = getSortedInitiatives()

    const nextTurnIndex = (currentTurn + 1) % sortedInitiatives.length
    setCurrentTurn(nextTurnIndex)

    // If we're back to the first character, increment round
    if (nextTurnIndex === 0 && activeCombat.round) {
      await fetch(`/api/combat/${activeCombat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ round: activeCombat.round + 1 }),
      })
      fetchCombats()
    }
  }

  const endCombat = async (outcome: string) => {
    if (!activeCombat) return
    await fetch(`/api/combat/${activeCombat.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: false, outcome }),
    })
    setActiveCombat(null)
    setCurrentTurn(0)
    fetchCombats()
  }

  const getSortedInitiatives = () => {
    return activeCombat?.initiatives
      ? activeCombat.initiatives
          .filter(i => i.isActive)
          .sort((a, b) => b.initiativeRoll - a.initiativeRoll)
      : []
  }

  const sortedInitiatives = getSortedInitiatives()
  const isSetupPhase = activeCombat?.phase === 'setup'

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Combat Tracker</h1>
          <p className="text-slate-400">Manage initiative and track combat encounters</p>
        </div>
        {!activeCombat && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Swords className="h-4 w-4 mr-2" />
                Start Combat
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 text-white border-slate-700">
              <DialogHeader>
                <DialogTitle>Start New Combat</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Give this encounter a name
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  value={newCombatName}
                  onChange={(e) => setNewCombatName(e.target.value)}
                  placeholder="e.g., Goblin Ambush, Boss Fight"
                  className="bg-slate-900 border-slate-700"
                  autoFocus
                />
                <Button
                  onClick={createCombat}
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={!newCombatName.trim()}
                >
                  Start Combat
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {activeCombat ? (
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-800/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{activeCombat.name}</h2>
                <p className="text-slate-300">
                  {isSetupPhase ? 'Setup Phase - Set Initiatives' : `Round ${activeCombat.round}`}
                </p>
              </div>
              <div className="flex gap-2">
                {isSetupPhase ? (
                  <>
                    <Dialog open={isAddEnemyOpen} onOpenChange={setIsAddEnemyOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-purple-600 hover:bg-purple-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Enemy
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-800 text-white border-slate-700">
                        <DialogHeader>
                          <DialogTitle>Add Enemy</DialogTitle>
                          <DialogDescription className="text-slate-400">
                            Add an enemy to the combat
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Name</label>
                            <Input
                              value={newEnemy.name}
                              onChange={(e) => setNewEnemy({ ...newEnemy, name: e.target.value })}
                              className="bg-slate-900 border-slate-700"
                              placeholder="Goblin, Dragon, etc."
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Initiative</label>
                              <Input
                                type="number"
                                value={newEnemy.initiativeRoll}
                                onChange={(e) => setNewEnemy({ ...newEnemy, initiativeRoll: e.target.value })}
                                className="bg-slate-900 border-slate-700"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">AC</label>
                              <Input
                                type="number"
                                value={newEnemy.armorClass}
                                onChange={(e) => setNewEnemy({ ...newEnemy, armorClass: e.target.value })}
                                className="bg-slate-900 border-slate-700"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">Max HP</label>
                              <Input
                                type="number"
                                value={newEnemy.maxHp}
                                onChange={(e) => setNewEnemy({ ...newEnemy, maxHp: e.target.value })}
                                className="bg-slate-900 border-slate-700"
                              />
                            </div>
                          </div>
                          <Button onClick={addEnemy} className="w-full bg-purple-600 hover:bg-purple-700">
                            Add to Combat
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      onClick={startFight}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Fight
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={nextTurn}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <SkipForward className="h-4 w-4 mr-2" />
                      Next Turn
                    </Button>
                    <Button
                      onClick={() => endCombat('Victory')}
                      variant="outline"
                      className="border-green-700 text-green-400 hover:bg-green-900/20"
                    >
                      Victory
                    </Button>
                    <Button
                      onClick={() => endCombat('Defeat')}
                      variant="outline"
                      className="border-red-700 text-red-400 hover:bg-red-900/20"
                    >
                      Defeat
                    </Button>
                    <Button
                      onClick={() => endCombat('Other')}
                      variant="outline"
                      className="border-slate-600 text-slate-400 hover:bg-slate-700"
                    >
                      End Combat
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Setup Phase - Player Initiative Input */}
            {isSetupPhase && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Party Initiative</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {players.map((player) => (
                    <div key={player.id} className="bg-slate-800 p-3 rounded-lg">
                      <label className="text-sm text-slate-300 mb-1 block">{player.name}</label>
                      <Input
                        type="number"
                        placeholder="Initiative"
                        value={playerInitiatives[player.name] || ''}
                        onChange={(e) => setPlayerInitiatives({
                          ...playerInitiatives,
                          [player.name]: e.target.value
                        })}
                        className="bg-slate-900 border-slate-700"
                      />
                      {player.armorClass && (
                        <p className="text-xs text-slate-500 mt-1">AC: {player.armorClass}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4">
              {isSetupPhase ? 'Enemies' : 'Initiative Order'}
            </h3>
            <div className="space-y-2">
              {isSetupPhase ? (
                // Setup phase - show only enemies
                sortedInitiatives.filter(i => !i.isPlayer).map((init) => (
                  <Card key={init.id} className="p-4 bg-slate-800 border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Skull className="h-5 w-5 text-red-400" />
                        <span className="text-2xl font-bold text-white w-8">
                          {init.initiativeRoll}
                        </span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{init.name}</h4>
                          <div className="flex gap-4 text-sm text-slate-400">
                            <span>AC: {init.armorClass || '—'}</span>
                            <span>HP: {init.maxHp || '—'}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeInitiative(init.id)}
                        className="h-8 w-8 p-0 hover:bg-slate-700"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                // Active phase - show all combatants
                sortedInitiatives.map((init, index) => {
                  const currentHp = (init.maxHp || 0) - init.damageTaken
                  const isDefeated = init.maxHp && currentHp <= 0

                  return (
                    <Card
                      key={init.id}
                      className={`p-4 border ${
                        index === currentTurn
                          ? 'bg-yellow-900/30 border-yellow-600'
                          : isDefeated
                          ? 'bg-slate-900/50 border-slate-800 opacity-60'
                          : 'bg-slate-800 border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-2">
                            {init.isPlayer ? (
                              <Users className="h-5 w-5 text-blue-400" />
                            ) : (
                              <Skull className="h-5 w-5 text-red-400" />
                            )}
                            <span className="text-2xl font-bold text-white w-8">
                              {init.initiativeRoll}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{init.name}</h4>
                            <div className="flex gap-4 text-sm text-slate-400">
                              <span>AC: {init.armorClass || '—'}</span>
                              {init.maxHp && (
                                <span className={isDefeated ? 'text-red-400 font-semibold' : ''}>
                                  HP: {currentHp} / {init.maxHp}
                                  {init.damageTaken > 0 && ` (-${init.damageTaken})`}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {init.maxHp && (
                            <div className="flex gap-1 items-center">
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-slate-400">Dmg:</span>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  className="w-16 h-8 bg-slate-900 border-slate-700 text-center"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const value = parseInt((e.target as HTMLInputElement).value) || 0
                                      if (value > 0) {
                                        addDamage(init.id, init.damageTaken, value)
                                        ;(e.target as HTMLInputElement).value = ''
                                      }
                                    }
                                  }}
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-slate-400">Heal:</span>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  className="w-16 h-8 bg-slate-900 border-slate-700 text-center"
                                  disabled={init.damageTaken === 0}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const value = parseInt((e.target as HTMLInputElement).value) || 0
                                      if (value > 0) {
                                        healDamage(init.id, init.damageTaken, value)
                                        ;(e.target as HTMLInputElement).value = ''
                                      }
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })
              )}
              {sortedInitiatives.length === 0 && isSetupPhase && (
                <p className="text-center text-slate-400 py-8">
                  Set player initiatives above and add enemies to begin
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="text-center py-12">
            <Swords className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No active combat</p>
            <p className="text-sm text-slate-500">Start a new combat encounter to begin tracking initiative</p>
          </div>

          {/* Combat History */}
          {combats.filter(c => !c.isActive).length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-white mb-4">Combat History</h3>
              <div className="space-y-2">
                {combats
                  .filter(c => !c.isActive)
                  .map((combat) => (
                    <Card key={combat.id} className="p-4 bg-stone-950/90 backdrop-blur-xl border-stone-900">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-stone-100">{combat.name}</h4>
                          <p className="text-sm text-stone-500">
                            {combat.initiatives.length} combatants • {combat.round} rounds • {combat.outcome || 'No outcome recorded'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Save className="h-5 w-5 text-stone-600" />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteCombat(combat.id)}
                            className="hover:bg-red-950/30"
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
