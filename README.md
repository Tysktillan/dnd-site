# DM Suite - Dungeon Master Tools

A modern, clean web application for Dungeon Masters to manage their D&D campaigns, track combat, take notes, and run sessions.

## Features

### 📖 Campaign Management
- Create and manage multiple campaigns
- Write and organize your campaign manuscript in chapters
- Markdown support for rich text formatting
- Easy chapter navigation and editing

### 📝 Session Notes
- Track game sessions with dates and session numbers
- Take detailed session notes
- Write post-session summaries
- Organize all your session history

### ⚔️ Combat Tracker
- Real-time initiative tracking
- Add players and monsters to combat
- Track HP, AC, and conditions
- Advance rounds and turns automatically
- Save combat history with outcomes
- Quick HP adjustment buttons

### 🎬 Session Planner
- Prepare images, videos, and notes to show your players
- Presentation mode for displaying content
- Track what has been shown vs. hidden
- Support for images, videos, embedded URLs, and text notes

### 🔊 Soundboard
- Organize ambient sounds, music, and sound effects
- Play audio directly from the browser
- Categorize sounds (music, ambience, SFX)

### 📋 Quick Notes
- Take quick notes on NPCs, locations, quests, and items
- Categorize and tag notes for easy searching
- Search functionality
- Filter by category

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Database**: PostgreSQL via Neon (serverless)
- **ORM**: Prisma
- **UI**: Tailwind CSS + shadcn/ui components
- **Styling**: Clean, modern dark theme

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or pnpm
- A Neon database account (free tier available)

### Installation

1. **Clone or navigate to the project**:
```bash
cd dm-site
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up Neon Database**:
   - Follow the detailed guide in [NEON_SETUP_GUIDE.md](./NEON_SETUP_GUIDE.md)
   - Create a free Neon account at [https://console.neon.tech/](https://console.neon.tech/)
   - Copy your connection strings to `.env` file

4. **Run database migrations**:
```bash
npx prisma migrate dev --name init
```

5. **Start the development server**:
```bash
npm run dev
```

6. **Open** [http://localhost:3000](http://localhost:3000) in your browser

### Quick Neon Setup

If you haven't set up Neon yet:

1. Go to [https://console.neon.tech/](https://console.neon.tech/)
2. Create a new project
3. Get your connection strings (pooled + direct)
4. Update `.env` with your connection strings
5. Run `npx prisma migrate dev`

See [NEON_SETUP_GUIDE.md](./NEON_SETUP_GUIDE.md) for detailed instructions with screenshots.

## Usage

### First Time Setup

1. **Create a Campaign** - Go to Campaigns and create your first campaign
2. **Add Chapters** - Click on a campaign to add manuscript chapters
3. **Create a Session** - Use the Sessions page to plan your next game
4. **Add Notes** - Use the Notes page for quick reference material
5. **Set Up Sounds** - Add ambient music and sound effects to your soundboard

### During a Session

1. **Combat Tracker** - Start a new combat when initiative is rolled
   - Add all combatants with their initiative rolls
   - Track HP and conditions during battle
   - Use "Next Turn" to advance through combat
   - End combat with the outcome when finished

2. **Session Planner** - Prepare media before the session
   - Add images, maps, videos, or notes
   - Use "Present" mode to display content to players
   - Navigate through slides with Next/Previous buttons

3. **Soundboard** - Play atmospheric audio during the session
   - Click any sound to play/pause
   - Only one sound plays at a time

4. **Notes** - Quick reference for NPCs, locations, etc.
   - Search and filter to find information quickly

### After a Session

1. **Session Notes** - Update your session with what happened
2. **Combat History** - Review past combats and their outcomes
3. **Campaign Chapters** - Update your manuscript with new plot developments

## Database

All data is stored in **Neon PostgreSQL** (cloud-hosted, serverless). This includes:
- Campaigns and chapters
- Sessions and session notes
- Combat encounters and initiatives
- Notes
- Planner items
- Sounds

### Why Neon?

✅ **Persistent** - Data survives across deployments
✅ **Free tier** - 0.5 GB storage, perfect for personal use
✅ **Serverless** - Works perfectly with Vercel/Netlify
✅ **No setup** - Just copy connection strings
✅ **Automatic backups** - Your data is safe

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel:
   - `DATABASE_URL` = Your Neon pooled connection string
   - `DIRECT_URL` = Your Neon direct connection string
4. Deploy!

Your DM Suite will be live with persistent data storage.

### Other Platforms

Works with any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

Just add the environment variables and deploy.

## Future Enhancements

- Player view/login for showing specific content to players
- Dice roller integration
- Character sheet management
- Inventory tracking
- Campaign calendar/timeline
- Export/import functionality
- File upload for local audio/images
- Mobile-responsive improvements

## License

MIT

## Author

Built with Claude Code for Dungeon Masters everywhere.
