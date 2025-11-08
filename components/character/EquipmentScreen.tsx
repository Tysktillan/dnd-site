'use client'

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { EquipmentSlot } from "./EquipmentSlot"
import {
  Crown,
  Wind,
  ShieldIcon,
  Footprints,
  Hand,
  Sword,
  Shield,
  Gem,
  CircleDot,
  User,
  Upload,
  Loader2,
  Image as ImageIcon
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface MagicalItem {
  id: string
  name: string
  slot: string
  rarity: string
  stats?: string | null
  description?: string | null
  imageUrl?: string | null
}

interface Equipment {
  helm?: { name: string; description?: string; stats?: string; imageUrl?: string }
  cloak?: { name: string; description?: string; stats?: string; imageUrl?: string }
  chest?: { name: string; description?: string; stats?: string; imageUrl?: string }
  boots?: { name: string; description?: string; stats?: string; imageUrl?: string }
  gloves?: { name: string; description?: string; stats?: string; imageUrl?: string }
  mainHand?: { name: string; description?: string; stats?: string; imageUrl?: string }
  offHand?: { name: string; description?: string; stats?: string; imageUrl?: string }
  necklace?: { name: string; description?: string; stats?: string; imageUrl?: string }
  ring?: { name: string; description?: string; stats?: string; imageUrl?: string }
}

interface EquipmentScreenProps {
  equipment: Equipment
  avatarUrl?: string
  backgroundUrl?: string
  playerId?: string
  onUpdateEquipment: (equipment: Equipment) => void
  onUpdateAvatar?: (url: string) => void
  onUpdateBackground?: (url: string) => void
  onSave?: (overrides?: Record<string, unknown>) => Promise<void>
}

export function EquipmentScreen({ equipment, avatarUrl, backgroundUrl, playerId, onUpdateEquipment, onUpdateBackground, onSave }: EquipmentScreenProps) {
  const [editingSlot, setEditingSlot] = useState<string | null>(null)
  const [availableItems, setAvailableItems] = useState<MagicalItem[]>([])
  const [uploadingBg, setUploadingBg] = useState(false)
  const [selectedBgFile, setSelectedBgFile] = useState<File | null>(null)
  const [showBgUpload, setShowBgUpload] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [playerId])

  const fetchItems = async () => {
    try {
      const url = playerId ? `/api/items?playerId=${playerId}` : '/api/items'
      const response = await fetch(url)
      if (response.ok) {
        const items = await response.json()
        setAvailableItems(items)
      }
    } catch (error) {
      console.error('Failed to fetch items:', error)
    }
  }

  const handleEditSlot = (slot: keyof Equipment) => {
    setEditingSlot(slot)
  }

  const handleSelectItem = (item: MagicalItem) => {
    if (!editingSlot) return

    const updatedEquipment = {
      ...equipment,
      [editingSlot]: {
        name: item.name,
        description: item.description || undefined,
        stats: item.stats || undefined,
        imageUrl: item.imageUrl || undefined
      }
    }

    onUpdateEquipment(updatedEquipment)
    setEditingSlot(null)
  }

  const handleUnequip = () => {
    if (!editingSlot) return

    const updatedEquipment = {
      ...equipment,
      [editingSlot]: undefined
    }

    onUpdateEquipment(updatedEquipment)
    setEditingSlot(null)
  }

  const handleBgFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB')
      return
    }

    setSelectedBgFile(file)
  }

  const handleBgUpload = async () => {
    if (!selectedBgFile || !onUpdateBackground) return

    try {
      setUploadingBg(true)

      const formData = new FormData()
      formData.append('file', selectedBgFile)

      // Include old URL so the API can delete it
      if (backgroundUrl) {
        formData.append('oldUrl', backgroundUrl)
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      onUpdateBackground(data.url)
      setSelectedBgFile(null)
      setShowBgUpload(false)

      // Auto-save after background upload with the new URL
      if (onSave) {
        await onSave({ backgroundUrl: data.url })
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload background image')
    } finally {
      setUploadingBg(false)
    }
  }

  const getItemsForSlot = (slot: string) => {
    return availableItems.filter(item => item.slot === slot)
  }

  const rarityColors: Record<string, string> = {
    'common': 'text-stone-400 border-stone-700',
    'uncommon': 'text-green-400 border-green-800',
    'rare': 'text-blue-400 border-blue-800',
    'very rare': 'text-purple-400 border-purple-800',
    'legendary': 'text-amber-400 border-amber-800',
    'artifact': 'text-red-400 border-red-800',
  }

  const slots = [
    // Top center
    { key: 'helm' as const, icon: <Crown className="h-6 w-6" />, position: 'top-4 left-1/2 -translate-x-1/2', label: 'Helm' },
    // Left side (top to bottom) - evenly spaced
    { key: 'chest' as const, icon: <ShieldIcon className="h-6 w-6" />, position: 'top-20 left-4', label: 'Chest' },
    { key: 'cloak' as const, icon: <Wind className="h-6 w-6" />, position: 'top-44 left-0', label: 'Cloak' },
    { key: 'boots' as const, icon: <Footprints className="h-6 w-6" />, position: 'top-[272px] left-4', label: 'Boots' },
    // Right side (top to bottom) - evenly spaced
    { key: 'gloves' as const, icon: <Hand className="h-6 w-6" />, position: 'top-20 right-4', label: 'Gloves' },
    { key: 'necklace' as const, icon: <Gem className="h-5 w-5" />, position: 'top-44 right-0', label: 'Necklace' },
    { key: 'ring' as const, icon: <CircleDot className="h-5 w-5" />, position: 'top-[272px] right-4', label: 'Ring' },
    // Bottom center weapons
    { key: 'mainHand' as const, icon: <Sword className="h-6 w-6" />, position: 'bottom-4 left-1/2 -translate-x-1/2 -translate-x-12', label: 'Main Hand' },
    { key: 'offHand' as const, icon: <Shield className="h-5 w-5" />, position: 'bottom-4 left-1/2 -translate-x-1/2 translate-x-4', label: 'Off Hand' },
  ]

  return (
    <>
      <Card className="p-6 bg-stone-950/90 backdrop-blur-xl border-stone-900">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-stone-200 flex items-center gap-2">
            <Sword className="h-5 w-5 text-red-400" />
            Equipment
          </h2>
          {onUpdateBackground && (
            <Button
              onClick={() => setShowBgUpload(true)}
              variant="ghost"
              size="sm"
              className="text-stone-400 hover:text-stone-200"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Change Background
            </Button>
          )}
        </div>

        <div className="relative w-full aspect-square max-w-md mx-auto rounded-lg overflow-visible">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 rounded-lg overflow-hidden"
            style={{
              backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : `url('/character-bg.jpg')`
            }}
          />

          {/* Character Portrait */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border-4 border-stone-800 bg-stone-900 overflow-hidden shadow-2xl z-10">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Character" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-700">
                <User className="h-20 w-20" />
              </div>
            )}
          </div>

          {/* Equipment Slots */}
          {slots.map((slot) => (
            <EquipmentSlot
              key={slot.key}
              slot={slot.label}
              item={equipment[slot.key]}
              icon={slot.icon}
              position={slot.position}
              onEdit={() => handleEditSlot(slot.key)}
            />
          ))}
        </div>
      </Card>

      {/* Select Item Dialog */}
      <Dialog open={!!editingSlot} onOpenChange={(open) => !open && setEditingSlot(null)}>
        <DialogContent className="bg-stone-950 border-stone-800 text-stone-100 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-stone-100">
              Equip {editingSlot && slots.find(s => s.key === editingSlot)?.label}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {editingSlot && getItemsForSlot(editingSlot).length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {getItemsForSlot(editingSlot).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className={`p-4 rounded-lg border-2 ${rarityColors[item.rarity]} bg-stone-900/50 hover:bg-stone-900 transition-all text-left`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-semibold ${rarityColors[item.rarity].split(' ')[0]}`}>
                        {item.name}
                      </h3>
                      <span className="text-xs uppercase tracking-wider opacity-70">
                        {item.rarity}
                      </span>
                    </div>
                    {item.stats && (
                      <p className="text-sm text-green-400 mb-2">{item.stats}</p>
                    )}
                    {item.description && (
                      <p className="text-xs text-stone-400">{item.description}</p>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-stone-500">
                <p>No items available for this slot</p>
                <p className="text-xs mt-2">Ask your DM to create items</p>
              </div>
            )}

            {equipment[editingSlot as keyof Equipment] && (
              <Button
                onClick={handleUnequip}
                variant="ghost"
                className="w-full text-red-400 hover:text-red-300 hover:bg-red-950/20"
              >
                Unequip Current Item
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Background Upload Dialog */}
      <Dialog open={showBgUpload} onOpenChange={(open) => !open && setShowBgUpload(false)}>
        <DialogContent className="bg-stone-950 border-stone-800 text-stone-100">
          <DialogHeader>
            <DialogTitle className="text-stone-100">Change Equipment Background</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="flex items-center justify-center w-full p-8 border-2 border-dashed border-stone-800 rounded-lg hover:border-stone-700 cursor-pointer transition-colors bg-stone-900/50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBgFileSelect}
                  className="hidden"
                />
                <div className="text-center">
                  <Upload className="h-12 w-12 mx-auto mb-3 text-stone-500" />
                  <p className="text-sm text-stone-400">
                    {selectedBgFile ? selectedBgFile.name : 'Click to upload background image'}
                  </p>
                  <p className="text-xs text-stone-600 mt-2">
                    Recommended: 512x512px square image (max 5MB)
                  </p>
                </div>
              </label>
            </div>

            {selectedBgFile && (
              <div className="flex gap-2">
                <Button
                  onClick={handleBgUpload}
                  disabled={uploadingBg}
                  className="flex-1 bg-red-950 hover:bg-red-900 border border-red-900/50 text-stone-100"
                >
                  {uploadingBg ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Background
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setSelectedBgFile(null)
                    setShowBgUpload(false)
                  }}
                  variant="ghost"
                  className="text-stone-400 hover:text-stone-200"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
