import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(players)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const player = await prisma.player.create({
      data: {
        name: body.name,
        maxHp: body.maxHp,
        armorClass: body.armorClass,
        order: body.order || 0,
      }
    })
    return NextResponse.json(player)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create player' }, { status: 500 })
  }
}
