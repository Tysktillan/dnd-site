'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  BookOpen,
  FileText,
  Swords,
  Music,
  Calendar,
  StickyNote,
  Home,
  Images,
  LogOut,
  Shield,
  User as UserIcon,
  Users,
  Sparkles,
  Video,
  Newspaper
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const dmNavigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Players', href: '/players', icon: Users },
  { name: 'Magical Items', href: '/items', icon: Sparkles },
  { name: 'News', href: '/news', icon: Newspaper },
  { name: 'Campaigns', href: '/campaigns', icon: BookOpen },
  { name: 'Sessions', href: '/sessions', icon: Calendar },
  { name: 'Media Library', href: '/media', icon: Images },
  { name: 'Notes', href: '/notes', icon: StickyNote },
  { name: 'Combat Tracker', href: '/combat', icon: Swords },
  { name: 'Session Planner', href: '/planner', icon: FileText },
  { name: 'Soundboard', href: '/soundboard', icon: Music },
]

const playerNavigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Character', href: '/character', icon: UserIcon },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [character, setCharacter] = useState<{
    className?: string
    className2?: string
    level: number
    level2?: number
    backgroundUrl?: string
  } | null>(null)

  useEffect(() => {
    // Fetch player character if user is a player
    if (session?.user?.role === 'player') {
      fetch('/api/character')
        .then(res => res.ok ? res.json() : null)
        .then(data => setCharacter(data))
        .catch(() => setCharacter(null))
    }
  }, [session])

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  // Determine navigation based on user role
  const navigation = session?.user?.role === 'dm' ? dmNavigation : playerNavigation

  return (
    <div className="flex h-full w-64 flex-col border-r border-stone-900 bg-stone-950/90 backdrop-blur-xl text-stone-100 relative">
      {/* Gothic border glow */}
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-red-900/30 to-transparent"></div>

      <div className="flex h-16 items-center border-b border-stone-900 px-6 relative">
        <h1 className="text-2xl font-black tracking-tighter relative">
          <span className="bg-gradient-to-b from-stone-100 via-stone-300 to-red-900 bg-clip-text text-transparent">
            BAROVIA
          </span>
        </h1>
      </div>

      {/* User Info */}
      {session?.user && (
        <div className="border-b border-stone-900 p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center border overflow-hidden",
              session.user.role === 'dm' ? 'bg-red-950/30 border-red-900/50' : 'bg-stone-900/30 border-stone-800/50'
            )}>
              {session.user.role === 'dm' ? (
                <Shield className="h-5 w-5 text-red-400" />
              ) : character?.backgroundUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={character.backgroundUrl}
                  alt="Character"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="h-5 w-5 text-stone-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-100 truncate">{session.user.name}</p>
              {session.user.role === 'player' && character ? (
                <p className="text-xs text-stone-500">
                  {character.className || 'Unknown'} {character.level}
                  {character.className2 && character.level2 > 0 && (
                    <> / {character.className2} {character.level2}</>
                  )}
                </p>
              ) : (
                <p className="text-xs text-stone-500 capitalize tracking-wider">{session.user.role}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group relative',
                isActive
                  ? 'bg-gradient-to-r from-red-950 via-red-900 to-red-950 text-stone-100 shadow-lg shadow-red-950/30'
                  : 'text-stone-400 hover:bg-stone-900/50 hover:text-stone-200'
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-transform group-hover:scale-110",
                isActive ? "text-red-300" : ""
              )} />
              {item.name}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-800/20 to-transparent animate-pulse rounded-xl"></div>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-stone-900 p-4 space-y-3">
        <Link
          href="/legends-of-barovia"
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group relative',
            pathname === '/legends-of-barovia'
              ? 'bg-gradient-to-r from-purple-950 via-purple-900 to-purple-950 text-stone-100 shadow-lg shadow-purple-950/30'
              : 'text-stone-400 hover:bg-stone-900/50 hover:text-stone-200'
          )}
        >
          <Video className={cn(
            "h-5 w-5 transition-transform group-hover:scale-110",
            pathname === '/legends-of-barovia' ? "text-purple-300" : ""
          )} />
          Legends of Barovia
        </Link>
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-stone-500 hover:text-stone-200 hover:bg-stone-900/50 rounded-xl transition-all"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
        <p className="text-xs text-stone-700 italic font-serif text-center">
          &quot;The mists await...&quot;
        </p>
      </div>
    </div>
  )
}
