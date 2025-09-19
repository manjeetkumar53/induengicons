import { createClient } from 'redis'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Create and connect Redis client
    const redis = createClient({
      url: process.env.REDIS_URL
    })
    await redis.connect()

    const body = await request.json()
    const { name, email, phone, company, projectType, message } = body

    // Validate required fields
    if (!name || !email || !message) {
      await redis.disconnect()
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      await redis.disconnect()
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Create contact submission object
    const contactSubmission = {
      id: Date.now().toString(),
      name,
      email,
      phone: phone || '',
      company: company || '',
      projectType: projectType || '',
      message,
      timestamp: new Date().toISOString(),
      status: 'new'
    }

    // Store in Redis
    const key = `contact:${contactSubmission.id}`
    await redis.set(key, JSON.stringify(contactSubmission))

    // Also add to a list for easy retrieval
    await redis.lPush('contact:submissions', key)

    // Set expiration for 1 year (optional - for data management)
    await redis.expire(key, 365 * 24 * 60 * 60)

    // Disconnect Redis
    await redis.disconnect()

    return NextResponse.json(
      { 
        success: true, 
        message: 'Contact form submitted successfully!',
        id: contactSubmission.id
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Contact form submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve contact submissions (for admin use)
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

    return NextResponse.json({
      success: true,
      submissions: submissions.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    })

  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}