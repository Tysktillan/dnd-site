import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const combats = await prisma.combat.findMany({
      include: {
        initiatives: {
          orderBy: { initiativeRoll: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(combats)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch combats' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // End any active combats first
    await prisma.combat.updateMany({
      where: { isActive: true },
      data: { isActive: false, phase: 'setup' }
    })

    const combat = await prisma.combat.create({
      data: {
        name: body.name,
        sessionId: body.sessionId || null,
        phase: body.phase || 'setup',
        isActive: true,
      },
      include: {
        initiatives: true
      }
    })
    return NextResponse.json(combat)
  } catch (error) {
    console.error('Error creating combat:', error)
    return NextResponse.json({ error: 'Failed to create combat' }, { status: 500 })
  }
}
