import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        chapters: {
          orderBy: { order: 'asc' }
        }
      }
    })
    return NextResponse.json(campaign)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
      }
    })
    return NextResponse.json(campaign)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.campaign.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 })
  }
}
