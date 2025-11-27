import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET all comments for a quest
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const comments = await prisma.questComment.findMany({
      where: { questId: id },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            player: {
              select: {
                backgroundUrl: true
              }
            },
            secondaryPlayer: {
              select: {
                backgroundUrl: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

// POST a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 })
    }

    const comment = await prisma.questComment.create({
      data: {
        questId: id,
        userId: session.user.id,
        content: content.trim()
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            player: {
              select: {
                backgroundUrl: true
              }
            },
            secondaryPlayer: {
              select: {
                backgroundUrl: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Failed to create comment:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}

// DELETE a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID required' }, { status: 400 })
    }

    // Check if user owns the comment or is DM
    const comment = await prisma.questComment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    if (comment.userId !== session.user.id && session.user.role !== 'dm') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.questComment.delete({
      where: { id: commentId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete comment:', error)
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}
