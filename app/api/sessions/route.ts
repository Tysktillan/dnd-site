import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { sessionNumber: 'desc' }
    })
    return NextResponse.json(sessions)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const session = await prisma.session.create({
      data: {
        campaignId: body.campaignId || null,
        sessionNumber: body.sessionNumber,
        title: body.title,
        date: new Date(body.date),
        notes: body.notes,
        summary: body.summary,
      }
    })
    return NextResponse.json(session)
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}
