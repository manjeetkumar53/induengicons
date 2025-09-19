import { createClient } from 'redis'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Create and connect Redis client
    const redis = createClient({
      url: process.env.REDIS_URL
    })
    await redis.connect()

    // Get list of all submission keys
    const submissionKeys = await redis.lRange('contact:submissions', 0, -1)
    
    // Fetch all submissions
    const submissions = []
    for (const key of submissionKeys) {
      const submission = await redis.get(key)
      if (submission) {
        submissions.push(JSON.parse(submission))
      }
    }

    // Disconnect Redis
    await redis.disconnect()

    // Sort by timestamp (newest first)
    const sortedSubmissions = submissions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return NextResponse.json({
      success: true,
      count: sortedSubmissions.length,
      submissions: sortedSubmissions
    })

  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}