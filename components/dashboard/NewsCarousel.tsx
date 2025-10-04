'use client'

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Scroll } from "lucide-react"
import { NewsPost } from "@prisma/client"

interface NewsCarouselProps {
  posts: NewsPost[]
}

export function NewsCarousel({ posts }: NewsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (posts.length === 0) {
    return (
      <Card className="p-8 bg-stone-950/90 backdrop-blur-xl border-stone-900 text-center">
        <Scroll className="h-12 w-12 text-stone-700 mx-auto mb-3" />
        <p className="text-stone-400">No news posts yet</p>
        <p className="text-sm text-stone-600 mt-1">Check back later for updates from your DM</p>
      </Card>
    )
  }

  const currentPost = posts[currentIndex]

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? posts.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === posts.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="space-y-4">
      {/* Main Post Card */}
      <Card className="p-8 bg-stone-950/90 backdrop-blur-xl border-stone-900 relative overflow-hidden">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-900/10 to-transparent rounded-xl blur"></div>

        <div className="relative">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-3xl font-bold text-stone-100">{currentPost.title}</h2>
              <span className="px-3 py-1 text-xs bg-red-950/50 text-red-300 border border-red-900/50 rounded-full">
                News
              </span>
            </div>
            {currentPost.publishedAt && (
              <p className="text-sm text-stone-500">
                Published {new Date(currentPost.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>

          {/* Excerpt */}
          {currentPost.excerpt && (
            <p className="text-lg text-stone-300 mb-6 font-medium italic border-l-4 border-red-900/50 pl-4">
              {currentPost.excerpt}
            </p>
          )}

          {/* Content */}
          <div className="prose prose-invert prose-stone max-w-none">
            <div className="text-stone-300 whitespace-pre-wrap leading-relaxed">
              {currentPost.content}
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <Button
          onClick={goToPrevious}
          variant="ghost"
          size="sm"
          className="text-stone-400 hover:text-stone-200 hover:bg-stone-900/50"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {/* Dots Indicator */}
        <div className="flex items-center gap-2">
          {posts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-red-500'
                  : 'w-2 bg-stone-700 hover:bg-stone-600'
              }`}
              aria-label={`Go to post ${index + 1}`}
            />
          ))}
        </div>

        <Button
          onClick={goToNext}
          variant="ghost"
          size="sm"
          className="text-stone-400 hover:text-stone-200 hover:bg-stone-900/50"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Post Counter */}
      <p className="text-center text-sm text-stone-600">
        Post {currentIndex + 1} of {posts.length}
      </p>
    </div>
  )
}
