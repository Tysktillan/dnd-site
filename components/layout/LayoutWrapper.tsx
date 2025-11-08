'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { QuickControls } from '../QuickControls'
import { Button } from '@/components/ui/button'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Don't show sidebar and navigation on login page
  const isAuthPage = pathname === '/login'

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-black via-stone-950 to-black relative">
      {/* Subtle atmospheric effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-red-900/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-red-950/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-40 pointer-events-none"></div>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMobileMenuOpen(true)}
        className="fixed top-4 left-4 z-30 lg:hidden bg-stone-950/90 backdrop-blur-xl border border-stone-800 text-stone-100 hover:bg-stone-900 hover:text-stone-100"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar - hidden on mobile by default, shows via overlay when menu opened */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </div>

      <main className="flex-1 overflow-y-auto relative z-10">
        {/* Add top padding on mobile to account for hamburger button */}
        <div className="lg:p-0 pt-16 lg:pt-0">
          {children}
        </div>
      </main>
      <QuickControls />
    </div>
  )
}
