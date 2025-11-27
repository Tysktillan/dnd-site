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
  Clock,
  AlertCircle,
  Trophy,
  Eye,
  EyeOff,
  Crown,
  User as UserIcon,
  Trash2,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Send,
  X as CloseIcon,
  CheckCircle2,
  RotateCcw
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
  isTimeSensitive: boolean
  deadlineDay: number | null
  User: {
    id: string
    name: string
  }
  _count?: {
    QuestComment: number
  }
}

type QuestComment = {
  id: string
  questId: string
  userId: string
  content: string
  createdAt: string
  updatedAt: string
  User: {
    id: string
    name: string
    player?: {
      backgroundUrl: string | null
    } | null
    secondaryPlayer?: {
      backgroundUrl: string | null
    } | null
  }
}

export default function QuestsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'official' | 'personal'>('official')
  const [quests, setQuests] = useState<Quest[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [currentDay, setCurrentDay] = useState<number>(1)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'personal' as 'official' | 'personal',
    priority: 'normal',
    isPublic: false,
    reward: '',
    isTimeSensitive: false,
    deadlineDay: '',
  })

  useEffect(() => {
    fetchQuests()
    fetchCurrentDay()
  }, [activeTab])

  const fetchCurrentDay = async () => {
    try {
      const res = await fetch('/api/campaign-settings')
      if (res.ok) {
        const data = await res.json()
        setCurrentDay(data.currentDay)
      }
    } catch (error) {
      console.error('Failed to fetch current day:', error)
    }
  }

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
        type: activeTab,
        deadlineDay: formData.deadlineDay ? parseInt(formData.deadlineDay) : null
      })
    })
    setFormData({
      title: '',
      description: '',
      type: 'personal',
      priority: 'normal',
      isPublic: false,
      reward: '',
      isTimeSensitive: false,
      deadlineDay: '',
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
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header with Tavern Sign Style */}
      <div className="mb-8 text-center relative">
        <div className="inline-block relative">
          {/* Hanging Sign Effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-px h-4 bg-gradient-to-b from-stone-600 to-transparent"></div>
          <div className="bg-gradient-to-b from-amber-900 via-amber-800 to-amber-900 px-12 py-6 rounded-lg border-4 border-amber-950 shadow-2xl transform hover:rotate-1 transition-transform">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Scroll className="h-10 w-10 text-amber-300" />
              <h1 className="text-3xl md:text-4xl font-black tracking-tight" style={{ fontFamily: 'serif' }}>
                <span className="text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  QUEST BOARD
                </span>
              </h1>
              <Scroll className="h-10 w-10 text-amber-300" />
            </div>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-950 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 justify-center">
        <Button
          onClick={() => setActiveTab('official')}
          variant={activeTab === 'official' ? 'default' : 'outline'}
          className={activeTab === 'official'
            ? 'bg-gradient-to-b from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 border-2 border-amber-950 shadow-lg'
            : 'border-2 border-stone-700 hover:border-amber-800'
          }
        >
          <Crown className="h-4 w-4 mr-2" />
          Official Quests
        </Button>
        <Button
          onClick={() => setActiveTab('personal')}
          variant={activeTab === 'personal' ? 'default' : 'outline'}
          className={activeTab === 'personal'
            ? 'bg-gradient-to-b from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 border-2 border-purple-950 shadow-lg'
            : 'border-2 border-stone-700 hover:border-purple-800'
          }
        >
          <UserIcon className="h-4 w-4 mr-2" />
          Personal Quests
        </Button>
      </div>

      {/* Quest Board - Wood Panel Style */}
      <div className="relative">
        {/* Wood Background */}
        <div className="bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 rounded-lg border-8 border-double border-amber-900 shadow-2xl p-8 relative overflow-hidden">
          {/* Wood Grain Texture Effect */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          }}></div>

          {/* Metal Corner Brackets */}
          <div className="absolute top-2 left-2 w-8 h-8 border-l-4 border-t-4 border-stone-700"></div>
          <div className="absolute top-2 right-2 w-8 h-8 border-r-4 border-t-4 border-stone-700"></div>
          <div className="absolute bottom-2 left-2 w-8 h-8 border-l-4 border-b-4 border-stone-700"></div>
          <div className="absolute bottom-2 right-2 w-8 h-8 border-r-4 border-b-4 border-stone-700"></div>

          <div className="relative z-10">
            {/* Add Quest Button */}
            <div className="flex justify-center mb-6">
              <Button
                onClick={() => {
                  setFormData({ ...formData, type: activeTab })
                  setIsDialogOpen(true)
                }}
                className="bg-gradient-to-b from-stone-700 to-stone-900 hover:from-stone-600 hover:to-stone-800 border-2 border-stone-600 shadow-lg text-amber-100"
              >
                <Plus className="h-4 w-4 mr-2" />
                Post New Quest
              </Button>
            </div>

            {/* Active Quests Grid - Masonry Style */}
            <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
              {filterQuestsByStatus('active').map(quest => (
                <div key={quest.id} className="break-inside-avoid">
                  <QuestParchment
                    quest={quest}
                    currentUserId={session?.user?.id || ''}
                    currentDay={currentDay}
                    onStatusChange={updateQuestStatus}
                    onDelete={deleteQuest}
                    onTogglePublic={toggleQuestPublic}
                    getPriorityColor={getPriorityColor}
                    getPriorityIcon={getPriorityIcon}
                    onViewDetails={() => setSelectedQuest(quest)}
                  />
                </div>
              ))}
            </div>

            {filterQuestsByStatus('active').length === 0 && (
              <div className="text-center py-12">
                <Scroll className="h-16 w-16 mx-auto text-stone-700 mb-4" />
                <p className="text-stone-500 text-lg font-serif italic">The board stands empty...</p>
                <p className="text-stone-600 text-sm mt-2">No active quests at this time</p>
              </div>
            )}

            {/* Completed Quests Toggle */}
            {filterQuestsByStatus('completed').length > 0 && (
              <div className="mt-8 pt-6 border-t-2 border-stone-800">
                <Button
                  onClick={() => setShowCompleted(!showCompleted)}
                  variant="ghost"
                  className="w-full text-stone-400 hover:text-stone-200 hover:bg-stone-900/50"
                >
                  <div className="flex items-center justify-center gap-2">
                    {showCompleted ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">
                      Completed Quests ({filterQuestsByStatus('completed').length})
                    </span>
                    {showCompleted ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </Button>

                {showCompleted && (
                  <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4 mt-4">
                    {filterQuestsByStatus('completed').map(quest => (
                      <div key={quest.id} className="break-inside-avoid">
                        <QuestParchment
                          quest={quest}
                          currentUserId={session?.user?.id || ''}
                          currentDay={currentDay}
                          onStatusChange={updateQuestStatus}
                          onDelete={deleteQuest}
                          onTogglePublic={toggleQuestPublic}
                          getPriorityColor={getPriorityColor}
                          getPriorityIcon={getPriorityIcon}
                          onViewDetails={() => setSelectedQuest(quest)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quest Details Modal with Comments */}
      {selectedQuest && (
        <QuestDetailsModal
          quest={selectedQuest}
          currentUserId={session?.user?.id || ''}
          currentDay={currentDay}
          onClose={() => setSelectedQuest(null)}
          onStatusChange={updateQuestStatus}
          onDelete={(id) => {
            deleteQuest(id)
            setSelectedQuest(null)
          }}
          onTogglePublic={toggleQuestPublic}
          getPriorityColor={getPriorityColor}
          getPriorityIcon={getPriorityIcon}
        />
      )}

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

            <div className="flex items-center space-x-2 p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <Switch
                id="isTimeSensitive"
                checked={formData.isTimeSensitive}
                onCheckedChange={(checked) => setFormData({ ...formData, isTimeSensitive: checked })}
              />
              <div className="flex-1">
                <Label htmlFor="isTimeSensitive" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400" />
                  Time Sensitive
                </Label>
                <p className="text-xs text-slate-500">
                  This quest has a time constraint
                </p>
              </div>
            </div>

            {formData.isTimeSensitive && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Deadline (Campaign Day)</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.deadlineDay}
                  onChange={(e) => setFormData({ ...formData, deadlineDay: e.target.value })}
                  className="bg-slate-900 border-slate-700"
                  placeholder="e.g., 10"
                  required={formData.isTimeSensitive}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Enter the campaign day number when this quest must be completed
                </p>
              </div>
            )}

            <Button type="submit" className="w-full bg-stone-700 hover:bg-stone-600 border border-stone-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Quest
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Quest Parchment Component - Fantasy Style
function QuestParchment({
  quest,
  currentUserId,
  currentDay,
  onStatusChange,
  onDelete,
  onTogglePublic,
  getPriorityColor,
  getPriorityIcon,
  onViewDetails
}: {
  quest: Quest
  currentUserId: string
  currentDay: number
  onStatusChange: (id: string, status: string) => void
  onDelete: (id: string) => void
  onTogglePublic: (id: string, isPublic: boolean) => void
  getPriorityColor: (priority: string) => string
  getPriorityIcon: (priority: string) => React.ReactElement
  onViewDetails: () => void
}) {
  const isOwner = quest.createdBy === currentUserId
  const isCompleted = quest.status === 'completed'
  const commentCount = quest._count?.QuestComment || 0

  return (
    <div className="relative group">
      {/* Pushpin at the top */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
        <div className="w-3 h-3 rounded-full bg-gradient-to-b from-stone-400 to-stone-600 shadow-lg border-2 border-stone-700"></div>
      </div>

      {/* Parchment Paper */}
      <div className={`
        relative bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50
        rounded-sm shadow-xl transform transition-all duration-300
        ${isCompleted ? 'opacity-60 grayscale' : 'hover:shadow-2xl hover:-translate-y-1'}
        border-2 border-amber-900/20
      `}>
        {/* Torn/Aged edges effect */}
        <div className="absolute inset-0 rounded-sm" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(139, 92, 46, 0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>

        {/* Completed stamp */}
        {isCompleted && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 rotate-12">
            <div className="border-4 border-green-700 rounded-lg px-6 py-2 opacity-40">
              <span className="text-3xl font-black text-green-700">COMPLETE</span>
            </div>
          </div>
        )}

        <div className="relative z-10 p-5">
          {/* Header with Priority Badge */}
          <div className="flex items-start justify-between mb-3">
            <div className={`flex items-center gap-1 px-2 py-1 rounded border-2 text-xs font-bold bg-amber-50/80 ${getPriorityColor(quest.priority)}`}>
              {getPriorityIcon(quest.priority)}
              <span className="capitalize">{quest.priority}</span>
            </div>

            <div className="flex items-center gap-1">
              {quest.type === 'official' && (
                <Crown className="h-4 w-4 text-amber-600" />
              )}
              {quest.type === 'personal' && quest.isPublic && (
                <Eye className="h-4 w-4 text-purple-600" />
              )}
              {quest.isTimeSensitive && (
                <Clock className="h-4 w-4 text-red-600" />
              )}
            </div>
          </div>

          {/* Quest Title */}
          <h3 className="text-lg font-bold text-stone-900 mb-2 leading-tight" style={{ fontFamily: 'serif' }}>
            {quest.title}
          </h3>

          {/* Decorative line */}
          <div className="h-px bg-gradient-to-r from-amber-900/40 via-amber-900/60 to-amber-900/40 mb-3"></div>

          {/* Description */}
          {quest.description && (
            <p className="text-sm text-stone-800 mb-3 leading-relaxed" style={{ fontFamily: 'serif' }}>
              {quest.description}
            </p>
          )}

          {/* Time Constraint */}
          {quest.isTimeSensitive && quest.deadlineDay && (
            <div className={`flex items-center gap-2 text-xs mb-3 px-3 py-2 rounded ${
              quest.deadlineDay <= currentDay
                ? 'bg-gradient-to-r from-red-950 to-red-900 text-red-100 border border-red-800 shadow-[0_0_10px_rgba(153,27,27,0.5)]'
                : quest.deadlineDay - currentDay <= 2
                  ? 'bg-gradient-to-r from-orange-950 to-orange-900 text-orange-100 border border-orange-800 shadow-[0_0_8px_rgba(154,52,18,0.4)]'
                  : 'bg-gradient-to-r from-stone-800 to-stone-700 text-stone-200 border border-stone-600'
            }`}>
              <Clock className="h-4 w-4 flex-shrink-0" />
              <div className="font-medium italic" style={{ fontFamily: 'serif' }}>
                {quest.deadlineDay <= currentDay ? (
                  <span className="font-bold tracking-wide">OVERDUE</span>
                ) : (
                  <span>{quest.deadlineDay - currentDay} {quest.deadlineDay - currentDay === 1 ? 'day' : 'days'} remaining</span>
                )}
              </div>
            </div>
          )}

          {/* Reward */}
          {quest.reward && (
            <div className="flex items-center gap-2 text-sm text-amber-900 mb-3 bg-amber-100 p-2 rounded border-2 border-amber-300">
              <Trophy className="h-4 w-4 text-amber-600" />
              <span className="font-bold">Reward:</span>
              <span className="font-serif">{quest.reward}</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-stone-600 mb-3 italic" style={{ fontFamily: 'serif' }}>
            <span>Posted by {quest.User.name}</span>
            <span>{new Date(quest.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Comments Button - Always visible */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onViewDetails}
            className="w-full mb-2 text-stone-700 hover:text-stone-900 hover:bg-amber-100 border border-amber-900/20"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {commentCount === 0 ? 'Add Comment' : `${commentCount} Comment${commentCount !== 1 ? 's' : ''}`}
          </Button>

          {/* Actions - Only show on hover for cleaner look */}
          <div className="flex items-center gap-2 pt-2 border-t border-amber-900/20 opacity-0 group-hover:opacity-100 transition-opacity">
            {quest.status === 'active' && (
              <Button
                size="sm"
                onClick={() => onStatusChange(quest.id, 'completed')}
                className="bg-gradient-to-b from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-xs flex-1 text-white border-2 border-green-800"
              >
                <Check className="h-3 w-3 mr-1" />
                Complete
              </Button>
            )}
            {quest.status !== 'active' && (
              <Button
                size="sm"
                onClick={() => onStatusChange(quest.id, 'active')}
                className="bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-xs flex-1 text-white border-2 border-blue-800"
              >
                Reactivate
              </Button>
            )}
            {isOwner && quest.type === 'personal' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onTogglePublic(quest.id, quest.isPublic)}
                className="text-stone-700 hover:text-stone-900 hover:bg-amber-200/50"
              >
                {quest.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            )}
            {isOwner && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(quest.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Wax seal effect for official quests */}
        {quest.type === 'official' && (
          <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full bg-gradient-to-br from-red-700 to-red-900 border-2 border-red-950 shadow-lg flex items-center justify-center">
            <Crown className="h-6 w-6 text-amber-300" />
          </div>
        )}
      </div>
    </div>
  )
}

// Quest Details Modal with Comments
function QuestDetailsModal({
  quest,
  currentUserId,
  currentDay,
  onClose,
  onStatusChange,
  onDelete,
  onTogglePublic,
  getPriorityColor,
  getPriorityIcon
}: {
  quest: Quest
  currentUserId: string
  currentDay: number
  onClose: () => void
  onStatusChange: (id: string, status: string) => void
  onDelete: (id: string) => void
  onTogglePublic: (id: string, isPublic: boolean) => void
  getPriorityColor: (priority: string) => string
  getPriorityIcon: (priority: string) => React.ReactElement
}) {
  const [comments, setComments] = useState<QuestComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isOwner = quest.createdBy === currentUserId

  useEffect(() => {
    fetchComments()
  }, [quest.id])

  const fetchComments = async () => {
    const res = await fetch(`/api/quests/${quest.id}/comments`)
    if (res.ok) {
      const data = await res.json()
      setComments(data)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    const res = await fetch(`/api/quests/${quest.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newComment.trim() })
    })

    if (res.ok) {
      setNewComment('')
      fetchComments()
    }
    setIsSubmitting(false)
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return

    const res = await fetch(`/api/quests/${quest.id}/comments?commentId=${commentId}`, {
      method: 'DELETE'
    })

    if (res.ok) {
      fetchComments()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border-4 border-amber-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-b from-amber-900 via-amber-800 to-amber-900 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-amber-100 hover:text-white transition-colors cursor-pointer"
          >
            <CloseIcon className="h-6 w-6 cursor-pointer" />
          </button>

          <div className="flex items-start gap-4 pr-8">
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full border-2 text-sm font-bold bg-amber-50/90 ${getPriorityColor(quest.priority)}`}>
              {getPriorityIcon(quest.priority)}
              <span className="capitalize">{quest.priority}</span>
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-amber-100 mb-2" style={{ fontFamily: 'serif' }}>
                {quest.title}
              </h2>
              <div className="flex items-center gap-3 text-sm text-amber-200">
                <span>By {quest.User.name}</span>
                <span>•</span>
                <span>{new Date(quest.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {quest.type === 'official' && (
              <Crown className="h-8 w-8 text-amber-300 flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          {/* Quest Details */}
          <div className="mb-6">
            {quest.description && (
              <p className="text-base text-stone-800 mb-4 leading-relaxed" style={{ fontFamily: 'serif' }}>
                {quest.description}
              </p>
            )}

            {quest.isTimeSensitive && quest.deadlineDay && (
              <div className={`flex items-center gap-2 text-sm mb-3 px-4 py-3 rounded ${
                quest.deadlineDay <= currentDay
                  ? 'bg-gradient-to-r from-red-950 to-red-900 text-red-100 border border-red-800 shadow-[0_0_12px_rgba(153,27,27,0.6)]'
                  : quest.deadlineDay - currentDay <= 2
                    ? 'bg-gradient-to-r from-orange-950 to-orange-900 text-orange-100 border border-orange-800 shadow-[0_0_10px_rgba(154,52,18,0.5)]'
                    : 'bg-gradient-to-r from-stone-800 to-stone-700 text-stone-200 border border-stone-600'
              }`}>
                <Clock className="h-5 w-5 flex-shrink-0" />
                <div className="font-medium italic text-base" style={{ fontFamily: 'serif' }}>
                  {quest.deadlineDay <= currentDay ? (
                    <span className="font-bold tracking-wide">OVERDUE</span>
                  ) : (
                    <span>{quest.deadlineDay - currentDay} {quest.deadlineDay - currentDay === 1 ? 'day' : 'days'} remaining</span>
                  )}
                </div>
              </div>
            )}

            {quest.reward && (
              <div className="flex items-center gap-2 text-sm text-amber-900 mb-3 bg-amber-100 p-3 rounded border-2 border-amber-300">
                <Trophy className="h-5 w-5 text-amber-600" />
                <span className="font-bold">Reward:</span>
                <span className="font-serif">{quest.reward}</span>
              </div>
            )}

            {/* Public/Private Toggle - only if owner and personal quest */}
            {isOwner && quest.type === 'personal' && (
              <div className="pt-3 border-t border-amber-900/20">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onTogglePublic(quest.id, quest.isPublic)}
                  className="text-stone-700 hover:text-stone-900 hover:bg-amber-200/50"
                >
                  {quest.isPublic ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                  {quest.isPublic ? 'Make Private' : 'Make Public'}
                </Button>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="border-t-2 border-amber-900/40 pt-6">
            <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'serif' }}>
              <MessageCircle className="h-5 w-5 text-amber-700" />
              Discussion ({comments.length})
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="mb-6">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts on this quest..."
                className="bg-white border-2 border-amber-900/30 text-stone-900 min-h-[80px] mb-2 focus:border-amber-600"
                style={{ fontFamily: 'serif' }}
              />
              <Button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="bg-gradient-to-b from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white border-2 border-amber-900"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-stone-500 italic" style={{ fontFamily: 'serif' }}>
                  No comments yet. Be the first to share your thoughts!
                </div>
              ) : (
                comments.map((comment) => {
                  // Get avatar URL - prefer primary player, fallback to secondary
                  const avatarUrl = comment.User.player?.backgroundUrl || comment.User.secondaryPlayer?.backgroundUrl

                  return (
                    <div key={comment.id} className="bg-white/60 p-4 rounded border-2 border-amber-900/20">
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={comment.User.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-amber-900/30"
                              onError={(e) => {
                                console.log('Image failed to load:', avatarUrl)
                                // Hide the broken image and show default icon
                                e.currentTarget.style.display = 'none'
                                const parent = e.currentTarget.parentElement
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-stone-300 to-stone-400 border-2 border-amber-900/30 flex items-center justify-center">
                                      <svg class="h-6 w-6 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                    </div>
                                  `
                                }
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-stone-300 to-stone-400 border-2 border-amber-900/30 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-stone-600" />
                            </div>
                          )}
                        </div>

                        {/* Comment Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <span className="font-bold text-stone-900">{comment.User.name}</span>
                              <span className="text-xs text-stone-500 ml-2">
                                {new Date(comment.createdAt).toLocaleString()}
                              </span>
                            </div>
                            {(comment.userId === currentUserId) && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-red-600 hover:text-red-700 text-sm ml-2 flex-shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-stone-800 leading-relaxed" style={{ fontFamily: 'serif' }}>
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Action Buttons - Bottom Right */}
          <div className="border-t-2 border-amber-900/40 pt-4 mt-6 flex justify-end gap-3">
            {quest.status === 'active' && (
              <Button
                onClick={() => onStatusChange(quest.id, 'completed')}
                className="bg-gradient-to-b from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-2 border-green-900"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
            )}
            {quest.status === 'completed' && (
              <Button
                onClick={() => onStatusChange(quest.id, 'active')}
                className="bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-2 border-blue-900"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reactivate
              </Button>
            )}
            <Button
              onClick={() => onDelete(quest.id)}
              variant="destructive"
              className="bg-gradient-to-b from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-2 border-red-900"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
