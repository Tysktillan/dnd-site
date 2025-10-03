import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const sounds = await prisma.sound.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(sounds)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sounds' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const sound = await prisma.sound.create({
      data: {
        name: body.name,
        category: body.category,
        url: body.url,
        duration: body.duration || null,
      }
    })
    return NextResponse.json(sound)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create sound' }, { status: 500 })
  }
}
