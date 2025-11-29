'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface MapViewerProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  title: string
}

export function MapViewer({ isOpen, onClose, imageUrl, title }: MapViewerProps) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 left-64 z-50 bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-black/50 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-stone-100">{title}</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-stone-800/50 transition-colors text-stone-400 hover:text-stone-200"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Image - Full width, scrollable */}
      <div className="flex-1 overflow-auto p-4 flex items-start justify-center">
        <img
          src={imageUrl}
          alt={title}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  )
}
