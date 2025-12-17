import dbConnect from '@/lib/mongodb'
import { Contact } from '@/lib/models'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { name, email, phone, company, projectType, message } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Create contact submission in MongoDB
    const contactSubmission = await Contact.create({
      name,
      email,
      phone: phone || '',
      company: company || '',
      projectType: projectType || '',
      message,
      status: 'new'
    })

    return NextResponse.json(
      { 
        success: true, 
        message: 'Contact form submitted successfully!',
        id: contactSubmission._id.toString()
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
    await dbConnect()

    // Get all contact submissions sorted by newest first
    const submissions = await Contact.find({})
      .sort({ createdAt: -1 })
      .lean()

    // Convert MongoDB _id to id for frontend compatibility
    const formattedSubmissions = submissions.map(submission => ({
      id: submission._id.toString(),
      name: submission.name,
      email: submission.email,
      phone: submission.phone || '',
      company: submission.company || '',
      projectType: submission.projectType || '',
      message: submission.message,
      status: submission.status,
      timestamp: submission.timestamp || submission.createdAt
    }))

    return NextResponse.json({
      success: true,
      submissions: formattedSubmissions
    })

  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}