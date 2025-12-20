import dbConnect from '@/lib/mongodb'
import { Contact } from '@/lib/models'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await dbConnect()

    // Get all contact submissions sorted by newest first
    const submissions = await Contact.find({})
      .sort({ createdAt: -1 })
      .lean()

    // Convert MongoDB _id to id for frontend compatibility
    const formattedSubmissions = submissions.map((submission: any) => ({
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
      count: formattedSubmissions.length,
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