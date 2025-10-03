import { put } from '@vercel/blob'
import { PrismaClient } from '@prisma/client'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

async function migrateToBlob() {
  console.log('Starting migration to Vercel Blob...\n')

  // Migrate audio files
  const audioDir = join(process.cwd(), 'public', 'uploads', 'audio')
  const audioFiles = readdirSync(audioDir)

  console.log(`Found ${audioFiles.length} audio files to migrate`)

  for (const filename of audioFiles) {
    try {
      const filepath = join(audioDir, filename)
      const file = readFileSync(filepath)

      // Upload to Vercel Blob (overwrite if exists)
      const blob = await put(`audio/${filename}`, file, {
        access: 'public',
        addRandomSuffix: false,
      })

      // Update database records
      const oldUrl = `/uploads/audio/${filename}`
      const result = await prisma.media.updateMany({
        where: { url: oldUrl },
        data: { url: blob.url }
      })

      console.log(`✓ Migrated: ${filename} (${result.count} DB records updated)`)
    } catch (error) {
      console.error(`✗ Failed to migrate ${filename}:`, error)
    }
  }

  // Migrate image files
  const imageDir = join(process.cwd(), 'public', 'uploads', 'images')
  const imageFiles = readdirSync(imageDir)

  console.log(`\nFound ${imageFiles.length} image files to migrate`)

  for (const filename of imageFiles) {
    try {
      const filepath = join(imageDir, filename)
      const file = readFileSync(filepath)

      // Upload to Vercel Blob (overwrite if exists)
      const blob = await put(`images/${filename}`, file, {
        access: 'public',
        addRandomSuffix: false,
      })

      // Update database records
      const oldUrl = `/uploads/images/${filename}`
      const result = await prisma.media.updateMany({
        where: { url: oldUrl },
        data: { url: blob.url }
      })

      console.log(`✓ Migrated: ${filename} (${result.count} DB records updated)`)
    } catch (error) {
      console.error(`✗ Failed to migrate ${filename}:`, error)
    }
  }

  console.log('\n✅ Migration complete!')
}

migrateToBlob()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
