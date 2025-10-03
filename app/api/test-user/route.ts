import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const user = await prisma.user.findUnique({
    where: { username: 'dm' }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' })
  }

  const testPassword = 'password123'
  const matches = await bcrypt.compare(testPassword, user.password)

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    },
    passwordMatches: matches,
    passwordHash: user.password.substring(0, 20) + '...',
  })
}
