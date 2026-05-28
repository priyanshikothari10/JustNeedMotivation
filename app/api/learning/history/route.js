import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const history = user.learningHistory || []

    // Grouping calculations based on date
    const now = new Date()
    
    // Today boundary (midnight)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    // This week boundary (7 days ago)
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const todayActivities = []
    const weekActivities = []
    const entireActivities = [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    let lessonsCount = 0
    let videosCount = 0
    let notesCount = 0
    let quizzesCount = 0

    history.forEach(act => {
      const actDate = new Date(act.timestamp)
      
      if (actDate >= todayStart) {
        todayActivities.push(act)
      }
      if (actDate >= weekStart) {
        weekActivities.push(act)
      }

      if (act.type === 'lesson') lessonsCount++
      else if (act.type === 'video') videosCount++
      else if (act.type === 'note') notesCount++
      else if (act.type === 'quiz') quizzesCount++
    })

    // Sort today and week activities descending
    todayActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    weekActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    return NextResponse.json({
      success: true,
      summary: {
        total: history.length,
        lessons: lessonsCount,
        videos: videosCount,
        notes: notesCount,
        quizzes: quizzesCount
      },
      categorized: {
        today: todayActivities,
        thisWeek: weekActivities,
        entireCourse: entireActivities
      }
    })
  } catch (error) {
    console.error('Learning History GET Error:', error)
    return NextResponse.json({ error: 'Server error retrieving history' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, title, details, score, totalQuestions } = body || {}

    if (!type || !title) {
      return NextResponse.json({ error: 'Missing type or title' }, { status: 400 })
    }

    const allowedTypes = ['lesson', 'video', 'note', 'quiz', 'topic']
    if (!allowedTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid activity type' }, { status: 400 })
    }

    const newActivity = {
      type,
      title,
      details: details || '',
      score: score !== undefined ? Number(score) : undefined,
      totalQuestions: totalQuestions !== undefined ? Number(totalQuestions) : undefined,
      timestamp: new Date()
    }

    if (!user.learningHistory) {
      user.learningHistory = []
    }

    user.learningHistory.push(newActivity)

    // Save user document
    await user.save()

    return NextResponse.json({
      success: true,
      activity: user.learningHistory[user.learningHistory.length - 1]
    })
  } catch (error) {
    console.error('Learning History POST Error:', error)
    return NextResponse.json({ error: 'Server error saving history' }, { status: 500 })
  }
}
