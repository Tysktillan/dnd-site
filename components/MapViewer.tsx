'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import NextImage from 'next/image'

interface MapViewerProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  title: string
}

export function MapViewer({ isOpen, onClose, imageUrl, title }: MapViewerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-stone-800">
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-black/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-stone-100">{title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-stone-400 hover:text-stone-200"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Image */}
          <div className="flex-1 relative overflow-auto p-4">
            <div className="relative w-full h-full min-h-[600px]">
              <NextImage
                src={imageUrl}
                alt={title}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
