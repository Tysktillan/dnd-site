import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const { eventId } = await params
    const notes = await prisma.eventNote.findMany({
      where: { timelineEventId: eventId },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(notes)
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const { eventId } = await params
    const body = await request.json()
    const note = await prisma.eventNote.create({
      data: {
        timelineEventId: eventId,
        content: body.content
      }
    })
    return NextResponse.json(note)
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}
