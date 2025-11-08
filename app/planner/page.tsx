'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Plus, Trash2, Edit2, Eye, EyeOff, Image as ImageIcon, Video, Link as LinkIcon } from 'lucide-react'
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

type PlannerItem = {
  id: string
  sessionId: string | null
  type: string
  title: string
  content: string
  order: number
  shown: boolean
  createdAt: string
  updatedAt: string
}

export default function PlannerPage() {
  const [items, setItems] = useState<PlannerItem[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PlannerItem | null>(null)
  const [formData, setFormData] = useState({
    type: 'image',
    title: '',
    content: '',
  })
  const [presentationMode, setPresentationMode] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  const types = ['image', 'video', 'url', 'note']

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    const response = await fetch('/api/planner')
    const data = await response.json()
    setItems(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = editingItem ? `/api/planner/${editingItem.id}` : '/api/planner'
    const method = editingItem ? 'PUT' : 'POST'

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        order: editingItem ? editingItem.order : items.length + 1,
      }),
    })

    setFormData({ type: 'image', title: '', content: '' })
    setEditingItem(null)
    setIsDialogOpen(false)
    fetchItems()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await fetch(`/api/planner/${id}`, { method: 'DELETE' })
      fetchItems()
    }
  }

  const toggleShown = async (item: PlannerItem) => {
    await fetch(`/api/planner/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...item,
        shown: !item.shown,
      }),
    })
    fetchItems()
  }

  const handleEdit = (item: PlannerItem) => {
    setEditingItem(item)
    setFormData({
      type: item.type,
      title: item.title,
      content: item.content,
    })
    setIsDialogOpen(true)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-5 w-5" />
      case 'video':
        return <Video className="h-5 w-5" />
      case 'url':
        return <LinkIcon className="h-5 w-5" />
      case 'note':
        return <FileText className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image':
        return 'text-blue-400'
      case 'video':
        return 'text-purple-400'
      case 'url':
        return 'text-green-400'
      case 'note':
        return 'text-yellow-400'
      default:
        return 'text-slate-400'
    }
  }

  const renderPresentationContent = (item: PlannerItem) => {
    switch (item.type) {
      case 'image':
        return (
          <div className="flex items-center justify-center h-full">
            <img
              src={item.content}
              alt={item.title}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )
      case 'video':
        return (
          <div className="flex items-center justify-center h-full">
            <video
              src={item.content}
              controls
              className="max-h-full max-w-full"
            />
          </div>
        )
      case 'url':
        return (
          <div className="flex items-center justify-center h-full">
            <iframe
              src={item.content}
              className="w-full h-full border-0"
              title={item.title}
            />
          </div>
        )
      case 'note':
        return (
          <div className="flex items-center justify-center h-full p-12">
            <div className="max-w-4xl">
              <h2 className="text-2xl md:text-xl md:text-2xl lg:text-3xl lg:text-4xl font-bold text-white mb-6">{item.title}</h2>
              <p className="text-2xl text-slate-300 whitespace-pre-wrap">{item.content}</p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  if (presentationMode) {
    const currentItem = items[currentSlide]
    return (
      <div className="fixed inset-0 bg-black z-50">
        <div className="h-full flex flex-col">
          <div className="flex-1 relative">
            {currentItem && renderPresentationContent(currentItem)}
          </div>
          <div className="bg-slate-900 border-t border-slate-700 p-4 flex items-center justify-between">
            <div className="text-white">
              <h3 className="font-semibold">{currentItem?.title}</h3>
              <p className="text-sm text-slate-400">
                {currentSlide + 1} / {items.length}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                disabled={currentSlide === 0}
                className="bg-slate-700 hover:bg-slate-600"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentSlide(Math.min(items.length - 1, currentSlide + 1))}
                disabled={currentSlide === items.length - 1}
                className="bg-slate-700 hover:bg-slate-600"
              >
                Next
              </Button>
              <Button
                onClick={() => setPresentationMode(false)}
                variant="outline"
                className="border-red-700 text-red-400 hover:bg-red-900/20"
              >
                Exit Presentation
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">Session Planner</h1>
          <p className="text-slate-400">Organize media and assets to show your players</p>
        </div>
        <div className="flex gap-2">
          {items.length > 0 && (
            <Button
              onClick={() => {
                setPresentationMode(true)
                setCurrentSlide(0)
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              Present
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingItem(null)
                  setFormData({ type: 'image', title: '', content: '' })
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 text-white border-slate-700">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Add images, videos, URLs, or notes to your session
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {types.map(type => (
                        <SelectItem key={type} value={type} className="text-white">
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-slate-900 border-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {formData.type === 'note' ? 'Content' : 'URL'}
                  </label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="bg-slate-900 border-slate-700"
                    placeholder={
                      formData.type === 'note'
                        ? 'Enter your note text...'
                        : 'https://example.com/image.jpg'
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                  {editingItem ? 'Update Item' : 'Add Item'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items
          .sort((a, b) => a.order - b.order)
          .map((item) => (
            <Card key={item.id} className="p-4 bg-slate-800 border-slate-700">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg bg-slate-900 ${getTypeColor(item.type)}`}>
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{item.title}</h3>
                    <span className="text-xs text-slate-400">
                      {item.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {item.type === 'image' && (
                <div className="mb-3 rounded overflow-hidden bg-slate-900">
                  <img
                    src={item.content}
                    alt={item.title}
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}

              {item.type === 'note' && (
                <p className="text-sm text-slate-300 line-clamp-2 mb-3">{item.content}</p>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => toggleShown(item)}
                  className={`flex-1 ${
                    item.shown
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {item.shown ? (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      Shown
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      Hidden
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(item)}
                  className="hover:bg-slate-700"
                >
                  <Edit2 className="h-3 w-3 text-slate-400" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(item.id)}
                  className="hover:bg-slate-700"
                >
                  <Trash2 className="h-3 w-3 text-red-400" />
                </Button>
              </div>
            </Card>
          ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">No items yet</p>
          <p className="text-sm text-slate-500">Add images, videos, or notes to plan your session</p>
        </div>
      )}
    </div>
  )
}
