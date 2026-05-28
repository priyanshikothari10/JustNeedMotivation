import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const history = user.learningHistory || []
    const roadmap = user.roadmap || []
    const pomodoro = user.pomodoroStats || []

    // 1. Identify weak concepts based on quiz history (quizzes with score < 75%)
    const weakConceptsMap = {}
    history.forEach(act => {
      if (act.type === 'quiz' && act.score !== undefined) {
        const title = act.title.replace(/Quiz:?\s*/i, '').trim()
        if (act.score < 75) {
          weakConceptsMap[title] = {
            title,
            lowScore: act.score,
            totalQuestions: act.totalQuestions || 5,
            attempts: (weakConceptsMap[title]?.attempts || 0) + 1,
            timestamp: act.timestamp
          }
        } else {
          // If they later passed with high score, remove it from weak concepts
          if (weakConceptsMap[title] && act.score >= 75) {
            delete weakConceptsMap[title]
          }
        }
      }
    })
    const weakConcepts = Object.values(weakConceptsMap)

    // 2. Compute course goal completion percentage (average of roadmap item progress)
    let totalProgressSum = 0
    let completedGoals = 0
    roadmap.forEach(item => {
      totalProgressSum += item.progress || 0
      if (item.progress === 100) {
        completedGoals++
      }
    })
    const overallProgress = roadmap.length ? Math.round(totalProgressSum / roadmap.length) : 0

    // 3. Compute total focus hours (from pomodoro stats)
    let totalFocusSeconds = 0
    let totalCompletedSessions = 0
    pomodoro.forEach(stat => {
      totalFocusSeconds += stat.totalFocusSeconds || 0
      totalCompletedSessions += stat.completedSessions || 0
    })
    const totalFocusMinutes = Math.round(totalFocusSeconds / 60)

    // 4. Activity breakdown count
    const breakdown = { lesson: 0, video: 0, note: 0, quiz: 0, topic: 0 }
    history.forEach(act => {
      if (breakdown[act.type] !== undefined) {
        breakdown[act.type]++
      }
    })

    return NextResponse.json({
      success: true,
      analytics: {
        streak: user.streak || 0,
        longestStreak: user.longestStreak || 0,
        completedGoals,
        totalGoals: roadmap.length,
        overallProgress,
        totalFocusMinutes,
        totalCompletedSessions,
        weakConcepts,
        breakdown
      }
    })
  } catch (error) {
    console.error('Learning Analytics GET Error:', error)
    return NextResponse.json({ error: 'Server error retrieving analytics' }, { status: 500 })
  }
}
