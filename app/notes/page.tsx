'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Edit2, Search } from 'lucide-react'
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

type Note = {
  id: string
  title: string
  content: string
  category: string | null
  tags: string | null
  createdAt: string
  updatedAt: string
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: ''
  })

  const categories = ['general', 'npc', 'location', 'quest', 'item']

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    const response = await fetch('/api/notes')
    const data = await response.json()
    setNotes(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = editingNote ? `/api/notes/${editingNote.id}` : '/api/notes'
    const method = editingNote ? 'PUT' : 'POST'

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    setFormData({ title: '', content: '', category: 'general', tags: '' })
    setEditingNote(null)
    setIsDialogOpen(false)
    fetchNotes()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' })
      fetchNotes()
    }
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category || 'general',
      tags: note.tags || ''
    })
    setIsDialogOpen(true)
  }

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || note.category === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Notes</h1>
          <p className="text-slate-400">Quick reference for NPCs, locations, quests, and more</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingNote(null)
                setFormData({ title: '', content: '', category: 'general', tags: '' })
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 text-white border-slate-700">
            <DialogHeader>
              <DialogTitle>{editingNote ? 'Edit Note' : 'Create New Note'}</DialogTitle>
              <DialogDescription className="text-slate-400">
                {editingNote ? 'Update your note details' : 'Add a new note to your collection'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="text-sm font-medium mb-2 block">Category</label>
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
                <label className="text-sm font-medium mb-2 block">Content</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="bg-slate-900 border-slate-700 min-h-[200px]"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tags (comma-separated)</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="bg-slate-900 border-slate-700"
                  placeholder="merchant, friendly, important"
                />
              </div>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                {editingNote ? 'Update Note' : 'Create Note'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-white">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat} className="text-white">
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => (
          <Card key={note.id} className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-white">{note.title}</h3>
                <span className="text-xs text-purple-400">
                  {note.category?.toUpperCase()}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(note)}
                  className="h-8 w-8 p-0 hover:bg-slate-700"
                >
                  <Edit2 className="h-4 w-4 text-slate-400" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(note.id)}
                  className="h-8 w-8 p-0 hover:bg-slate-700"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-slate-300 line-clamp-3 mb-2">{note.content}</p>
            {note.tags && (
              <div className="flex flex-wrap gap-1">
                {note.tags.split(',').map((tag, i) => (
                  <span key={i} className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-400">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No notes found. Create your first note!</p>
        </div>
      )}
    </div>
  )
}
