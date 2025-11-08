import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const assets = await prisma.imageAsset.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(assets)
  } catch (error) {
    console.error('Error fetching image assets:', error)
    return NextResponse.json({ error: 'Failed to fetch image assets' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const asset = await prisma.imageAsset.create({
      data: {
        id: crypto.randomUUID(),
        name: body.name,
        url: body.url,
        tags: body.tags,
        category: body.category,
        description: body.description,
        updatedAt: new Date(),
      }
    })
    return NextResponse.json(asset)
  } catch (error) {
    console.error('Error creating image asset:', error)
    return NextResponse.json({ error: 'Failed to create image asset' }, { status: 500 })
  }
}
