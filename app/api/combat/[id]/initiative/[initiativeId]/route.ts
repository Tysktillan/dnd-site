import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; initiativeId: string }> }
) {
  try {
    const { initiativeId } = await params
    const body = await request.json()
    const initiative = await prisma.initiative.update({
      where: { id: initiativeId },
      data: {
        damageTaken: body.damageTaken,
        conditions: body.conditions,
        notes: body.notes,
        isActive: body.isActive,
      }
    })
    return NextResponse.json(initiative)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update initiative' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; initiativeId: string }> }
) {
  try {
    const { initiativeId } = await params
    await prisma.initiative.delete({
      where: { id: initiativeId }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete initiative' }, { status: 500 })
  }
}
