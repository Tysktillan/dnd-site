'use client'

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
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Campaigns', href: '/campaigns', icon: BookOpen },
  { name: 'Sessions', href: '/sessions', icon: Calendar },
  { name: 'Media Library', href: '/media', icon: Images },
  { name: 'Notes', href: '/notes', icon: StickyNote },
  { name: 'Combat Tracker', href: '/combat', icon: Swords },
  { name: 'Session Planner', href: '/planner', icon: FileText },
  { name: 'Soundboard', href: '/soundboard', icon: Music },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-slate-950 text-slate-100">
      <div className="flex h-16 items-center border-b border-slate-800 px-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          DM Suite
        </h1>
      </div>

      {/* User Info */}
      {session?.user && (
        <div className="border-b border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              session.user.role === 'dm' ? 'bg-purple-900/30' : 'bg-blue-900/30'
            )}>
              {session.user.role === 'dm' ? (
                <Shield className="h-5 w-5 text-purple-400" />
              ) : (
                <User className="h-5 w-5 text-blue-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{session.user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{session.user.role}</p>
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
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-slate-800 p-4 space-y-3">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
        <p className="text-xs text-slate-500">
          Dungeon Master Tools v1.0
        </p>
      </div>
    </div>
  )
}
