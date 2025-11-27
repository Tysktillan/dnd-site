import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const { chapterId } = await params
    const body = await request.json()
    const chapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        title: body.title,
        content: body.content,
        order: body.order,
      }
    })
    return NextResponse.json(chapter)
  } catch {
    return NextResponse.json({ error: 'Failed to update chapter' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    const { chapterId } = await params
    await prisma.chapter.delete({
      where: { id: chapterId }
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete chapter' }, { status: 500 })
  }
}
