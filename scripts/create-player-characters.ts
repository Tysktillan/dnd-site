import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create player1's character
  const player1Character = await prisma.player.create({
    data: {
      name: "Player 1's Character", // Update with actual character name
      className: "Rogue 2 / Bard 3",
      race: "Male Grung",
      level: 5,
      maxHp: 30, // Update with actual values
      currentHp: 30,
      armorClass: 15, // Update with actual values
      proficiency: 3, // Level 5 proficiency bonus
      speed: 25, // Grung base speed
      // Ability scores - update with actual values
      strength: 10,
      dexterity: 16,
      constitution: 12,
      intelligence: 10,
      wisdom: 12,
      charisma: 14,
      background: "Update with background",
      alignment: "Update with alignment",
      inspiration: false,
    }
  });

  console.log('Created character:', player1Character);

  // Link to player1 user account
  const player1User = await prisma.user.findUnique({
    where: { username: 'player1' } // Or whatever their username is
  });

  if (player1User) {
    await prisma.user.update({
      where: { id: player1User.id },
      data: { playerId: player1Character.id }
    });
    console.log(`Linked character to user: ${player1User.username}`);
  } else {
    console.log('User player1 not found. Update the username in the script.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
