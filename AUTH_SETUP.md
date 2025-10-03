# Authentication Setup

## Overview
NextAuth.js v5 (Auth.js) has been configured with role-based access control.

## User Accounts

### Dungeon Master
- **Username:** `dm`
- **Password:** `password123`
- **Role:** `dm`
- **Access:** All pages (campaigns, sessions, media, notes, combat, planner, soundboard)

### Players (6 accounts)
- **Usernames:** `player1`, `player2`, `player3`, `player4`, `player5`, `player6`
- **Password:** `password123` (same for all)
- **Role:** `player`
- **Access:** Currently limited to dashboard only

## Security Features

1. **Password Hashing:** All passwords are hashed with bcryptjs (10 salt rounds)
2. **Session Management:** JWT-based sessions stored securely
3. **Route Protection:** Middleware protects all routes except login
4. **Role-Based Access:** DM-only routes automatically blocked for players

## Files Created

- `lib/auth.ts` - NextAuth.js configuration
- `app/api/auth/[...nextauth]/route.ts` - Auth API routes
- `app/login/page.tsx` - Login page
- `middleware.ts` - Route protection middleware
- `components/SessionProvider.tsx` - Session context provider
- `types/next-auth.d.ts` - TypeScript type extensions
- `prisma/seed-users.ts` - User seeding script

## Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String   // Hashed
  role      String   @default("player") // 'dm' or 'player'
  name      String   // Display name
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## How It Works

1. **Login:** User enters username/password on `/login`
2. **Authentication:** NextAuth validates credentials against database
3. **Session:** JWT token created with user ID and role
4. **Middleware:** Every request checks authentication status
5. **Authorization:** Routes check user role for access control

## Next Steps

To customize passwords, you can:
1. Update the password in the database (hashed)
2. Or modify `prisma/seed-users.ts` and re-run the script

To add more users, run:
```bash
npx tsx prisma/seed-users.ts
```
