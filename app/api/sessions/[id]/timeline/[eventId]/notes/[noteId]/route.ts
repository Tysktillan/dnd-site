import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; eventId: string; noteId: string }> }
) {
  try {
    const { noteId } = await params
    await prisma.eventNote.delete({
      where: { id: noteId }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}
