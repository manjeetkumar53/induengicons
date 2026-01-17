/**
 * Password Reset Utility
 * Allows resetting a user's password via CLI
 * Usage: npx tsx scripts/reset-password.ts <username> <new_password>
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI || process.env.ie_MONGODB_URI

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI or ie_MONGODB_URI must be defined in .env.local')
    process.exit(1)
}

// Minimal User Schema
const UserSchema = new mongoose.Schema({
    username: String,
    password: { type: String, select: false }
})

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function resetPassword() {
    const args = process.argv.slice(2)
    if (args.length < 2) {
        console.log('Usage: npx tsx scripts/reset-password.ts <username> <new_password>')
        process.exit(1)
    }

    const [username, newPassword] = args

    try {
        console.log(`🔗 Connecting to MongoDB...`)
        await mongoose.connect(MONGODB_URI!)
        console.log('✅ Connected successfully')

        const user = await User.findOne({ username })
        if (!user) {
            console.error(`❌ User not found: ${username}`)
            process.exit(1)
        }

        console.log(`🔐 Hashing new password for ${username}...`)
        const hashedPassword = await bcrypt.hash(newPassword, 12)

        await User.findByIdAndUpdate(user._id, { password: hashedPassword })
        console.log(`🎉 Password for ${username} has been reset successfully!`)

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await mongoose.disconnect()
        process.exit(0)
    }
}

resetPassword()
