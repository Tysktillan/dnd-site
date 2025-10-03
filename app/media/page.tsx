'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Music, Image as ImageIcon, Search, Tag, Volume2, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  sourceType: string
  tags: string | null
  category: string
  duration: number | null
  description: string | null
  soundboardSlot: number | null
  createdAt: string
  updatedAt: string
}

type ImageAsset = {
  id: string
  name: string
  url: string
  tags: string | null
  category: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export default function MediaLibraryPage() {
  const [audioAssets, setAudioAssets] = useState<AudioAsset[]>([])
  const [imageAssets, setImageAssets] = useState<ImageAsset[]>([])
  const [activeTab, setActiveTab] = useState<'audio' | 'images'>('audio')
  const [isAudioDialogOpen, setIsAudioDialogOpen] = useState(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [soundboardSlots, setSoundboardSlots] = useState<Set<number>>(new Set())

  const [audioFormData, setAudioFormData] = useState({
    name: '',
    url: '',
    tags: '',
    category: 'ambience',
    duration: '',
    description: '',
    sourceType: 'youtube', // 'youtube' or 'file'
  })
  const [uploadingAudio, setUploadingAudio] = useState(false)

  const [imageFormData, setImageFormData] = useState({
    name: '',
    url: '',
    tags: '',
    category: 'map',
    description: '',
    sourceType: 'url', // 'url' or 'file'
  })
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    fetchAudioAssets()
    fetchImageAssets()
  }, [])

  const fetchAudioAssets = async () => {
    const response = await fetch('/api/media/audio')
    const data = await response.json()
    setAudioAssets(data)

    // Track which soundboard slots are occupied
    const occupied = new Set(
      data.filter((a: AudioAsset) => a.soundboardSlot !== null).map((a: AudioAsset) => a.soundboardSlot)
    )
    setSoundboardSlots(occupied)
  }

  const fetchImageAssets = async () => {
    const response = await fetch('/api/media/images')
    const data = await response.json()
    setImageAssets(data)
  }

  const handleAudioFileUpload = async (file: File) => {
    setUploadingAudio(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload/audio', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      setAudioFormData({ ...audioFormData, url: data.url })
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload audio file')
    } finally {
      setUploadingAudio(false)
    }
  }

  const handleAddAudio = async (e: React.FormEvent) => {
    e.preventDefault()

    await fetch('/api/media/audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: audioFormData.name,
        url: audioFormData.url,
        sourceType: audioFormData.sourceType,
        tags: audioFormData.tags,
        category: audioFormData.category,
        duration: audioFormData.duration ? parseInt(audioFormData.duration) : null,
        description: audioFormData.description,
      }),
    })

    setAudioFormData({
      name: '',
      url: '',
      tags: '',
      category: 'ambience',
      duration: '',
      description: '',
      sourceType: 'youtube',
    })
    setIsAudioDialogOpen(false)
    fetchAudioAssets()
  }

  const handleImageFileUpload = async (file: File) => {
    setUploadingImage(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      setImageFormData({ ...imageFormData, url: data.url })
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault()

    await fetch('/api/media/images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: imageFormData.name,
        url: imageFormData.url,
        tags: imageFormData.tags,
        category: imageFormData.category,
        description: imageFormData.description,
      }),
    })

    setImageFormData({
      name: '',
      url: '',
      tags: '',
      category: 'map',
      description: '',
      sourceType: 'url',
    })
    setIsImageDialogOpen(false)
    fetchImageAssets()
  }

  const deleteAudio = async (id: string) => {
    if (confirm('Delete this audio asset?')) {
      await fetch(`/api/media/audio/${id}`, { method: 'DELETE' })
      fetchAudioAssets()
    }
  }

  const deleteImage = async (id: string) => {
    if (confirm('Delete this image asset?')) {
      await fetch(`/api/media/images/${id}`, { method: 'DELETE' })
      fetchImageAssets()
    }
  }

  const toggleSoundboard = async (asset: AudioAsset) => {
    // If already on soundboard, remove it
    if (asset.soundboardSlot !== null && asset.soundboardSlot !== undefined) {
      await fetch(`/api/media/audio/${asset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soundboardSlot: null }),
      })
      fetchAudioAssets()
      return
    }

    // Check if soundboard is full
    if (soundboardSlots.size >= 25) {
      alert('Soundboard is full! Remove a sound first.')
      return
    }

    // Find next available slot (0-24)
    let nextSlot = 0
    for (let i = 0; i < 25; i++) {
      if (!soundboardSlots.has(i)) {
        nextSlot = i
        break
      }
    }

    await fetch(`/api/media/audio/${asset.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ soundboardSlot: nextSlot }),
    })
    fetchAudioAssets()
  }

  const changeSoundboardSlot = async (asset: AudioAsset, newSlot: number) => {
    // Check if slot is occupied by another sound
    const occupiedByOther = audioAssets.find(
      (a) => a.id !== asset.id && a.soundboardSlot === newSlot
    )

    if (occupiedByOther) {
      // Swap slots
      await Promise.all([
        fetch(`/api/media/audio/${asset.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ soundboardSlot: newSlot }),
        }),
        fetch(`/api/media/audio/${occupiedByOther.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ soundboardSlot: asset.soundboardSlot }),
        }),
      ])
    } else {
      // Just move to empty slot
      await fetch(`/api/media/audio/${asset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soundboardSlot: newSlot }),
      })
    }

    fetchAudioAssets()
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

  const audioCategories = ['ambience', 'music', 'sfx', 'voice']
  const imageCategories = ['map', 'character', 'item', 'location', 'misc']

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Media Library</h1>
        <p className="text-slate-400">Manage your audio and image assets</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <Button
          onClick={() => setActiveTab('audio')}
          variant={activeTab === 'audio' ? 'default' : 'outline'}
          className={activeTab === 'audio' ? 'bg-purple-600' : ''}
        >
          <Music className="h-4 w-4 mr-2" />
          Audio ({audioAssets.length})
        </Button>
        <Button
          onClick={() => setActiveTab('images')}
          variant={activeTab === 'images' ? 'default' : 'outline'}
          className={activeTab === 'images' ? 'bg-purple-600' : ''}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Images ({imageAssets.length})
        </Button>
      </div>

      {/* Filters and Add Button */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, description, or tags..."
            className="pl-10 bg-slate-800 border-slate-700"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48 bg-slate-800 border-slate-700">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">All Categories</SelectItem>
            {(activeTab === 'audio' ? audioCategories : imageCategories).map(cat => (
              <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeTab === 'audio' ? (
          <Dialog open={isAudioDialogOpen} onOpenChange={setIsAudioDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Audio
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 text-white border-slate-700">
              <DialogHeader>
                <DialogTitle>Add Audio Asset</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Add a new audio file to your library
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddAudio} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Name</label>
                  <Input
                    value={audioFormData.name}
                    onChange={(e) => setAudioFormData({ ...audioFormData, name: e.target.value })}
                    className="bg-slate-900 border-slate-700"
                    placeholder="Tavern Ambience"
                    required
                  />
                </div>

                {/* Source Type Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Source</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => setAudioFormData({ ...audioFormData, sourceType: 'youtube', url: '' })}
                      variant={audioFormData.sourceType === 'youtube' ? 'default' : 'outline'}
                      className={`flex-1 ${audioFormData.sourceType === 'youtube' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                    >
                      YouTube
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setAudioFormData({ ...audioFormData, sourceType: 'file', url: '' })}
                      variant={audioFormData.sourceType === 'file' ? 'default' : 'outline'}
                      className={`flex-1 ${audioFormData.sourceType === 'file' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                    >
                      Upload File
                    </Button>
                  </div>
                </div>

                <div>
                  {audioFormData.sourceType === 'youtube' ? (
                    <div>
                      <label className="text-sm font-medium mb-2 block">YouTube URL</label>
                      <Input
                        value={audioFormData.url}
                        onChange={(e) => setAudioFormData({ ...audioFormData, url: e.target.value })}
                        className="bg-slate-900 border-slate-700"
                        placeholder="https://www.youtube.com/watch?v=..."
                        required
                      />
                      <p className="text-xs text-slate-500 mt-1">Enter full YouTube video URL</p>
                    </div>
                  ) : (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Audio File</label>
                      <Input
                        key="file-upload"
                        type="file"
                        accept="audio/*"
                        onChange={(e) => e.target.files?.[0] && handleAudioFileUpload(e.target.files[0])}
                        className="bg-slate-900 border-slate-700"
                        disabled={uploadingAudio}
                      />
                      {uploadingAudio && <p className="text-xs text-purple-400 mt-1">Uploading...</p>}
                      {audioFormData.url && !uploadingAudio && (
                        <p className="text-xs text-green-400 mt-1">✓ File uploaded successfully</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select
                      value={audioFormData.category}
                      onValueChange={(value) => setAudioFormData({ ...audioFormData, category: value })}
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {audioCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Duration (seconds)</label>
                    <Input
                      type="number"
                      value={audioFormData.duration}
                      onChange={(e) => setAudioFormData({ ...audioFormData, duration: e.target.value })}
                      className="bg-slate-900 border-slate-700"
                      placeholder="120"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Tags (comma separated)</label>
                  <Input
                    value={audioFormData.tags}
                    onChange={(e) => setAudioFormData({ ...audioFormData, tags: e.target.value })}
                    className="bg-slate-900 border-slate-700"
                    placeholder="tavern, background, medieval"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    value={audioFormData.description}
                    onChange={(e) => setAudioFormData({ ...audioFormData, description: e.target.value })}
                    className="bg-slate-900 border-slate-700"
                    placeholder="Background ambience for tavern scenes"
                  />
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  Add Asset
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        ) : (
          <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 text-white border-slate-700">
              <DialogHeader>
                <DialogTitle>Add Image Asset</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Add a new image to your library
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddImage} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Name</label>
                  <Input
                    value={imageFormData.name}
                    onChange={(e) => setImageFormData({ ...imageFormData, name: e.target.value })}
                    className="bg-slate-900 border-slate-700"
                    placeholder="Tavern Map"
                    required
                  />
                </div>

                {/* Source Type Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Source</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => setImageFormData({ ...imageFormData, sourceType: 'url', url: '' })}
                      variant={imageFormData.sourceType === 'url' ? 'default' : 'outline'}
                      className={`flex-1 ${imageFormData.sourceType === 'url' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    >
                      URL
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setImageFormData({ ...imageFormData, sourceType: 'file', url: '' })}
                      variant={imageFormData.sourceType === 'file' ? 'default' : 'outline'}
                      className={`flex-1 ${imageFormData.sourceType === 'file' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                    >
                      Upload File
                    </Button>
                  </div>
                </div>

                <div>
                  {imageFormData.sourceType === 'url' ? (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Image URL</label>
                      <Input
                        value={imageFormData.url}
                        onChange={(e) => setImageFormData({ ...imageFormData, url: e.target.value })}
                        className="bg-slate-900 border-slate-700"
                        placeholder="https://..."
                        required
                      />
                      <p className="text-xs text-slate-500 mt-1">Enter full image URL</p>
                    </div>
                  ) : (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Image File</label>
                      <Input
                        key="image-file-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageFileUpload(e.target.files[0])}
                        className="bg-slate-900 border-slate-700"
                        disabled={uploadingImage}
                      />
                      {uploadingImage && <p className="text-xs text-purple-400 mt-1">Uploading...</p>}
                      {imageFormData.url && !uploadingImage && (
                        <p className="text-xs text-green-400 mt-1">✓ File uploaded successfully</p>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select
                    value={imageFormData.category}
                    onValueChange={(value) => setImageFormData({ ...imageFormData, category: value })}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {imageCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Tags (comma separated)</label>
                  <Input
                    value={imageFormData.tags}
                    onChange={(e) => setImageFormData({ ...imageFormData, tags: e.target.value })}
                    className="bg-slate-900 border-slate-700"
                    placeholder="tavern, map, interior"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    value={imageFormData.description}
                    onChange={(e) => setImageFormData({ ...imageFormData, description: e.target.value })}
                    className="bg-slate-900 border-slate-700"
                    placeholder="Map of the Bloody Mary tavern"
                  />
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  Add Asset
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Asset Grid */}
      {activeTab === 'audio' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {filterAssets(audioAssets).map((asset) => (
            <Card key={asset.id} className="p-3 bg-slate-800 border-slate-700">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <Music className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white text-sm truncate">{asset.name}</h3>
                    <p className="text-xs text-slate-400 capitalize">{asset.category}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteAudio(asset.id)}
                  className="h-6 w-6 p-0 hover:bg-red-900/20 flex-shrink-0"
                >
                  <Trash2 className="h-3 w-3 text-red-400" />
                </Button>
              </div>

              {asset.description && (
                <p className="text-xs text-slate-400 mb-2 line-clamp-2">{asset.description}</p>
              )}

              <div className="h-5 mb-2">
                {asset.tags && (
                  <div className="flex flex-wrap gap-1">
                    {asset.tags.split(',').slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-300">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {asset.sourceType === 'youtube' ? (
                <div className="mb-2">
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
                  >
                    ▶ YouTube
                  </a>
                </div>
              ) : (
                <audio src={asset.url} controls className="w-full mb-2 h-8" />
              )}

              {asset.soundboardSlot !== null && asset.soundboardSlot !== undefined ? (
                <div className="flex gap-1">
                  <Select
                    value={asset.soundboardSlot.toString()}
                    onValueChange={(value) => changeSoundboardSlot(asset, parseInt(value))}
                  >
                    <SelectTrigger className="h-8 text-xs flex-1 bg-slate-900 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                      {Array.from({ length: 25 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()} className="text-white text-xs">
                          Slot {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => toggleSoundboard(asset)}
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 hover:bg-red-900/20"
                  >
                    <X className="h-3 w-3 text-red-400" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => toggleSoundboard(asset)}
                  size="sm"
                  className="w-full text-xs h-8 bg-purple-600 hover:bg-purple-700"
                >
                  <Volume2 className="h-3 w-3 mr-1" />
                  Add to Board
                </Button>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filterAssets(imageAssets).map((asset) => (
            <Card key={asset.id} className="overflow-hidden bg-slate-800 border-slate-700">
              <div className="relative aspect-square">
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="w-full h-full object-cover"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteImage(asset.id)}
                  className="absolute top-2 right-2 h-8 w-8 p-0 bg-slate-900/80 hover:bg-red-900/80"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-white text-sm mb-1">{asset.name}</h3>
                <p className="text-xs text-slate-400 capitalize mb-2">{asset.category}</p>
                {asset.tags && (
                  <div className="flex flex-wrap gap-1">
                    {asset.tags.split(',').map((tag, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {((activeTab === 'audio' && filterAssets(audioAssets).length === 0) ||
        (activeTab === 'images' && filterAssets(imageAssets).length === 0)) && (
        <div className="text-center py-12">
          {activeTab === 'audio' ? (
            <Music className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          ) : (
            <ImageIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          )}
          <p className="text-slate-400 mb-2">No {activeTab} assets found</p>
          <p className="text-sm text-slate-500">
            {searchQuery || selectedCategory !== 'all'
              ? 'Try adjusting your filters'
              : `Add your first ${activeTab} asset to get started`}
          </p>
        </div>
      )}
    </div>
  )
}
