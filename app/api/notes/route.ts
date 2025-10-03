import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const notes = await prisma.note.findMany({
      orderBy: { updatedAt: 'desc' }
    })
    return NextResponse.json(notes)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const note = await prisma.note.create({
      data: {
        title: body.title,
        content: body.content,
        category: body.category,
        tags: body.tags,
      }
    })
    return NextResponse.json(note)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}
