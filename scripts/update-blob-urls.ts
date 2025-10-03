import { PrismaClient } from '@prisma/client'
import { list } from '@vercel/blob'

const prisma = new PrismaClient()

async function updateBlobUrls() {
  console.log('Fetching blobs from Vercel...\n')

  // Get all blobs from Vercel
  const { blobs } = await list()

  console.log(`Found ${blobs.length} blobs in Vercel storage\n`)

  let updatedCount = 0

  for (const blob of blobs) {
    // Extract filename from blob pathname (e.g., "audio/1759342071061-quiet-tavern.mp3")
    const parts = blob.pathname.split('/')
    const type = parts[0] // 'audio' or 'images'
    const filename = parts[1]

    // Construct old URL
    const oldUrl = `/uploads/${type}/${filename}`

    // Update database based on type
    if (type === 'audio') {
      const result = await prisma.audioAsset.updateMany({
        where: { url: oldUrl },
        data: { url: blob.url }
      })
      if (result.count > 0) {
        console.log(`✓ Updated audio ${filename}: ${oldUrl} → ${blob.url}`)
        updatedCount += result.count
      }
    } else if (type === 'images') {
      const result = await prisma.imageAsset.updateMany({
        where: { url: oldUrl },
        data: { url: blob.url }
      })
      if (result.count > 0) {
        console.log(`✓ Updated image ${filename}: ${oldUrl} → ${blob.url}`)
        updatedCount += result.count
      }
    }
  }

  console.log(`\n✅ Updated ${updatedCount} database records`)
}

updateBlobUrls()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
