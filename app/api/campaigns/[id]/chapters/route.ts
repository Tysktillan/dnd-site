import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const chapter = await prisma.chapter.create({
      data: {
        campaignId: id,
        title: body.title,
        content: body.content,
        order: body.order,
      }
    })
    return NextResponse.json(chapter)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 })
  }
}
