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
  Newspaper,
  X,
  Scroll,
  Map
} from 'lucide-react'
import NextImage from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MapViewer } from '@/components/MapViewer'

const dmNavigation = [
  { name: 'Översikt', href: '/', icon: Home },
  { name: 'Spelare', href: '/players', icon: Users },
  { name: 'Uppdrag', href: '/quests', icon: Scroll },
  { name: 'Magiska Föremål', href: '/items', icon: Sparkles },
  { name: 'Nyheter', href: '/news', icon: Newspaper },
  { name: 'Kampanjer', href: '/campaigns', icon: BookOpen },
  { name: 'Sessions', href: '/sessions', icon: Calendar },
  { name: 'Mediabibliotek', href: '/media', icon: Images },
  { name: 'Anteckningar', href: '/notes', icon: StickyNote },
  { name: 'Stridsverktyg', href: '/combat', icon: Swords },
  { name: 'Planering', href: '/planner', icon: FileText },
  { name: 'Soundboard', href: '/soundboard', icon: Music },
]

const playerNavigation = [
  { name: 'Översikt', href: '/', icon: Home },
  { name: 'Uppdrag', href: '/quests', icon: Scroll },
  { name: 'Karaktär', href: '/character', icon: UserIcon },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [character, setCharacter] = useState<{
    className?: string
    className2?: string
    level: number
    level2?: number
    backgroundUrl?: string
  } | null>(null)
  const [isMapViewerOpen, setIsMapViewerOpen] = useState(false)

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

  // Close sidebar when clicking a link on mobile
  const handleLinkClick = () => {
    if (onClose) onClose()
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "flex h-full w-64 flex-col border-r border-stone-900 bg-stone-950/90 backdrop-blur-xl text-stone-100 relative transition-transform duration-300 ease-in-out",
        "lg:translate-x-0", // Always visible on desktop
        isOpen ? "translate-x-0" : "-translate-x-full", // Mobile slide in/out
        onClose && "fixed inset-y-0 left-0 z-50 lg:relative" // Fixed on mobile, relative on desktop
      )}>
        {/* Gothic border glow */}
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-red-900/30 to-transparent"></div>

        <div className="flex h-16 items-center border-b border-stone-900 px-6 relative justify-between">
          <h1 className="text-2xl font-black tracking-tighter relative">
            <span className="bg-gradient-to-b from-stone-100 via-stone-300 to-red-900 bg-clip-text text-transparent">
              BAROVIA
            </span>
          </h1>
          {/* Close button for mobile */}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden text-stone-400 hover:text-stone-200"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* User Info */}
        {session?.user && (
          <div className="border-b border-stone-900 p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border overflow-hidden relative",
                session.user.role === 'dm' ? 'bg-red-950/30 border-red-900/50' : 'bg-stone-900/30 border-stone-800/50'
              )}>
                {session.user.role === 'dm' ? (
                  <Shield className="h-5 w-5 text-red-400" />
                ) : character?.backgroundUrl ? (
                  <NextImage
                    src={character.backgroundUrl}
                    alt="Character"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <UserIcon className="h-5 w-5 text-stone-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-100 truncate">{session.user.name}</p>
                {session.user.role === 'player' && character ? (
                  <p className="text-xs text-stone-500">
                    {character.className || 'Okänd'} {character.level}
                    {character.className2 && character.level2 && character.level2 > 0 && (
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
                onClick={handleLinkClick}
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
          <button
            onClick={() => setIsMapViewerOpen(true)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group relative w-full text-stone-400 hover:bg-stone-900/50 hover:text-stone-200"
          >
            <Map className="h-5 w-5 transition-transform group-hover:scale-110" />
            Karta över Barovia
          </button>
          <Link
            href="/legends-of-barovia"
            onClick={handleLinkClick}
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
            Logga ut
          </Button>
          <p className="text-xs text-stone-700 italic font-serif text-center">
            &quot;Dimmorna väntar...&quot;
          </p>
        </div>
      </div >

      {/* Map Viewer Modal */}
      <MapViewer
        isOpen={isMapViewerOpen}
        onClose={() => setIsMapViewerOpen(false)}
        imageUrl="https://uq61vjqz6vkmqy0m.public.blob.vercel-storage.com/1759528270507-Barovia.png"
        title="Karta över Barovia"
      />
    </>
  )
}
