'use client'

import { useState } from "react"
import { cn } from "@/lib/utils"

interface EquipmentSlotProps {
  slot: string
  item?: {
    name: string
    description?: string
    stats?: string
    imageUrl?: string
  }
  icon: React.ReactNode
  position: string
  onEdit?: () => void
}

export function EquipmentSlot({ slot, item, icon, position, onEdit }: EquipmentSlotProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div
      className={cn("absolute z-20", position)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={onEdit}
        className={cn(
          "relative w-12 h-12 rounded-lg border-2 transition-all duration-200 overflow-hidden",
          item
            ? "bg-gradient-to-br from-amber-950/40 to-stone-950/60 border-amber-900/50 hover:border-amber-700/70 hover:shadow-lg hover:shadow-amber-900/20"
            : "bg-stone-950/40 border-stone-800 hover:border-stone-700"
        )}
      >
        {item?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-contain p-1"
          />
        ) : (
          <div className="flex items-center justify-center text-stone-400 hover:text-stone-200 transition-colors">
            {icon}
          </div>
        )}
        {item && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-stone-950"></div>
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-[100] w-64 p-3 bg-stone-950 border border-stone-800 rounded-lg shadow-xl pointer-events-none"
          style={{
            left: position.includes('left') ? '100%' : position.includes('right') ? 'auto' : '50%',
            right: position.includes('right') ? '100%' : 'auto',
            top: position.includes('top') ? '100%' : position.includes('bottom') ? 'auto' : '50%',
            bottom: position.includes('bottom') ? '100%' : 'auto',
            transform: position.includes('left') || position.includes('right')
              ? 'translateY(-50%)'
              : 'translateX(-50%)',
            marginLeft: position.includes('left') ? '0.5rem' : '0',
            marginRight: position.includes('right') ? '0.5rem' : '0',
            marginTop: position.includes('top') ? '0.5rem' : '0',
            marginBottom: position.includes('bottom') ? '0.5rem' : '0',
          }}
        >
          <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">{slot}</div>
          {item ? (
            <>
              <div className="text-sm font-semibold text-amber-200 mb-1">{item.name}</div>
              {item.stats && (
                <div className="text-xs text-green-400 mb-1">{item.stats}</div>
              )}
              {item.description && (
                <div className="text-xs text-stone-400 mt-2">{item.description}</div>
              )}
            </>
          ) : (
            <div className="text-sm text-stone-500 italic">Empty slot</div>
          )}
        </div>
      )}
    </div>
  )
}
