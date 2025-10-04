import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PlayerManagement from "@/components/players/PlayerManagement";

export default async function PlayersPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'dm') {
    redirect('/');
  }

  // Fetch all users with role 'player' and their linked characters
  const players = await prisma.user.findMany({
    where: { role: 'player' },
    include: { player: true },
    orderBy: { name: 'asc' }
  });

  // Fetch all Player characters (for assigning to users)
  const allCharacters = await prisma.player.findMany({
    orderBy: { name: 'asc' }
  });

  return <PlayerManagement players={players} allCharacters={allCharacters} />;
}
