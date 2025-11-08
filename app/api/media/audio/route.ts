import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const assets = await prisma.audioAsset.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(assets)
  } catch (error) {
    console.error('Error fetching audio assets:', error)
    return NextResponse.json({ error: 'Failed to fetch audio assets' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const asset = await prisma.audioAsset.create({
      data: {
        id: crypto.randomUUID(),
        name: body.name,
        url: body.url,
        sourceType: body.sourceType || 'file',
        tags: body.tags,
        category: body.category,
        duration: body.duration,
        description: body.description,
        updatedAt: new Date(),
      }
    })
    return NextResponse.json(asset)
  } catch (error) {
    console.error('Error creating audio asset:', error)
    return NextResponse.json({ error: 'Failed to create audio asset' }, { status: 500 })
  }
}
