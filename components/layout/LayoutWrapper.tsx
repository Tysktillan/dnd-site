'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { QuickControls } from '../QuickControls'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

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

      <Sidebar />
      <main className="flex-1 overflow-y-auto relative z-10">
        {children}
      </main>
      <QuickControls />
    </div>
  )
}
