import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Student from '@/models/Student'

// GET /api/student?name=...
export async function GET(request) {
  try {
    // ✅ Correct way to get query params (fixes Vercel build error)
    const name = request.nextUrl.searchParams.get('name')

    if (!name) {
      return NextResponse.json(
        { error: 'Missing name query param' },
        { status: 400 }
      )
    }

    await connectDB()

    let student = await Student.findOne({ name }).lean()

    // If student doesn't exist, create new
    if (!student) {
      student = await Student.create({
        name,
        roadmap: [],
        tasks: [],
        streak: 0,
        lastUpdated: null
      })
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

// POST /api/student
// Body: { name, roadmap: string[] }
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, roadmap = [] } = body || {}

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    await connectDB()

    const updated = await Student.findOneAndUpdate(
      { name },
      { $set: { roadmap } },
      { new: true, upsert: true }
    )

    return NextResponse.json(updated)
  } catch (error) {
    console.error('POST Error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}