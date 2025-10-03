import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const initiative = await prisma.initiative.create({
      data: {
        combatId: id,
        name: body.name,
        initiativeRoll: body.initiativeRoll,
        armorClass: body.armorClass,
        damageTaken: body.damageTaken || 0,
        maxHp: body.maxHp,
        isPlayer: body.isPlayer,
        order: body.initiativeRoll,
      }
    })
    return NextResponse.json(initiative)
  } catch {
    return NextResponse.json({ error: 'Failed to create initiative' }, { status: 500 })
  }
}
