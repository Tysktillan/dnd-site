import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { User, Scroll, Heart, Shield as ShieldIcon } from "lucide-react";
import Link from "next/link";
import { NewsCarousel } from "./NewsCarousel";

export default async function PlayerDashboard() {
  const session = await auth();

  // Fetch player character
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: {
      player: true,
      secondaryPlayer: true
    }
  });

  const character = user?.player;

  // Fetch all published news posts (newest first)
  const newsPosts = await prisma.newsPost.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate ability modifiers
  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-black tracking-tighter mb-4">
          <span className="bg-gradient-to-b from-stone-100 via-stone-300 to-red-900 bg-clip-text text-transparent">
            Welcome, {session?.user?.name}
          </span>
        </h1>
        <div className="h-px w-48 mx-auto bg-gradient-to-r from-transparent via-red-900/50 to-transparent mb-4"></div>
        <p className="text-stone-500 text-sm tracking-[0.3em] uppercase">
          Adventurer&apos;s Dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Character Overview Card */}
        <div className="lg:col-span-2">
          <Card className="relative p-6 bg-stone-950/90 backdrop-blur-xl border-stone-900 overflow-hidden">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-900/10 to-transparent rounded-xl blur"></div>

            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-stone-100 mb-1">
                    {character?.name || 'No Character'}
                  </h2>
                  {character && (
                    <p className="text-stone-400 text-sm">
                      Level {character.level} {character.race} {character.className}
                      {character.className2 && character.level2 > 0 && (
                        <> / Level {character.level2} {character.className2}</>
                      )}
                    </p>
                  )}
                </div>
                <Link
                  href="/character"
                  className="px-4 py-2 bg-red-950/50 hover:bg-red-900/50 border border-red-900/50 rounded-lg text-sm text-stone-300 hover:text-stone-100 transition-all"
                >
                  View Full Character
                </Link>
              </div>

              {character ? (
                <>
                  {/* HP and AC */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-black/30 border border-stone-800 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Heart className="h-5 w-5 text-red-400" />
                        <div>
                          <p className="text-xs text-stone-500 uppercase tracking-wider">Hit Points</p>
                          <p className="text-2xl font-bold text-stone-100">
                            {character.currentHp ?? character.maxHp}/{character.maxHp}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-black/30 border border-stone-800 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <ShieldIcon className="h-5 w-5 text-stone-400" />
                        <div>
                          <p className="text-xs text-stone-500 uppercase tracking-wider">Armor Class</p>
                          <p className="text-2xl font-bold text-stone-100">{character.armorClass ?? 10}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ability Scores */}
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      { name: 'STR', value: character.strength },
                      { name: 'DEX', value: character.dexterity },
                      { name: 'CON', value: character.constitution },
                      { name: 'INT', value: character.intelligence },
                      { name: 'WIS', value: character.wisdom },
                      { name: 'CHA', value: character.charisma },
                    ].map((ability) => (
                      <div key={ability.name} className="bg-black/30 border border-stone-800 rounded-lg p-3 text-center">
                        <p className="text-xs text-stone-500 font-semibold mb-1">{ability.name}</p>
                        <p className="text-lg font-bold text-stone-100">{ability.value}</p>
                        <p className="text-xs text-stone-400">{getModifier(ability.value)}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-stone-700 mx-auto mb-3" />
                  <p className="text-stone-400 mb-4">You don&apos;t have a character yet</p>
                  <p className="text-sm text-stone-500">Contact your DM to create your character</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Stats Sidebar */}
        <div className="space-y-4">
          {character && (
            <>
              <Card className="p-4 bg-stone-950/90 backdrop-blur-xl border-stone-900">
                <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-3">Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Proficiency</span>
                    <span className="text-stone-200">+{character.proficiency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Speed</span>
                    <span className="text-stone-200">{character.speed} ft.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Languages</span>
                    <span className="text-stone-200">{character.alignment || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Background</span>
                    <span className="text-stone-200 truncate ml-2">{character.background || 'N/A'}</span>
                  </div>
                </div>
              </Card>

              {character.inspiration && (
                <Card className="p-4 bg-gradient-to-br from-amber-950/30 to-stone-950/90 border-amber-900/50">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✨</span>
                    <div>
                      <p className="text-sm font-semibold text-amber-200">Inspiration</p>
                      <p className="text-xs text-amber-400/70">You have inspiration!</p>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* News Section */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <Scroll className="h-5 w-5 text-red-400" />
          <h2 className="text-2xl font-bold text-stone-200">Campaign News</h2>
        </div>

        <NewsCarousel posts={newsPosts} />
      </div>
    </div>
  );
}
