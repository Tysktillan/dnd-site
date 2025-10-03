import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const item = await prisma.plannerItem.update({
      where: { id },
      data: {
        type: body.type,
        title: body.title,
        content: body.content,
        order: body.order,
        shown: body.shown,
      }
    })
    return NextResponse.json(item)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update planner item' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.plannerItem.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete planner item' }, { status: 500 })
  }
}
