import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const timeline = await prisma.timelineEvent.findMany({
      where: { sessionId: id },
      orderBy: { order: 'asc' },
      include: {
        EventNote: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })
    return NextResponse.json(timeline)
  } catch (error) {
    console.error('Error fetching timeline:', error)
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    console.log('Creating timeline event for session:', id, 'Event data:', body)
    const event = await prisma.timelineEvent.create({
      data: {
        id: crypto.randomUUID(),
        sessionId: id,
        title: body.title,
        description: body.description,
        soundUrls: body.soundUrls,
        imageUrls: body.imageUrls,
        order: body.order || 0,
        updatedAt: new Date(),
      }
    })
    console.log('Created timeline event:', event)
    return NextResponse.json(event)
  } catch (error) {
    console.error('Error creating timeline event:', error)
    return NextResponse.json({ error: 'Failed to create timeline event' }, { status: 500 })
  }
}
