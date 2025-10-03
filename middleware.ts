import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if user has session token
  const sessionToken = request.cookies.get('authjs.session-token') || request.cookies.get('__Secure-authjs.session-token')
  const isLoggedIn = !!sessionToken
  const isOnLogin = pathname === '/login'

  // If on login page and logged in, redirect to home
  if (isOnLogin && isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If not logged in and not on login page, redirect to login
  if (!isLoggedIn && !isOnLogin) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads).*)'],
}
