import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        _count: {
          select: {
            chapters: true,
            sessions: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })
    return NextResponse.json(campaigns)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const campaign = await prisma.campaign.create({
      data: {
        name: body.name,
        description: body.description,
      }
    })
    return NextResponse.json(campaign)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
  }
}
