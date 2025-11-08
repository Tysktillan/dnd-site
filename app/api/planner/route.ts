import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const items = await prisma.plannerItem.findMany({
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(items)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch planner items' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const item = await prisma.plannerItem.create({
      data: {
        id: crypto.randomUUID(),
        sessionId: body.sessionId || null,
        type: body.type,
        title: body.title,
        content: body.content,
        order: body.order,
        updatedAt: new Date(),
      }
    })
    return NextResponse.json(item)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create planner item' }, { status: 500 })
  }
}
