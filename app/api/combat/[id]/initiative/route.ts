import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const initiatives = await prisma.initiative.findMany({
      where: { combatId: id },
      orderBy: { initiativeRoll: 'desc' }
    })
    return NextResponse.json(initiatives)
  } catch (error) {
    console.error('Error fetching initiatives:', error)
    return NextResponse.json({ error: 'Failed to fetch initiatives' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const initiative = await prisma.initiative.create({
      data: {
        id: crypto.randomUUID(),
        combatId: id,
        name: body.name,
        initiativeRoll: body.initiativeRoll,
        armorClass: body.armorClass,
        damageTaken: body.damageTaken || 0,
        maxHp: body.maxHp,
        isPlayer: body.isPlayer,
        order: body.initiativeRoll,
        updatedAt: new Date(),
      }
    })
    return NextResponse.json(initiative)
  } catch (error) {
    console.error('Error creating initiative:', error)
    return NextResponse.json({ error: 'Failed to create initiative' }, { status: 500 })
  }
}
