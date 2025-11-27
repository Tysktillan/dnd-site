import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET current campaign settings
export async function GET() {
  try {
    let settings = await prisma.campaignSettings.findUnique({
      where: { id: 'default' }
    })

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.campaignSettings.create({
        data: {
          id: 'default',
          currentDay: 1
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to fetch campaign settings:', error)
    return NextResponse.json({ error: 'Failed to fetch campaign settings' }, { status: 500 })
  }
}

// PUT update current day (DM only)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'dm') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { currentDay } = await request.json()

    if (typeof currentDay !== 'number' || currentDay < 1) {
      return NextResponse.json({ error: 'Invalid day number' }, { status: 400 })
    }

    const settings = await prisma.campaignSettings.upsert({
      where: { id: 'default' },
      update: {
        currentDay,
        updatedBy: session.user.id
      },
      create: {
        id: 'default',
        currentDay,
        updatedBy: session.user.id
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to update campaign settings:', error)
    return NextResponse.json({ error: 'Failed to update campaign settings' }, { status: 500 })
  }
}
