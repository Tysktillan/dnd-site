import { Card } from "@/components/ui/card";
import { BookOpen, Swords, Music, Calendar, StickyNote, FileText } from "lucide-react";
import Link from "next/link";

export default function DMDashboard() {
  const features = [
    {
      title: "Kampanjer",
      description: "Hantera dina kampanjmanuskript och kapitel",
      icon: BookOpen,
      href: "/campaigns",
      color: "text-red-400"
    },
    {
      title: "Sessions",
      description: "Planera och följ dina sessions",
      icon: Calendar,
      href: "/sessions",
      color: "text-red-300"
    },
    {
      title: "Stridsverktyg",
      description: "Spåra initiativ och stridsmöten",
      icon: Swords,
      href: "/combat",
      color: "text-red-500"
    },
    {
      title: "Planering",
      description: "Organisera tillgångar, bilder och videor för sessions",
      icon: FileText,
      href: "/planner",
      color: "text-stone-300"
    },
    {
      title: "Anteckningar",
      description: "Snabba anteckningar för SLP:er, platser och uppdrag",
      icon: StickyNote,
      href: "/notes",
      color: "text-stone-400"
    },
    {
      title: "Ljudbord",
      description: "Omgivningsljud och musik för inlevelse",
      icon: Music,
      href: "/soundboard",
      color: "text-red-400"
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-6xl font-black tracking-tighter mb-4">
          <span className="bg-gradient-to-b from-stone-100 via-stone-300 to-red-900 bg-clip-text text-transparent">
            Välkommen till Barovia
          </span>
        </h1>
        <div className="h-px w-48 mx-auto bg-gradient-to-r from-transparent via-red-900/50 to-transparent mb-4"></div>
        <p className="text-stone-500 text-sm tracking-[0.3em] uppercase">
          Spelledarens Kommandocentral
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.title} href={feature.href}>
              <Card className="group relative p-6 bg-stone-950/90 backdrop-blur-xl border-stone-900 hover:border-red-900/50 transition-all duration-300 cursor-pointer h-full overflow-hidden">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-900/0 via-red-900/30 to-red-900/0 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>

                <div className="relative flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-black/50 border border-stone-900 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-stone-100 mb-1 group-hover:text-white transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-stone-500 group-hover:text-stone-400 transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-12 relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-900/20 to-transparent rounded-2xl blur"></div>
        <div className="relative p-8 bg-stone-950/90 backdrop-blur-xl border border-red-950/30 rounded-2xl">
          <h2 className="text-2xl font-bold text-stone-200 mb-4 flex items-center gap-2">
            <span className="text-red-500">⚔</span> Kom igång
          </h2>
          <ul className="text-stone-400 space-y-3 text-sm leading-relaxed">
            <li className="flex items-start gap-3">
              <span className="text-red-800 mt-1">•</span>
              <span>Skapa en kampanj för att krönikera din nedstigning i mörkret</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-800 mt-1">•</span>
              <span>Planera sessions med tidslinjehändelser och nyckelmöten</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-800 mt-1">•</span>
              <span>Spåra stridsinitiativ och hantera dödliga möten</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-800 mt-1">•</span>
              <span>Dokumentera SLP:er, platser och hemligheterna de bär på</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-800 mt-1">•</span>
              <span>Sätt stämningen med atmosfäriska ljudlandskap och musik</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
