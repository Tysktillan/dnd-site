import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create DM account
  const dm = await prisma.user.upsert({
    where: { username: 'dm' },
    update: {},
    create: {
      username: 'dm',
      password: hashedPassword,
      role: 'dm',
      name: 'Dungeon Master',
    },
  })

  console.log('Created DM:', dm.username)

  // Create 6 player accounts
  const players = [
    { username: 'player1', name: 'Player One' },
    { username: 'player2', name: 'Player Two' },
    { username: 'player3', name: 'Player Three' },
    { username: 'player4', name: 'Player Four' },
    { username: 'player5', name: 'Player Five' },
    { username: 'player6', name: 'Player Six' },
  ]

  for (const player of players) {
    const created = await prisma.user.upsert({
      where: { username: player.username },
      update: {},
      create: {
        username: player.username,
        password: hashedPassword,
        role: 'player',
        name: player.name,
      },
    })
    console.log('Created player:', created.username)
  }

  console.log('\n✅ All users created successfully!')
  console.log('Default password for all accounts: password123')
  console.log('\nDM login: username=dm, password=password123')
  console.log('Player logins: username=player1-6, password=password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
