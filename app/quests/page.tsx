'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Scroll,
  Plus,
  Check,
  X,
  Clock,
  AlertCircle,
  Trophy,
  Eye,
  EyeOff,
  Crown,
  User as UserIcon,
  Trash2
} from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

type Quest = {
  id: string
  title: string
  description: string | null
  type: string
  status: string
  priority: string
  isPublic: boolean
  reward: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
  completedAt: string | null
  User: {
    id: string
    name: string
  }
}

export default function QuestsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'official' | 'personal'>('official')
  const [quests, setQuests] = useState<Quest[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'personal' as 'official' | 'personal',
    priority: 'normal',
    isPublic: false,
    reward: '',
  })

  useEffect(() => {
    fetchQuests()
  }, [activeTab])

  const fetchQuests = async () => {
    const response = await fetch(`/api/quests?type=${activeTab}`)
    const data = await response.json()
    setQuests(data)
  }

  const handleAddQuest = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/quests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        type: activeTab
      })
    })
    setFormData({
      title: '',
      description: '',
      type: 'personal',
      priority: 'normal',
      isPublic: false,
      reward: '',
    })
    setIsDialogOpen(false)
    fetchQuests()
  }

  const updateQuestStatus = async (questId: string, status: string) => {
    await fetch(`/api/quests/${questId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    fetchQuests()
  }

  const deleteQuest = async (questId: string) => {
    if (confirm('Delete this quest?')) {
      await fetch(`/api/quests/${questId}`, { method: 'DELETE' })
      fetchQuests()
    }
  }

  const toggleQuestPublic = async (questId: string, isPublic: boolean) => {
    await fetch(`/api/quests/${questId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublic: !isPublic })
    })
    fetchQuests()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 border-red-900'
      case 'high': return 'text-orange-400 border-orange-900'
      case 'normal': return 'text-yellow-400 border-yellow-900'
      case 'low': return 'text-stone-400 border-stone-800'
      default: return 'text-stone-400 border-stone-800'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="h-4 w-4" />
      case 'high': return <AlertCircle className="h-4 w-4" />
      case 'normal': return <Clock className="h-4 w-4" />
      case 'low': return <Clock className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const filterQuestsByStatus = (status: string) => {
    return quests.filter(q => q.status === status)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Scroll className="h-8 w-8 text-amber-400" />
          <h1 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tighter">
            <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent">
              QUEST BOARD
            </span>
          </h1>
        </div>
        <div className="h-px w-64 mx-auto bg-gradient-to-r from-transparent via-amber-600/50 to-transparent mb-4"></div>
        <p className="text-stone-400 text-sm">
          {activeTab === 'official' ? 'Official campaign quests' : 'Personal tasks and objectives'}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 justify-center">
        <Button
          onClick={() => setActiveTab('official')}
          variant={activeTab === 'official' ? 'default' : 'outline'}
          className={activeTab === 'official' ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700' : ''}
        >
          <Crown className="h-4 w-4 mr-2" />
          Official Quests
        </Button>
        <Button
          onClick={() => setActiveTab('personal')}
          variant={activeTab === 'personal' ? 'default' : 'outline'}
          className={activeTab === 'personal' ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : ''}
        >
          <UserIcon className="h-4 w-4 mr-2" />
          Personal Quests
        </Button>
      </div>

      {/* Add Quest Button */}
      <div className="flex justify-center mb-6">
        <Button
          onClick={() => {
            setFormData({ ...formData, type: activeTab })
            setIsDialogOpen(true)
          }}
          className="bg-green-600 hover:bg-green-700"
          disabled={activeTab === 'official' && session?.user?.role !== 'dm'}
        >
          <Plus className="h-4 w-4 mr-2" />
          {activeTab === 'official' ? 'Add Official Quest' : 'Add Personal Quest'}
        </Button>
      </div>

      {activeTab === 'official' && session?.user?.role !== 'dm' && (
        <p className="text-center text-xs text-stone-500 mb-6">
          Only the DM can create official quests
        </p>
      )}

      {/* Quest Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Quests */}
        <div>
          <h2 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Active ({filterQuestsByStatus('active').length})
          </h2>
          <div className="space-y-3">
            {filterQuestsByStatus('active').map(quest => (
              <QuestCard
                key={quest.id}
                quest={quest}
                currentUserId={session?.user?.id || ''}
                onStatusChange={updateQuestStatus}
                onDelete={deleteQuest}
                onTogglePublic={toggleQuestPublic}
                getPriorityColor={getPriorityColor}
                getPriorityIcon={getPriorityIcon}
              />
            ))}
            {filterQuestsByStatus('active').length === 0 && (
              <Card className="p-6 bg-stone-950/50 border-stone-800 text-center">
                <p className="text-stone-500 text-sm">No active quests</p>
              </Card>
            )}
          </div>
        </div>

        {/* Completed Quests */}
        <div>
          <h2 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
            <Check className="h-5 w-5" />
            Completed ({filterQuestsByStatus('completed').length})
          </h2>
          <div className="space-y-3">
            {filterQuestsByStatus('completed').map(quest => (
              <QuestCard
                key={quest.id}
                quest={quest}
                currentUserId={session?.user?.id || ''}
                onStatusChange={updateQuestStatus}
                onDelete={deleteQuest}
                onTogglePublic={toggleQuestPublic}
                getPriorityColor={getPriorityColor}
                getPriorityIcon={getPriorityIcon}
              />
            ))}
            {filterQuestsByStatus('completed').length === 0 && (
              <Card className="p-6 bg-stone-950/50 border-stone-800 text-center">
                <p className="text-stone-500 text-sm">No completed quests</p>
              </Card>
            )}
          </div>
        </div>

        {/* Failed Quests */}
        <div>
          <h2 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
            <X className="h-5 w-5" />
            Failed ({filterQuestsByStatus('failed').length})
          </h2>
          <div className="space-y-3">
            {filterQuestsByStatus('failed').map(quest => (
              <QuestCard
                key={quest.id}
                quest={quest}
                currentUserId={session?.user?.id || ''}
                onStatusChange={updateQuestStatus}
                onDelete={deleteQuest}
                onTogglePublic={toggleQuestPublic}
                getPriorityColor={getPriorityColor}
                getPriorityIcon={getPriorityIcon}
              />
            ))}
            {filterQuestsByStatus('failed').length === 0 && (
              <Card className="p-6 bg-stone-950/50 border-stone-800 text-center">
                <p className="text-stone-500 text-sm">No failed quests</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Add Quest Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'official' ? 'Add Official Quest' : 'Add Personal Quest'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {activeTab === 'official'
                ? 'Create a quest for all players in the campaign'
                : 'Create a personal quest or to-do item'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddQuest} className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-slate-900 border-slate-700"
                placeholder="Enter quest title..."
                required
                autoFocus
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-900 border-slate-700 min-h-[100px]"
                placeholder="Quest details and objectives..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Reward (optional)</Label>
                <Input
                  value={formData.reward}
                  onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                  className="bg-slate-900 border-slate-700"
                  placeholder="e.g., 100 GP, Magic Item"
                />
              </div>
            </div>

            {activeTab === 'personal' && (
              <div className="flex items-center space-x-2 p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                />
                <div className="flex-1">
                  <Label htmlFor="isPublic" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                    {formData.isPublic ? <Eye className="h-4 w-4 text-green-400" /> : <EyeOff className="h-4 w-4 text-stone-500" />}
                    {formData.isPublic ? 'Public' : 'Private'}
                  </Label>
                  <p className="text-xs text-slate-500">
                    {formData.isPublic ? 'Visible to all players' : 'Only visible to you'}
                  </p>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Quest
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Quest Card Component
function QuestCard({
  quest,
  currentUserId,
  onStatusChange,
  onDelete,
  onTogglePublic,
  getPriorityColor,
  getPriorityIcon
}: {
  quest: Quest
  currentUserId: string
  onStatusChange: (id: string, status: string) => void
  onDelete: (id: string) => void
  onTogglePublic: (id: string, isPublic: boolean) => void
  getPriorityColor: (priority: string) => string
  getPriorityIcon: (priority: string) => React.ReactElement
}) {
  const isOwner = quest.createdBy === currentUserId

  return (
    <Card className={`p-4 bg-stone-950/90 backdrop-blur-xl border transition-all hover:shadow-lg ${
      quest.status === 'completed' ? 'border-green-900/50 opacity-75' :
      quest.status === 'failed' ? 'border-red-900/50 opacity-75' :
      'border-stone-800'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded border text-xs ${getPriorityColor(quest.priority)}`}>
              {getPriorityIcon(quest.priority)}
              <span className="capitalize">{quest.priority}</span>
            </div>
            {quest.type === 'personal' && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded border text-xs text-purple-400 border-purple-900">
                {quest.isPublic ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                {quest.isPublic ? 'Public' : 'Private'}
              </div>
            )}
          </div>
          <h3 className="font-semibold text-stone-100 mb-1">{quest.title}</h3>
          {quest.description && (
            <p className="text-sm text-stone-400 line-clamp-2 mb-2">{quest.description}</p>
          )}
          {quest.reward && (
            <div className="flex items-center gap-1 text-xs text-amber-400 mb-2">
              <Trophy className="h-3 w-3" />
              {quest.reward}
            </div>
          )}
          <p className="text-xs text-stone-600">
            By {quest.User.name} • {new Date(quest.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3">
        {quest.status === 'active' && (
          <>
            <Button
              size="sm"
              onClick={() => onStatusChange(quest.id, 'completed')}
              className="bg-green-600 hover:bg-green-700 text-xs flex-1"
            >
              <Check className="h-3 w-3 mr-1" />
              Complete
            </Button>
            <Button
              size="sm"
              onClick={() => onStatusChange(quest.id, 'failed')}
              className="bg-red-600 hover:bg-red-700 text-xs flex-1"
            >
              <X className="h-3 w-3 mr-1" />
              Fail
            </Button>
          </>
        )}
        {quest.status !== 'active' && (
          <Button
            size="sm"
            onClick={() => onStatusChange(quest.id, 'active')}
            className="bg-blue-600 hover:bg-blue-700 text-xs flex-1"
          >
            Reactivate
          </Button>
        )}
        {isOwner && quest.type === 'personal' && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onTogglePublic(quest.id, quest.isPublic)}
            className="text-stone-400 hover:text-stone-200"
          >
            {quest.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        )}
        {isOwner && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(quest.id)}
            className="text-red-400 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  )
}
