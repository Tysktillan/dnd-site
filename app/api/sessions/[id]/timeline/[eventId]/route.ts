import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const { eventId } = await params
    const body = await request.json()
    const event = await prisma.timelineEvent.update({
      where: { id: eventId },
      data: body
    })
    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating timeline event:', error)
    return NextResponse.json({ error: 'Failed to update timeline event' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const { eventId } = await params
    await prisma.timelineEvent.delete({
      where: { id: eventId }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting timeline event:', error)
    return NextResponse.json({ error: 'Failed to delete timeline event' }, { status: 500 })
  }
}
