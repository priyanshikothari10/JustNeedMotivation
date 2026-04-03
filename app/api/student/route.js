import { NextResponse } from 'next/server'
import { connectDB } from '../../../lib/mongodb'
import Student from '../../../models/Student'

// GET /api/student?name=...
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')

  if (!name) {
    return NextResponse.json({ error: 'Missing name query param' }, { status: 400 })
  }

  await connectDB()

  let student = await Student.findOne({ name }).lean()
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
}

// POST /api/student
// Body: { name, roadmap: string[] }
export async function POST(request) {
  const body = await request.json()
  const { name, roadmap = [] } = body || {}

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  await connectDB()

  const updated = await Student.findOneAndUpdate(
    { name },
    { $set: { roadmap } },
    { new: true, upsert: true }
  )

  return NextResponse.json(updated)
}

