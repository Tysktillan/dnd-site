'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Edit2, Trash2, ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import Link from 'next/link'
import { use } from 'react'
import ReactMarkdown from 'react-markdown'

type Chapter = {
  id: string
  title: string
  content: string
  order: number
  createdAt: string
  updatedAt: string
}

type Campaign = {
  id: string
  name: string
  description: string | null
  chapters: Chapter[]
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  })

  useEffect(() => {
    fetchCampaign()
  }, [id])

  const fetchCampaign = async () => {
    const response = await fetch(`/api/campaigns/${id}`)
    const data = await response.json()
    setCampaign(data)
    if (data.chapters.length > 0 && !selectedChapter) {
      setSelectedChapter(data.chapters[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = editingChapter
      ? `/api/campaigns/${id}/chapters/${editingChapter.id}`
      : `/api/campaigns/${id}/chapters`
    const method = editingChapter ? 'PUT' : 'POST'

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        order: editingChapter ? editingChapter.order : (campaign?.chapters.length || 0) + 1,
      }),
    })

    setFormData({ title: '', content: '' })
    setEditingChapter(null)
    setIsDialogOpen(false)
    fetchCampaign()
  }

  const handleDelete = async (chapterId: string) => {
    if (confirm('Are you sure you want to delete this chapter?')) {
      await fetch(`/api/campaigns/${id}/chapters/${chapterId}`, { method: 'DELETE' })
      if (selectedChapter?.id === chapterId) {
        setSelectedChapter(null)
      }
      fetchCampaign()
    }
  }

  const handleEdit = (chapter: Chapter) => {
    setEditingChapter(chapter)
    setFormData({
      title: chapter.title,
      content: chapter.content,
    })
    setIsDialogOpen(true)
  }

  if (!campaign) {
    return <div className="p-8 text-white">Loading...</div>
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Chapters Sidebar */}
      <div className="w-80 border-r border-slate-700 bg-slate-900 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <Link href="/campaigns">
            <Button variant="ghost" size="sm" className="mb-3 text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaigns
            </Button>
          </Link>
          <h2 className="text-xl font-bold text-white mb-1">{campaign.name}</h2>
          {campaign.description && (
            <p className="text-sm text-slate-400">{campaign.description}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-400 uppercase">Chapters</h3>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingChapter(null)
                    setFormData({ title: '', content: '' })
                  }}
                  className="h-7 bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingChapter ? 'Edit Chapter' : 'New Chapter'}</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    {editingChapter ? 'Update chapter content' : 'Add a new chapter to your campaign'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Chapter Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-slate-900 border-slate-700"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Content (Markdown supported)</label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="bg-slate-900 border-slate-700 min-h-[400px] font-mono"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                    {editingChapter ? 'Update Chapter' : 'Create Chapter'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-1">
            {campaign.chapters
              .sort((a, b) => a.order - b.order)
              .map((chapter) => (
                <div
                  key={chapter.id}
                  className={`group flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                    selectedChapter?.id === chapter.id
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                  onClick={() => setSelectedChapter(chapter)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm truncate">{chapter.title}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(chapter)
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(chapter.id)
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3 text-red-400" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>

          {campaign.chapters.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-8">
              No chapters yet. Click + to add one.
            </p>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-900">
        {selectedChapter ? (
          <div className="max-w-4xl mx-auto p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">{selectedChapter.title}</h1>
              <p className="text-sm text-slate-500">
                Chapter {selectedChapter.order} • Last updated{' '}
                {new Date(selectedChapter.updatedAt).toLocaleDateString()}
              </p>
            </div>

            <Card className="p-8 bg-slate-800 border-slate-700">
              <div className="prose prose-invert prose-slate max-w-none">
                <ReactMarkdown>{selectedChapter.content}</ReactMarkdown>
              </div>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-slate-400 mb-2">Select a chapter to view</p>
              <p className="text-sm text-slate-500">or create your first chapter</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
