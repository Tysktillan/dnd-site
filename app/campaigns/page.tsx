'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { BookOpen, Plus, Edit2, Trash2, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import Link from 'next/link'

type Campaign = {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    chapters: number
    sessions: number
  }
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    const response = await fetch('/api/campaigns')
    const data = await response.json()
    setCampaigns(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = editingCampaign ? `/api/campaigns/${editingCampaign.id}` : '/api/campaigns'
    const method = editingCampaign ? 'PUT' : 'POST'

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    setFormData({ name: '', description: '' })
    setEditingCampaign(null)
    setIsDialogOpen(false)
    fetchCampaigns()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Är du säker på att du vill ta bort denna kampanj? Alla kapitel kommer att raderas.')) {
      await fetch(`/api/campaigns/${id}`, { method: 'DELETE' })
      fetchCampaigns()
    }
  }

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setFormData({
      name: campaign.name,
      description: campaign.description || '',
    })
    setIsDialogOpen(true)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">Kampanjer</h1>
          <p className="text-slate-400">Hantera dina kampanjberättelser och manuskript</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingCampaign(null)
                setFormData({ name: '', description: '' })
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ny Kampanj
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 text-white border-slate-700">
            <DialogHeader>
              <DialogTitle>{editingCampaign ? 'Redigera Kampanj' : 'Skapa Ny Kampanj'}</DialogTitle>
              <DialogDescription className="text-slate-400">
                {editingCampaign ? 'Uppdatera kampanjdetaljer' : 'Påbörja ett nytt äventyr'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Kampanjnamn</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-900 border-slate-700"
                  placeholder="t.ex. Gruvan i Phandelver"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Beskrivning</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-900 border-slate-700 min-h-[100px]"
                  placeholder="Kort översikt av kampanjen..."
                />
              </div>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                {editingCampaign ? 'Uppdatera Kampanj' : 'Skapa Kampanj'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="p-6 bg-slate-800 border-slate-700 hover:border-purple-600 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-900/30">
                  <BookOpen className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">{campaign.name}</h3>
                  {campaign.description && (
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                      {campaign.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
              <span>{campaign._count?.chapters || 0} chapters</span>
              <span>{campaign._count?.sessions || 0} sessions</span>
            </div>

            <div className="flex gap-2">
              <Link href={`/campaigns/${campaign.id}`} className="flex-1">
                <Button className="w-full bg-slate-700 hover:bg-slate-600">
                  <FileText className="h-4 w-4 mr-2" />
                  Visa Manuskript
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEdit(campaign)}
                className="hover:bg-slate-700"
              >
                <Edit2 className="h-4 w-4 text-slate-400" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(campaign.id)}
                className="hover:bg-slate-700"
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">Inga kampanjer än</p>
          <p className="text-sm text-slate-500">Skapa din första kampanj för att börja ditt äventyr</p>
        </div>
      )}
    </div>
  )
}
