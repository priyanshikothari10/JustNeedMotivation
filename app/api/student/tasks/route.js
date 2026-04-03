import { NextResponse } from 'next/server'
import { connectDB } from '../../../../lib/mongodb'
import Student from '../../../../models/Student'

function getTodayKey() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

function updateStreak(studentDoc, completedNow) {
  if (!completedNow) return studentDoc

  const todayKey = getTodayKey()
  const today = new Date(todayKey)
  const last = studentDoc.lastUpdated ? new Date(studentDoc.lastUpdated) : null

  if (!last || isNaN(last)) {
    studentDoc.streak = 1
  } else {
    const diffDays = Math.round((today - last) / (24 * 60 * 60 * 1000))
    if (diffDays === 1) {
      studentDoc.streak = (studentDoc.streak || 0) + 1
    } else if (diffDays > 1) {
      studentDoc.streak = 1
    }
  }

  studentDoc.lastUpdated = today
  return studentDoc
}

// POST /api/student/tasks  -> add task
// Body: { name, title }
export async function POST(request) {
  const body = await request.json()
  const { name, title } = body || {}

  if (!name || !title) {
    return NextResponse.json({ error: 'Name and title are required' }, { status: 400 })
  }

  await connectDB()

  const student =
    (await Student.findOne({ name })) ||
    (await Student.create({ name, roadmap: [], tasks: [], streak: 0 }))

  student.tasks.push({
    title,
    status: 'pending'
  })

  await student.save()

  return NextResponse.json(student)
}

// PATCH /api/student/tasks  -> update task status
// Body: { name, taskId, status }
export async function PATCH(request) {
  const body = await request.json()
  const { name, taskId, status } = body || {}

  if (!name || !taskId || !status) {
    return NextResponse.json({ error: 'Name, taskId and status are required' }, { status: 400 })
  }

  await connectDB()

  const student = await Student.findOne({ name })
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const task = student.tasks.id(taskId)
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  const completedNow = status === 'completed' && task.status !== 'completed'

  task.status = status
  if (status === 'completed') {
    task.completedAt = new Date()
  } else {
    task.completedAt = null
  }

  updateStreak(student, completedNow)

  await student.save()

  return NextResponse.json(student)
}

