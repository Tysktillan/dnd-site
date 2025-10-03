'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Music, Image as ImageIcon, Search, Check } from 'lucide-react'
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

type AudioAsset = {
  id: string
  name: string
  url: string
  tags: string | null
  category: string
  duration: number | null
  description: string | null
}

type ImageAsset = {
  id: string
  name: string
  url: string
  tags: string | null
  category: string
  description: string | null
}

type AssetPickerProps = {
  type: 'audio' | 'image'
  open: boolean
  onClose: () => void
  onSelect: (assetIds: string[]) => void
  selectedIds?: string[]
  multiple?: boolean
}

export default function AssetPicker({ type, open, onClose, onSelect, selectedIds = [], multiple = true }: AssetPickerProps) {
  const [audioAssets, setAudioAssets] = useState<AudioAsset[]>([])
  const [imageAssets, setImageAssets] = useState<ImageAsset[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedIds)

  useEffect(() => {
    if (open) {
      if (type === 'audio') {
        fetchAudioAssets()
      } else {
        fetchImageAssets()
      }
      setLocalSelectedIds(selectedIds)
    }
  }, [open, type, selectedIds])

  const fetchAudioAssets = async () => {
    const response = await fetch('/api/media/audio')
    const data = await response.json()
    setAudioAssets(data)
  }

  const fetchImageAssets = async () => {
    const response = await fetch('/api/media/images')
    const data = await response.json()
    setImageAssets(data)
  }

  const filterAssets = <T extends AudioAsset | ImageAsset>(assets: T[]): T[] => {
    return assets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.tags?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }

  const toggleSelection = (id: string) => {
    if (multiple) {
      setLocalSelectedIds(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      )
    } else {
      setLocalSelectedIds([id])
    }
  }

  const handleConfirm = () => {
    onSelect(localSelectedIds)
    onClose()
  }

  const audioCategories = ['ambience', 'music', 'sfx', 'voice']
  const imageCategories = ['map', 'character', 'item', 'location', 'misc']
  const categories = type === 'audio' ? audioCategories : imageCategories
  const assets = type === 'audio' ? filterAssets(audioAssets) : filterAssets(imageAssets)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select {type === 'audio' ? 'Audio' : 'Image'} Assets</DialogTitle>
          <DialogDescription className="text-slate-400">
            Choose {multiple ? 'one or more' : 'an'} asset{multiple ? 's' : ''} from your library
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, description, or tags..."
              className="pl-10 bg-slate-900 border-slate-700"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48 bg-slate-900 border-slate-700">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Asset Grid */}
        <div className="overflow-y-auto max-h-96 pr-2">
          {type === 'audio' ? (
            <div className="grid grid-cols-1 gap-3">
              {(assets as AudioAsset[]).map((asset) => {
                const isSelected = localSelectedIds.includes(asset.id)
                return (
                  <button
                    key={asset.id}
                    onClick={() => toggleSelection(asset.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-purple-500 bg-purple-900/20'
                        : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-purple-600' : 'bg-green-900/30'
                      }`}>
                        {isSelected ? (
                          <Check className="h-5 w-5 text-white" />
                        ) : (
                          <Music className="h-5 w-5 text-green-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-sm">{asset.name}</h3>
                        <p className="text-xs text-slate-400 capitalize mb-1">{asset.category}</p>
                        {asset.description && (
                          <p className="text-xs text-slate-500">{asset.description}</p>
                        )}
                        {asset.tags && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {asset.tags.split(',').map((tag, idx) => (
                              <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {(assets as ImageAsset[]).map((asset) => {
                const isSelected = localSelectedIds.includes(asset.id)
                return (
                  <button
                    key={asset.id}
                    onClick={() => toggleSelection(asset.id)}
                    className={`rounded-lg border-2 transition-all overflow-hidden ${
                      isSelected
                        ? 'border-purple-500 ring-2 ring-purple-500'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="relative aspect-square">
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-purple-600/40 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                            <Check className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-slate-900">
                      <h3 className="font-semibold text-white text-xs truncate">{asset.name}</h3>
                      <p className="text-xs text-slate-400 capitalize">{asset.category}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {assets.length === 0 && (
            <div className="text-center py-12">
              {type === 'audio' ? (
                <Music className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              ) : (
                <ImageIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              )}
              <p className="text-slate-400 mb-2">No assets found</p>
              <p className="text-sm text-slate-500">Try adjusting your filters or add assets in the Media Library</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <p className="text-sm text-slate-400">
            {localSelectedIds.length} selected
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={localSelectedIds.length === 0}
            >
              Confirm Selection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
