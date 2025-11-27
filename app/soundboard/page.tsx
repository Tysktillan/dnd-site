'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Music, Plus, Trash2, Play, Pause, Volume2 } from 'lucide-react'
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

type Sound = {
  id: string
  name: string
  category: string
  url: string
  duration: number | null
}

export default function SoundboardPage() {
  const [sounds, setSounds] = useState<Sound[]>([])
  const [filterCategory, setFilterCategory] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'music',
    url: '',
  })
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const categories = ['music', 'ambience', 'sfx']

  useEffect(() => {
    fetchSounds()
  }, [])

  const fetchSounds = async () => {
    const response = await fetch('/api/sounds')
    const data = await response.json()
    setSounds(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await fetch('/api/sounds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    setFormData({ name: '', category: 'music', url: '' })
    setIsDialogOpen(false)
    fetchSounds()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Är du säker på att du vill ta bort detta ljud?')) {
      await fetch(`/api/sounds/${id}`, { method: 'DELETE' })
      if (currentlyPlaying === id) {
        audioRef.current?.pause()
        setCurrentlyPlaying(null)
      }
      fetchSounds()
    }
  }

  const togglePlay = (sound: Sound) => {
    if (currentlyPlaying === sound.id) {
      audioRef.current?.pause()
      setCurrentlyPlaying(null)
    } else {
      if (audioRef.current) {
        audioRef.current.src = sound.url
        audioRef.current.play()
        setCurrentlyPlaying(sound.id)
      }
    }
  }

  const filteredSounds = sounds.filter(sound =>
    filterCategory === 'all' || sound.category === filterCategory
  )

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'music':
        return 'text-purple-400'
      case 'ambience':
        return 'text-blue-400'
      case 'sfx':
        return 'text-green-400'
      default:
        return 'text-slate-400'
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">Ljudbord</h1>
          <p className="text-slate-400">Hantera musik, atmosfär och ljudeffekter för dina sessioner</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Lägg till Ljud
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 text-white border-slate-700">
            <DialogHeader>
              <DialogTitle>Lägg till Nytt Ljud</DialogTitle>
              <DialogDescription className="text-slate-400">
                Lägg till en ljudfil till ditt ljudbord
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Namn</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-900 border-slate-700"
                  placeholder="Episk Stridmusik"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Kategori</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat} className="text-white">
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Ljud URL</label>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="bg-slate-900 border-slate-700"
                  placeholder="https://example.com/audio.mp3"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Ange en URL till en ljudfil (MP3, WAV, etc.)
                </p>
              </div>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                Lägg till Ljud
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[200px] bg-slate-800 border-slate-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-white">Alla Kategorier</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat} className="text-white">
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSounds.map((sound) => (
          <Card key={sound.id} className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`p-2 rounded-lg bg-slate-900 ${getCategoryColor(sound.category)}`}>
                  <Volume2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{sound.name}</h3>
                  <span className="text-xs text-slate-400">
                    {sound.category.toUpperCase()}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(sound.id)}
                className="h-8 w-8 p-0 hover:bg-slate-700 flex-shrink-0"
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </div>

            <Button
              onClick={() => togglePlay(sound)}
              className={`w-full ${currentlyPlaying === sound.id
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'bg-purple-600 hover:bg-purple-700'
                }`}
            >
              {currentlyPlaying === sound.id ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Stopp
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Spela
                </>
              )}
            </Button>
          </Card>
        ))}
      </div>

      {filteredSounds.length === 0 && (
        <div className="text-center py-12">
          <Music className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">Inga ljud i denna kategori</p>
          <p className="text-sm text-slate-500">Lägg till ditt första ljud för att komma igång</p>
        </div>
      )}

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onEnded={() => setCurrentlyPlaying(null)}
        onError={() => setCurrentlyPlaying(null)}
      />
    </div>
  )
}
