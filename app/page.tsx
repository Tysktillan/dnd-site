import { Card } from "@/components/ui/card";
import { BookOpen, Swords, Music, Calendar, StickyNote, FileText } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const features = [
    {
      title: "Campaigns",
      description: "Manage your campaign manuscripts and chapters",
      icon: BookOpen,
      href: "/campaigns",
      color: "text-purple-400"
    },
    {
      title: "Sessions",
      description: "Plan and track your game sessions",
      icon: Calendar,
      href: "/sessions",
      color: "text-blue-400"
    },
    {
      title: "Combat Tracker",
      description: "Track initiative and combat encounters",
      icon: Swords,
      href: "/combat",
      color: "text-red-400"
    },
    {
      title: "Session Planner",
      description: "Organize assets, images, and videos for sessions",
      icon: FileText,
      href: "/planner",
      color: "text-green-400"
    },
    {
      title: "Notes",
      description: "Quick notes for NPCs, locations, and quests",
      icon: StickyNote,
      href: "/notes",
      color: "text-yellow-400"
    },
    {
      title: "Soundboard",
      description: "Ambient sounds and music for immersion",
      icon: Music,
      href: "/soundboard",
      color: "text-pink-400"
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome, Dungeon Master
        </h1>
        <p className="text-slate-400">
          Your complete toolkit for running epic D&D sessions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.title} href={feature.href}>
              <Card className="p-6 bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer h-full">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-slate-900 ${feature.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-800/30 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-2">Quick Start</h2>
        <ul className="text-slate-300 space-y-2 text-sm">
          <li>• Create a campaign to organize your adventure</li>
          <li>• Add sessions to plan and track your games</li>
          <li>• Use the combat tracker during battles</li>
          <li>• Take notes on NPCs, locations, and story beats</li>
          <li>• Prepare media in the session planner to show your players</li>
        </ul>
      </div>
    </div>
  );
}
