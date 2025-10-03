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
    <div className="flex h-screen overflow-hidden bg-slate-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <QuickControls />
    </div>
  )
}
