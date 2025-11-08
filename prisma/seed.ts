import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const players = [
    { name: 'Ala', order: 1 },
    { name: 'Jerry', order: 2 },
    { name: 'Sylvando/Siegfrid', order: 3 },
    { name: 'Petter-Jöns', order: 4 },
    { name: 'Celeric', order: 5 },
    { name: 'Vanya', order: 6 },
  ]

  console.log('Seeding players...')

  for (const player of players) {
    await prisma.player.upsert({
      where: { name: player.name },
      update: {},
      create: {
        id: crypto.randomUUID(),
        name: player.name,
        order: player.order,
        updatedAt: new Date(),
      },
    })
    console.log(`✓ ${player.name}`)
  }

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
