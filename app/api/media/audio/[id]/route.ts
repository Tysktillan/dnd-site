import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.audioAsset.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting audio asset:', error)
    return NextResponse.json({ error: 'Failed to delete audio asset' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updated = await prisma.audioAsset.update({
      where: { id },
      data: {
        soundboardSlot: body.soundboardSlot,
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating audio asset:', error)
    return NextResponse.json({ error: 'Failed to update audio asset' }, { status: 500 })
  }
}
