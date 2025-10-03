# Neon Database Setup Guide

## Step 1: Create a Neon Account

1. Go to [https://console.neon.tech/](https://console.neon.tech/)
2. Sign up with GitHub, Google, or email (it's free!)
3. Verify your email if needed

## Step 2: Create a New Project

1. Once logged in, click **"Create a project"**
2. Fill in the details:
   - **Project name**: `dm-suite` (or whatever you prefer)
   - **Region**: Choose the closest to you (e.g., US East, EU West)
   - **PostgreSQL version**: Keep default (16 recommended)
3. Click **"Create project"**

## Step 3: Get Your Connection Strings

After creating the project, you'll see a **Connection Details** page.

### You need TWO connection strings:

#### 1. **Pooled Connection** (for DATABASE_URL)
- Look for the connection string with `?pgbouncer=true`
- It will look like:
```
postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=10
```

#### 2. **Direct Connection** (for DIRECT_URL)
- This is the connection string WITHOUT `pgbouncer=true`
- It will look like:
```
postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**TIP**: You can toggle between "Pooled connection" and "Direct connection" using the dropdown on the connection string page.

## Step 4: Update Your .env File

1. Open `dm-site/.env`
2. Replace the placeholder values:

```env
# Replace these with your actual connection strings from Step 3
DATABASE_URL="your_pooled_connection_string_here"
DIRECT_URL="your_direct_connection_string_here"
```

**IMPORTANT**: Make sure to copy the ENTIRE connection string including:
- Username and password
- Host URL
- Database name
- All query parameters (`?sslmode=require`, etc.)

## Step 5: Run Database Migration

Open your terminal in the `dm-site` directory and run:

```bash
npx prisma migrate dev --name init_neon
```

This will:
- Create all your tables in Neon
- Generate the Prisma Client for PostgreSQL

## Step 6: Test the Connection

Start your development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and try:
- Creating a campaign
- Adding a note
- Starting a combat

If everything works, you're connected to Neon! 🎉

## Step 7: Deploy (Optional)

When deploying to Vercel/Netlify:

1. Add environment variables in your hosting platform:
   - `DATABASE_URL` = Your pooled connection string
   - `DIRECT_URL` = Your direct connection string

2. Deploy your app

3. Your data will persist across deployments!

## Troubleshooting

### "Can't reach database server"
- Check your connection strings are correct
- Make sure you have internet connection
- Verify the Neon project is active (not suspended)

### "SSL connection required"
- Make sure your connection strings include `?sslmode=require`

### "Password authentication failed"
- Double-check you copied the full connection string including password
- Regenerate password in Neon console if needed

## Neon Features You Get

✅ **Free tier**: 0.5 GB storage, 512 MB RAM
✅ **Automatic backups**
✅ **Branching**: Create database branches for testing
✅ **Auto-suspend**: Saves resources when inactive
✅ **Connection pooling**: Built-in with pgBouncer

## Need Help?

- [Neon Documentation](https://neon.tech/docs/introduction)
- [Prisma + Neon Guide](https://www.prisma.io/docs/guides/database/neon)
- Check the Neon console for connection details

---

**Next Steps**: After setup, read the main README.md for using the DM Suite features!
