'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, X, Upload, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

type MagicalItem = {
  id: string
  name: string
  description: string
  imageUrl?: string
  rarity: 'common' | 'uncommon' | 'rare' | 'very-rare' | 'legendary'
}

const MAGICAL_ITEMS: MagicalItem[] = [
  {
    id: '1',
    name: 'Herr Kurrington',
    description: 'En liten svart kattfigur i obsidian som kan väckas till liv som familiar i några minuter.',
    rarity: 'uncommon',
  },
  {
    id: '2',
    name: 'Välsignad Vingpinne',
    description: 'När den planteras i jord växer den till en frodig vinranka med 1d8 bär. Odlas över en natt; bär ger 1d6 temp HP. Pinnen kan planteras om',
    rarity: 'uncommon',
  },
  {
    id: '3',
    name: 'Fionas Fingerflamma',
    description: 'En ring som låter bäraren tända eller släcka ett ljus på 30 meters avstånd. Enkelt men atmosfäriskt. Kan användas var 10e sekund. Ljuskällor upp till en fackla.',
    rarity: 'rare',
  },
  {
    id: '4',
    name: 'Övervakaren',
    description: 'En liten metallkula som låter bäraren se genom dess "öga" i 10 minuter. En användning per dag',
    rarity: 'rare',
  },
  {
    id: '5',
    name: 'Nattvisare',
    description: 'En kompass som alltid pekar mot närmsta källa av nekromantisk energi.',
    rarity: 'common',
  },
  {
    id: '6',
    name: 'Skuggblad',
    description: 'Ett litet torkat löv som, om det hålls under tungan, dämpar fotsteg och andetag → Advantage på Stealth i 10 min. En användning per dag',
    rarity: 'uncommon',
  },
  {
    id: '7',
    name: 'Wachterns Vinröda Slöja',
    description: 'En tunn röd tygremsa som, när den knyts runt handleden, låter bäraren hålla sig osedd av råttor, korpar och katter.',
    rarity: 'rare',
  },
]

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common':
      return 'from-stone-700 to-stone-800 border-stone-600'
    case 'uncommon':
      return 'from-green-900/40 to-green-950/40 border-green-800/50'
    case 'rare':
      return 'from-blue-900/40 to-blue-950/40 border-blue-800/50'
    case 'very-rare':
      return 'from-purple-900/40 to-purple-950/40 border-purple-800/50'
    case 'legendary':
      return 'from-amber-900/40 to-amber-950/40 border-amber-800/50'
    default:
      return 'from-stone-700 to-stone-800 border-stone-600'
  }
}

const getRarityText = (rarity: string) => {
  switch (rarity) {
    case 'common':
      return 'Vanlig'
    case 'uncommon':
      return 'Ovanlig'
    case 'rare':
      return 'Sällsynt'
    case 'very-rare':
      return 'Mycket Sällsynt'
    case 'legendary':
      return 'Legendarisk'
    default:
      return 'Okänd'
  }
}

const getRarityTextColor = (rarity: string) => {
  switch (rarity) {
    case 'common':
      return 'text-stone-400'
    case 'uncommon':
      return 'text-green-400'
    case 'rare':
      return 'text-blue-400'
    case 'very-rare':
      return 'text-purple-400'
    case 'legendary':
      return 'text-amber-400'
    default:
      return 'text-stone-400'
  }
}

export default function MagicalItemsPage() {
  const { data: session } = useSession()
  const isDM = session?.user?.role === 'dm'

  const [selectedItem, setSelectedItem] = useState<MagicalItem | null>(null)
  const [items, setItems] = useState<MagicalItem[]>(MAGICAL_ITEMS)
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null)

  // Load images from localStorage on mount
  useEffect(() => {
    const savedImages = localStorage.getItem('magical-items-images')
    if (savedImages) {
      try {
        const imageMap = JSON.parse(savedImages) as { [key: string]: string }
        setItems(prevItems =>
          prevItems.map(item => ({
            ...item,
            imageUrl: imageMap[item.id] || item.imageUrl
          }))
        )
      } catch (error) {
        console.error('Failed to load saved images:', error)
      }
    }
  }, [])

  const handleImageUpload = async (itemId: string, file: File) => {
    setUploadingItemId(itemId)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('itemId', itemId)

      const response = await fetch('/api/magical-items/images', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const { url } = await response.json()

      // Update items with new image URL
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, imageUrl: url } : item
        )
      )

      // Save to localStorage
      const savedImages = localStorage.getItem('magical-items-images')
      const imageMap = savedImages ? JSON.parse(savedImages) : {}
      imageMap[itemId] = url
      localStorage.setItem('magical-items-images', JSON.stringify(imageMap))

      // Update selected item if it's the one being edited
      if (selectedItem?.id === itemId) {
        setSelectedItem({ ...selectedItem, imageUrl: url })
      }
    } catch (error) {
      console.error('Failed to upload image:', error)
      alert('Misslyckades att ladda upp bild')
    } finally {
      setUploadingItemId(null)
    }
  }

  const handleImageDelete = async (itemId: string, imageUrl: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna bild?')) {
      return
    }

    try {
      const response = await fetch('/api/magical-items/images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: imageUrl }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete image')
      }

      // Update items to remove image URL
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, imageUrl: undefined } : item
        )
      )

      // Remove from localStorage
      const savedImages = localStorage.getItem('magical-items-images')
      if (savedImages) {
        const imageMap = JSON.parse(savedImages)
        delete imageMap[itemId]
        localStorage.setItem('magical-items-images', JSON.stringify(imageMap))
      }

      // Update selected item if it's the one being edited
      if (selectedItem?.id === itemId) {
        setSelectedItem({ ...selectedItem, imageUrl: undefined })
      }
    } catch (error) {
      console.error('Failed to delete image:', error)
      alert('Misslyckades att ta bort bild')
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="h-8 w-8 text-purple-400" />
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
            <span className="bg-gradient-to-b from-stone-100 via-purple-300 to-purple-900 bg-clip-text text-transparent">
              Magiska Föremål
            </span>
          </h1>
          <Sparkles className="h-8 w-8 text-purple-400" />
        </div>
        <div className="h-px w-64 mx-auto bg-gradient-to-r from-transparent via-purple-900/50 to-transparent mb-4"></div>
        <p className="text-stone-500 text-sm tracking-[0.3em] uppercase">
          Mystiska Skatter från Barovia
        </p>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className={`relative p-6 bg-gradient-to-br ${getRarityColor(item.rarity)} backdrop-blur-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-950/50 group overflow-hidden`}
          >
            {/* Magical glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-purple-600/5 to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative z-10">
              {/* Item Image Placeholder */}
              <div className="relative mb-4">
                {item.imageUrl ? (
                  <div className="rounded-lg overflow-hidden bg-black/30 border border-stone-700 group/image">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover"
                    />
                    {isDM && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                e.stopPropagation()
                                handleImageUpload(item.id, file)
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={uploadingItemId === item.id}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Byt
                          </Button>
                        </label>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleImageDelete(item.id, item.imageUrl!)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Ta bort
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-48 rounded-lg bg-black/30 border border-stone-700 flex items-center justify-center group/upload">
                    {isDM ? (
                      <label className="cursor-pointer w-full h-full flex items-center justify-center">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              e.stopPropagation()
                              handleImageUpload(item.id, file)
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="text-center">
                          <Upload className="h-12 w-12 text-stone-700 mx-auto mb-2 group-hover/upload:text-stone-500 transition-colors" />
                          <p className="text-xs text-stone-600 group-hover/upload:text-stone-500">
                            {uploadingItemId === item.id ? 'Laddar upp...' : 'Klicka för att ladda upp'}
                          </p>
                        </div>
                      </label>
                    ) : (
                      <Sparkles className="h-12 w-12 text-stone-700" />
                    )}
                  </div>
                )}
              </div>

              {/* Item Name */}
              <h3 className="text-xl font-bold text-stone-100 mb-2" style={{ fontFamily: 'serif' }}>
                {item.name}
              </h3>

              {/* Rarity Badge */}
              <div className="mb-3">
                <span className={`text-xs font-semibold uppercase tracking-wider ${getRarityTextColor(item.rarity)}`}>
                  {getRarityText(item.rarity)}
                </span>
              </div>

              {/* Description Preview */}
              <p className="text-sm text-stone-400 line-clamp-3 italic">
                {item.description}
              </p>

              {/* Read More Hint */}
              <div className="mt-4 text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Klicka för att läsa mer →
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full">
            <Card className={`p-8 bg-gradient-to-br ${getRarityColor(selectedItem.rarity)} backdrop-blur-xl border-2 shadow-2xl`}>
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-800/50 transition-colors"
              >
                <X className="h-6 w-6 text-stone-400 hover:text-stone-200" />
              </button>

              {/* Item Image */}
              <div className="relative mb-6 group/modalimage">
                {selectedItem.imageUrl ? (
                  <>
                    <div className="rounded-lg overflow-hidden bg-black/30 border-2 border-stone-700">
                      <Image
                        src={selectedItem.imageUrl}
                        alt={selectedItem.name}
                        width={800}
                        height={600}
                        className="w-full h-96 object-cover"
                      />
                    </div>
                    {isDM && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/modalimage:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-lg">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                handleImageUpload(selectedItem.id, file)
                              }
                            }}
                          />
                          <Button
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={uploadingItemId === selectedItem.id}
                          >
                            <Upload className="h-5 w-5 mr-2" />
                            Byt Bild
                          </Button>
                        </label>
                        <Button
                          size="lg"
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleImageDelete(selectedItem.id, selectedItem.imageUrl!)}
                        >
                          <Trash2 className="h-5 w-5 mr-2" />
                          Ta bort Bild
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-96 rounded-lg bg-black/30 border-2 border-stone-700 flex items-center justify-center">
                    {isDM ? (
                      <label className="cursor-pointer w-full h-full flex items-center justify-center">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleImageUpload(selectedItem.id, file)
                            }
                          }}
                        />
                        <div className="text-center">
                          <Upload className="h-24 w-24 text-stone-700 mx-auto mb-4 hover:text-stone-500 transition-colors" />
                          <p className="text-stone-600 hover:text-stone-500">
                            {uploadingItemId === selectedItem.id ? 'Laddar upp...' : 'Klicka för att ladda upp bild'}
                          </p>
                        </div>
                      </label>
                    ) : (
                      <Sparkles className="h-24 w-24 text-stone-700" />
                    )}
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="space-y-4">
                {/* Title with decoration */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-purple-600"></div>
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-purple-600"></div>
                  </div>
                  <h2 className="text-3xl font-bold text-stone-100 mb-2" style={{ fontFamily: 'serif' }}>
                    {selectedItem.name}
                  </h2>
                  <p className={`text-sm font-semibold uppercase tracking-wider ${getRarityTextColor(selectedItem.rarity)}`}>
                    {getRarityText(selectedItem.rarity)}
                  </p>
                </div>

                {/* Decorative divider */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-stone-700 to-transparent my-6"></div>

                {/* Description */}
                <div className="bg-black/30 border border-stone-700 rounded-lg p-6">
                  <p className="text-stone-300 text-lg leading-relaxed italic" style={{ fontFamily: 'serif' }}>
                    {selectedItem.description}
                  </p>
                </div>

                {/* Bottom decoration */}
                <div className="flex items-center justify-center gap-2 mt-6">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-purple-600"></div>
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-purple-600"></div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
