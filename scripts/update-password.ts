import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function updatePassword() {
  const username = process.argv[2]
  const newPassword = process.argv[3]

  if (!username || !newPassword) {
    console.error('Usage: npm run update-password <username> <new-password>')
    process.exit(1)
  }

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update the user's password
    const user = await prisma.user.update({
      where: { username },
      data: { password: hashedPassword }
    })

    console.log(`✓ Password updated successfully for user: ${user.name} (${user.username})`)
  } catch (error) {
    console.error('Error updating password:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

updatePassword()
