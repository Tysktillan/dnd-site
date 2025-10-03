import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const combat = await prisma.combat.update({
      where: { id },
      data: {
        phase: body.phase,
        round: body.round,
        isActive: body.isActive,
        outcome: body.outcome,
        notes: body.notes,
      },
      include: {
        initiatives: true
      }
    })
    return NextResponse.json(combat)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update combat' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.combat.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete combat' }, { status: 500 })
  }
}
