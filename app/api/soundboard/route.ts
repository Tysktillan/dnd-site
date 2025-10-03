import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const sounds = await prisma.audioAsset.findMany({
      where: {
        soundboardSlot: {
          not: null,
        },
      },
      orderBy: {
        soundboardSlot: 'asc',
      },
      select: {
        id: true,
        name: true,
        url: true,
        soundboardSlot: true,
        category: true,
      },
    })

    return NextResponse.json(
      sounds.map((s) => ({
        id: s.id,
        name: s.name,
        url: s.url,
        slot: s.soundboardSlot,
        category: s.category,
      }))
    )
  } catch (error) {
    console.error('Error fetching soundboard sounds:', error)
    return NextResponse.json({ error: 'Failed to fetch sounds' }, { status: 500 })
  }
}
