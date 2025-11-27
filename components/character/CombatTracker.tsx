'use client'

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NumberInput } from "@/components/ui/number-input"
import { Label } from "@/components/ui/label"
import { Shield, Sun, Plus, Minus } from "lucide-react"

interface CombatLog {
  type: 'damage' | 'heal' | 'long_rest'
  amount: number
  timestamp: Date
}

interface CombatTrackerProps {
  currentHp: number
  maxHp: number
  onUpdateHp: (newHp: number) => void
}

export function CombatTracker({ currentHp, maxHp, onUpdateHp }: CombatTrackerProps) {
  const [amount, setAmount] = useState(0)
  const [log, setLog] = useState<CombatLog[]>([])

  const addToLog = (type: CombatLog['type'], amount: number) => {
    setLog(prev => [{ type, amount, timestamp: new Date() }, ...prev.slice(0, 9)])
  }

  const handleDamage = () => {
    if (amount <= 0) return
    const newHp = Math.max(0, currentHp - amount)
    onUpdateHp(newHp)
    addToLog('damage', amount)
    setAmount(0)
  }

  const handleHeal = () => {
    if (amount <= 0) return
    const newHp = Math.min(maxHp, currentHp + amount)
    onUpdateHp(newHp)
    addToLog('heal', amount)
    setAmount(0)
  }

  const handleLongRest = () => {
    // Long rest: Restore all HP
    onUpdateHp(maxHp)
    addToLog('long_rest', maxHp - currentHp)
  }

  const getLogIcon = (type: CombatLog['type']) => {
    switch (type) {
      case 'damage': return <Minus className="h-3 w-3 text-red-400" />
      case 'heal': return <Plus className="h-3 w-3 text-green-400" />
      case 'long_rest': return <Sun className="h-3 w-3 text-amber-400" />
    }
  }

  const getLogText = (entry: CombatLog) => {
    switch (entry.type) {
      case 'damage': return `Tog ${entry.amount} skada`
      case 'heal': return `Läkte ${entry.amount} HP`
      case 'long_rest': return `Long rest: Fullt HP`
    }
  }

  const getLogColor = (type: CombatLog['type']) => {
    switch (type) {
      case 'damage': return 'text-red-400'
      case 'heal': return 'text-green-400'
      case 'long_rest': return 'text-amber-400'
    }
  }

  const hpPercentage = (currentHp / maxHp) * 100
  const hpBarColor = hpPercentage > 50 ? 'bg-green-600' : hpPercentage > 25 ? 'bg-amber-600' : 'bg-red-600'

  return (
    <Card className="p-6 bg-stone-950/90 backdrop-blur-xl border-stone-900">
      <h2 className="text-lg font-bold text-stone-200 mb-4 flex items-center gap-2">
        <Shield className="h-5 w-5 text-red-400" />
        Stridsspårare
      </h2>

      {/* HP Display */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-stone-400">Hälsopoäng</span>
          <span className="text-2xl font-bold text-stone-100">
            {currentHp} / {maxHp}
          </span>
        </div>
        <div className="w-full h-4 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
          <div
            className={`h-full transition-all duration-300 ${hpBarColor}`}
            style={{ width: `${hpPercentage}%` }}
          />
        </div>
      </div>

      {/* Damage/Heal Controls */}
      <div className="space-y-3 mb-6">
        <div>
          <Label className="text-xs text-stone-500 uppercase tracking-wider mb-2 block">Mängd</Label>
          <NumberInput
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
            className="bg-stone-900 border-stone-800 text-stone-100"
            min={0}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleDamage}
            disabled={amount <= 0}
            className="bg-red-950 hover:bg-red-900 border border-red-900/50 text-stone-100"
          >
            <Minus className="h-4 w-4 mr-2" />
            Ta Skada
          </Button>
          <Button
            onClick={handleHeal}
            disabled={amount <= 0 || currentHp >= maxHp}
            className="bg-green-950 hover:bg-green-900 border border-green-900/50 text-stone-100"
          >
            <Plus className="h-4 w-4 mr-2" />
            Hela
          </Button>
        </div>
      </div>

      {/* Rest Button */}
      <div className="mb-6">
        <Button
          onClick={handleLongRest}
          variant="ghost"
          className="w-full text-amber-400 hover:text-amber-300 hover:bg-amber-950/20 border border-amber-900/30"
        >
          <Sun className="h-4 w-4 mr-2" />
          Long Rest
        </Button>
      </div>

      {/* Combat Log */}
      {log.length > 0 && (
        <div>
          <Label className="text-xs text-stone-500 uppercase tracking-wider mb-2 block">Senaste Historik</Label>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {log.map((entry, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs p-2 bg-black/30 rounded border border-stone-800/50"
              >
                {getLogIcon(entry.type)}
                <span className={getLogColor(entry.type)}>{getLogText(entry)}</span>
                <span className="text-stone-600 ml-auto">
                  {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
