import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        // Find user with case-insensitive username search
        const user = await prisma.user.findFirst({
          where: {
            username: {
              equals: credentials.username as string,
              mode: 'insensitive'
            }
          },
        })

        if (!user) {
          return null
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordMatch) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnLogin = nextUrl.pathname === '/login'

      // If on login page and logged in, redirect to home
      if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl))
      }

      // If not logged in and not on login page, redirect to login
      if (!isLoggedIn && !isOnLogin) {
        return Response.redirect(new URL('/login', nextUrl))
      }

      // DM-only routes
      const dmOnlyRoutes = [
        '/players',
        '/items',
        '/campaigns',
        '/sessions',
        '/media',
        '/notes',
        '/combat',
        '/planner',
        '/soundboard',
      ]

      const isDMOnlyRoute = dmOnlyRoutes.some(route => nextUrl.pathname.startsWith(route))

      // If player tries to access DM-only route, redirect to home
      if (isLoggedIn && isDMOnlyRoute && auth?.user?.role !== 'dm') {
        return Response.redirect(new URL('/', nextUrl))
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
})
