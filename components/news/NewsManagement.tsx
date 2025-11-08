'use client'

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { NewsPost } from "@prisma/client"
import { Plus, Edit, Trash2, Save, X, Newspaper, Eye, EyeOff, Upload, Music } from "lucide-react"
import { useRouter } from "next/navigation"

interface NewsManagementProps {
  posts: NewsPost[]
}

export default function NewsManagement({ posts: initialPosts }: NewsManagementProps) {
  const router = useRouter()
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    audioUrl: '',
  })
  const [uploadingAudio, setUploadingAudio] = useState(false)

  const handleCreate = () => {
    setIsCreating(true)
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      audioUrl: '',
    })
  }

  const handleEdit = (post: NewsPost) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      excerpt: post.excerpt || '',
      content: post.content,
      audioUrl: post.audioUrl || '',
    })
  }

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAudio(true)
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)

    try {
      const response = await fetch('/api/upload/audio', {
        method: 'POST',
        body: formDataUpload,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setFormData(prev => ({ ...prev, audioUrl: data.url }))
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload audio file')
    } finally {
      setUploadingAudio(false)
    }
  }

  const handleSave = async () => {
    try {
      const url = editingPost
        ? `/api/news/${editingPost.id}`
        : '/api/news'

      const response = await fetch(url, {
        method: editingPost ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to save post')

      setEditingPost(null)
      setIsCreating(false)
      router.refresh()
    } catch (error) {
      console.error('Error saving post:', error)
      alert('Failed to save post')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const response = await fetch(`/api/news/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete post')

      router.refresh()
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post')
    }
  }

  const handleTogglePublish = async (post: NewsPost) => {
    try {
      const response = await fetch(`/api/news/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPublished: !post.isPublished,
          publishedAt: !post.isPublished ? new Date().toISOString() : null
        })
      })

      if (!response.ok) throw new Error('Failed to update post')

      router.refresh()
    } catch (error) {
      console.error('Error updating post:', error)
      alert('Failed to update post')
    }
  }

  const handleCancel = () => {
    setEditingPost(null)
    setIsCreating(false)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">
            <span className="bg-gradient-to-b from-stone-100 via-stone-300 to-red-900 bg-clip-text text-transparent">
              News & Announcements
            </span>
          </h1>
          <p className="text-stone-400">Create posts for your players to see</p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-red-950 hover:bg-red-900 border border-red-900/50 text-stone-100"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingPost) && (
        <Card className="p-6 bg-stone-950/90 backdrop-blur-xl border-amber-900/50 mb-6">
          <h2 className="text-lg font-bold text-stone-200 mb-4 flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-amber-400" />
            {editingPost ? 'Edit Post' : 'Create New Post'}
          </h2>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-stone-400 mb-2 block">Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Post title..."
                className="bg-stone-900 border-stone-800 text-stone-100"
              />
            </div>
            <div>
              <Label className="text-xs text-stone-400 mb-2 block">Excerpt (Short Summary)</Label>
              <Input
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Brief summary for preview..."
                className="bg-stone-900 border-stone-800 text-stone-100"
              />
            </div>
            <div>
              <Label className="text-xs text-stone-400 mb-2 block">Content (Markdown supported)</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Post content..."
                rows={12}
                className="bg-stone-900 border-stone-800 text-stone-100 resize-none font-mono text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-stone-400 mb-2 block">Audio Narration (Optional)</Label>
              <p className="text-xs text-stone-600 mb-3">Upload a text-to-speech audio version of your post content (max 50MB)</p>
              <div className="space-y-3">
                {formData.audioUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-stone-900/50 border border-stone-800 rounded">
                    <Music className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-stone-300 flex-1 truncate">Audio attached</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setFormData(prev => ({ ...prev, audioUrl: '' }))}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      disabled={uploadingAudio}
                      className="bg-stone-900 border-stone-800 text-stone-100"
                    />
                    {uploadingAudio && (
                      <p className="text-xs text-amber-400 mt-2">
                        <Upload className="h-3 w-3 inline mr-1 animate-pulse" />
                        Uploading audio...
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleSave}
              className="bg-red-950 hover:bg-red-900 border border-red-900/50 text-stone-100"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Post
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

      {/* Posts List */}
      <div className="space-y-4">
        {initialPosts.map(post => (
          <Card key={post.id} className="p-6 bg-stone-950/90 backdrop-blur-xl border-stone-900 hover:border-amber-900/50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-stone-100">{post.title}</h3>
                  {post.isPublished ? (
                    <span className="px-2 py-1 text-xs bg-green-950/50 text-green-400 border border-green-900/50 rounded">
                      Published
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-stone-900 text-stone-500 border border-stone-800 rounded">
                      Draft
                    </span>
                  )}
                </div>
                {post.excerpt && (
                  <p className="text-sm text-stone-400 mb-2">{post.excerpt}</p>
                )}
                <p className="text-xs text-stone-600">
                  Created: {new Date(post.createdAt).toLocaleDateString()}
                  {post.publishedAt && ` • Published: ${new Date(post.publishedAt).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleTogglePublish(post)}
                  className="text-stone-400 hover:text-stone-200"
                  title={post.isPublished ? 'Unpublish' : 'Publish'}
                >
                  {post.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(post)}
                  className="text-stone-400 hover:text-stone-200"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(post.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-stone-400 line-clamp-3 whitespace-pre-wrap">
              {post.content}
            </div>
          </Card>
        ))}
        {initialPosts.length === 0 && (
          <Card className="p-12 bg-stone-950/90 backdrop-blur-xl border-stone-900 text-center">
            <Newspaper className="h-12 w-12 mx-auto mb-4 text-stone-700" />
            <p className="text-stone-500">No posts yet. Create your first announcement!</p>
          </Card>
        )}
      </div>
    </div>
  )
}
