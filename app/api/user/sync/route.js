import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      tasks, 
      focusGoal, 
      roadmap, 
      pomodoroStats, 
      journalEntries, 
      challenges,
      favoriteQuotes,
      streak,
      longestStreak,
      lastStreakDate
    } = body || {}

    // Update fields if provided in body
    if (tasks !== undefined) user.tasks = tasks
    if (focusGoal !== undefined) user.focusGoal = focusGoal
    if (roadmap !== undefined) user.roadmap = roadmap
    if (journalEntries !== undefined) user.journalEntries = journalEntries
    if (challenges !== undefined) user.challenges = challenges
    if (favoriteQuotes !== undefined) user.favoriteQuotes = favoriteQuotes
    if (streak !== undefined) user.streak = streak
    if (longestStreak !== undefined) user.longestStreak = longestStreak
    if (lastStreakDate !== undefined) user.lastStreakDate = lastStreakDate

    // If pomodoroStats is provided as a single object for "today", merge or append
    if (pomodoroStats !== undefined) {
      if (Array.isArray(pomodoroStats)) {
        user.pomodoroStats = pomodoroStats
      } else if (pomodoroStats.date) {
        // Single day update
        const existingIdx = user.pomodoroStats.findIndex(p => p.date === pomodoroStats.date)
        if (existingIdx !== -1) {
          user.pomodoroStats[existingIdx].completedSessions = pomodoroStats.completedSessions
          user.pomodoroStats[existingIdx].totalFocusSeconds = pomodoroStats.totalFocusSeconds
        } else {
          user.pomodoroStats.push(pomodoroStats)
        }
      }
    }

    await user.save()

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        streak: user.streak,
        longestStreak: user.longestStreak,
        focusGoal: user.focusGoal,
        tasks: user.tasks || [],
        pomodoroStats: user.pomodoroStats || [],
        journalEntries: user.journalEntries || [],
        challenges: user.challenges || [],
        roadmap: user.roadmap || [],
        favoriteQuotes: user.favoriteQuotes || []
      }
    })
  } catch (error) {
    console.error('Sync API Error:', error)
    return NextResponse.json({ error: 'Server error during synchronization' }, { status: 500 })
  }
}
