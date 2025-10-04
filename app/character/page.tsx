import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CharacterSheet from "@/components/character/CharacterSheet";

export default async function CharacterPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch user with player character
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { player: true }
  });

  if (!user?.player) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold text-stone-200 mb-4">No Character Found</h1>
          <p className="text-stone-400">Contact your DM to create your character.</p>
        </div>
      </div>
    );
  }

  return <CharacterSheet character={user.player} />;
}
