import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await prisma.session.findUnique({
      where: { id }
    })
    return NextResponse.json(session)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Build update data object with only provided fields
    const updateData: {
      sessionNumber?: number
      title?: string
      date?: Date
      notes?: string
      summary?: string
      status?: string
    } = {}
    if (body.sessionNumber !== undefined) updateData.sessionNumber = body.sessionNumber
    if (body.title !== undefined) updateData.title = body.title
    if (body.date !== undefined) updateData.date = new Date(body.date)
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.summary !== undefined) updateData.summary = body.summary
    if (body.status !== undefined) updateData.status = body.status

    const session = await prisma.session.update({
      where: { id },
      data: updateData
    })
    return NextResponse.json(session)
  } catch (error) {
    console.error('Error updating session:', error)
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.session.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 })
  }
}
