'use client'

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MagicalItem } from "@prisma/client"
import { Plus, Edit, Trash2, Save, X, Sparkles, Upload, Loader2, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"

interface ItemsManagementProps {
  items: MagicalItem[]
}

interface Player {
  id: string
  name: string
}

const SLOTS = [
  { value: 'helm', label: 'Helm' },
  { value: 'necklace', label: 'Necklace' },
  { value: 'cloak', label: 'Cloak' },
  { value: 'chest', label: 'Chest' },
  { value: 'gloves', label: 'Gloves' },
  { value: 'mainHand', label: 'Main Hand' },
  { value: 'offHand', label: 'Off Hand' },
  { value: 'ring', label: 'Ring' },
  { value: 'boots', label: 'Boots' },
]

const RARITIES = [
  { value: 'common', label: 'Common', color: 'text-stone-400' },
  { value: 'uncommon', label: 'Uncommon', color: 'text-green-400' },
  { value: 'rare', label: 'Rare', color: 'text-blue-400' },
  { value: 'very rare', label: 'Very Rare', color: 'text-purple-400' },
  { value: 'legendary', label: 'Legendary', color: 'text-amber-400' },
  { value: 'artifact', label: 'Artifact', color: 'text-red-400' },
]

export default function ItemsManagement({ items: initialItems }: ItemsManagementProps) {
  const router = useRouter()
  const [editingItem, setEditingItem] = useState<MagicalItem | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [formData, setFormData] = useState({
    name: '',
    slot: 'helm',
    rarity: 'common',
    stats: '',
    description: '',
    imageUrl: '',
    isPublished: false,
    visibleToPlayerIds: [] as string[],
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players')
      if (response.ok) {
        const data = await response.json()
        setPlayers(data)
      }
    } catch (error) {
      console.error('Failed to fetch players:', error)
    }
  }

  const handleCreate = () => {
    setIsCreating(true)
    setFormData({
      name: '',
      slot: 'helm',
      rarity: 'common',
      stats: '',
      description: '',
      imageUrl: '',
      isPublished: false,
      visibleToPlayerIds: [],
    })
    setSelectedFile(null)
    setPreviewUrl('')
  }

  const handleEdit = (item: MagicalItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      slot: item.slot,
      rarity: item.rarity,
      stats: item.stats || '',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      isPublished: item.isPublished || false,
      visibleToPlayerIds: item.visibleToPlayerIds ? item.visibleToPlayerIds.split(',').map(id => id.trim()) : [],
    })
    setSelectedFile(null)
    setPreviewUrl(item.imageUrl || '')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be smaller than 2MB')
      return
    }

    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return null

    try {
      setUploading(true)

      const formDataToSend = new FormData()
      formDataToSend.append('file', selectedFile)

      // If editing an item with an existing image, include the old URL for deletion
      if (editingItem?.imageUrl) {
        formDataToSend.append('oldUrl', editingItem.imageUrl)
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    try {
      let imageUrl = formData.imageUrl

      // Upload file if one is selected
      if (selectedFile) {
        const uploadedUrl = await uploadImage()
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        } else {
          return // Upload failed
        }
      }

      const url = editingItem
        ? `/api/items/${editingItem.id}`
        : '/api/items'

      const response = await fetch(url, {
        method: editingItem ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          imageUrl,
          visibleToPlayerIds: formData.visibleToPlayerIds.length > 0 ? formData.visibleToPlayerIds.join(',') : null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Failed to save item')
      }

      setEditingItem(null)
      setIsCreating(false)
      setSelectedFile(null)
      setPreviewUrl('')
      router.refresh()
    } catch (error) {
      console.error('Error saving item:', error)
      alert('Failed to save item')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete item')

      router.refresh()
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item')
    }
  }

  const handleCancel = () => {
    setEditingItem(null)
    setIsCreating(false)
    setSelectedFile(null)
    setPreviewUrl('')
  }

  const groupedItems = SLOTS.reduce((acc, slot) => {
    acc[slot.value] = initialItems.filter(item => item.slot === slot.value)
    return acc
  }, {} as Record<string, MagicalItem[]>)

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-xl md:text-2xl lg:text-3xl lg:text-4xl font-black tracking-tighter mb-2">
            <span className="bg-gradient-to-b from-stone-100 via-stone-300 to-red-900 bg-clip-text text-transparent">
              Magical Items
            </span>
          </h1>
          <p className="text-stone-400">Create and manage items for your players</p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-red-950 hover:bg-red-900 border border-red-900/50 text-stone-100"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Item
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingItem) && (
        <Card className="p-6 bg-stone-950/90 backdrop-blur-xl border-amber-900/50 mb-6">
          <h2 className="text-lg font-bold text-stone-200 mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            {editingItem ? 'Edit Item' : 'Create New Item'}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-stone-400 mb-2 block">Item Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Vorpal Sword, Cloak of Elvenkind"
                className="bg-stone-900 border-stone-800 text-stone-100"
              />
            </div>
            <div>
              <Label className="text-xs text-stone-400 mb-2 block">Equipment Slot</Label>
              <select
                value={formData.slot}
                onChange={(e) => setFormData(prev => ({ ...prev, slot: e.target.value }))}
                className="w-full h-9 px-3 rounded-md bg-stone-900 border border-stone-800 text-stone-100 text-sm"
              >
                {SLOTS.map(slot => (
                  <option key={slot.value} value={slot.value}>{slot.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs text-stone-400 mb-2 block">Rarity</Label>
              <select
                value={formData.rarity}
                onChange={(e) => setFormData(prev => ({ ...prev, rarity: e.target.value }))}
                className="w-full h-9 px-3 rounded-md bg-stone-900 border border-stone-800 text-stone-100 text-sm"
              >
                {RARITIES.map(rarity => (
                  <option key={rarity.value} value={rarity.value}>{rarity.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs text-stone-400 mb-2 block">Stats/Bonuses</Label>
              <Input
                value={formData.stats}
                onChange={(e) => setFormData(prev => ({ ...prev, stats: e.target.value }))}
                placeholder="e.g., +2 AC, +1d6 Fire Damage"
                className="bg-stone-900 border-stone-800 text-stone-100"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs text-stone-400 mb-2 block">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Item description and magical properties..."
                rows={4}
                className="bg-stone-900 border-stone-800 text-stone-100 resize-none"
              />
            </div>

            {/* Visibility Settings */}
            <div className="col-span-2">
              <div className="p-4 bg-stone-900/50 border border-stone-800 rounded-lg space-y-4">
                {/* Published Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {formData.isPublished ? (
                      <Eye className="h-4 w-4 text-green-400" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-stone-500" />
                    )}
                    <div>
                      <Label className="text-sm text-stone-200 font-medium">Published</Label>
                      <p className="text-xs text-stone-500">
                        {formData.isPublished ? 'Visible to players' : 'Draft - only you can see'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
                  />
                </div>

                {/* Player Restriction */}
                {formData.isPublished && players.length > 0 && (
                  <div className="pt-3 border-t border-stone-800">
                    <Label className="text-xs text-stone-400 mb-2 block">Restrict to specific players (optional)</Label>
                    <p className="text-xs text-stone-600 mb-3">Leave all unchecked to show to everyone</p>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {players.map(player => (
                        <div key={player.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`player-${player.id}`}
                            checked={formData.visibleToPlayerIds.includes(player.id)}
                            onCheckedChange={(checked) => {
                              setFormData(prev => ({
                                ...prev,
                                visibleToPlayerIds: checked
                                  ? [...prev.visibleToPlayerIds, player.id]
                                  : prev.visibleToPlayerIds.filter(id => id !== player.id)
                              }))
                            }}
                          />
                          <label
                            htmlFor={`player-${player.id}`}
                            className="text-xs text-stone-300 cursor-pointer truncate"
                          >
                            {player.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="col-span-2">
              <Label className="text-xs text-stone-400 mb-2 block">
                Item Icon (Recommended: 64x64 pixels)
              </Label>
              <div className="space-y-3">
                {/* File Upload */}
                <div>
                  <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-stone-800 rounded-lg hover:border-stone-700 cursor-pointer transition-colors bg-stone-900/50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-stone-500" />
                      <p className="text-sm text-stone-400">
                        {selectedFile ? selectedFile.name : 'Click to upload icon'}
                      </p>
                      <p className="text-xs text-stone-600 mt-1">PNG, JPG, or SVG (max 2MB)</p>
                    </div>
                  </label>
                </div>

                {/* OR divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-stone-800"></div>
                  <span className="text-xs text-stone-600">OR</span>
                  <div className="flex-1 h-px bg-stone-800"></div>
                </div>

                {/* URL Input */}
                <div>
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, imageUrl: e.target.value }))
                      setSelectedFile(null)
                      setPreviewUrl(e.target.value)
                    }}
                    placeholder="https://... (external URL)"
                    className="bg-stone-900 border-stone-800 text-stone-100"
                  />
                </div>

                {/* Preview */}
                {previewUrl && (
                  <div className="flex items-center gap-3 p-3 bg-black/30 border border-stone-800 rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-16 h-16 object-contain rounded border border-stone-700"
                    />
                    <div className="flex-1">
                      <p className="text-xs text-stone-400">Preview</p>
                      <p className="text-xs text-stone-600 mt-1">Icon will appear in equipment slots</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleSave}
              disabled={uploading}
              className="bg-red-950 hover:bg-red-900 border border-red-900/50 text-stone-100"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Item
                </>
              )}
            </Button>
            <Button
              onClick={handleCancel}
              variant="ghost"
              className="text-stone-400 hover:text-stone-200"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Items List by Slot */}
      <div className="space-y-6">
        {SLOTS.map(slot => (
          <div key={slot.value}>
            <h2 className="text-xl font-bold text-stone-200 mb-3">{slot.label}</h2>
            {groupedItems[slot.value].length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedItems[slot.value].map(item => {
                  const rarityColor = RARITIES.find(r => r.value === item.rarity)?.color || 'text-stone-400'
                  return (
                    <Card key={item.id} className="p-4 bg-stone-950/90 backdrop-blur-xl border-stone-900 hover:border-amber-900/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${rarityColor}`}>{item.name}</h3>
                            {item.isPublished ? (
                              <Eye className="h-3 w-3 text-green-400" />
                            ) : (
                              <EyeOff className="h-3 w-3 text-stone-600" />
                            )}
                          </div>
                          <p className="text-xs text-stone-500 uppercase tracking-wider">{item.rarity}</p>
                          {item.visibleToPlayerIds && (
                            <p className="text-xs text-amber-600 mt-1">
                              Restricted to {item.visibleToPlayerIds.split(',').length} player(s)
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(item)}
                            className="h-8 w-8 p-0 text-stone-400 hover:text-stone-200"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(item.id)}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {item.stats && (
                        <p className="text-sm text-green-400 mb-2">{item.stats}</p>
                      )}
                      {item.description && (
                        <p className="text-xs text-stone-400 line-clamp-2">{item.description}</p>
                      )}
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="p-6 bg-stone-950/90 backdrop-blur-xl border-stone-900 text-center">
                <p className="text-sm text-stone-500">No items for this slot</p>
              </Card>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
