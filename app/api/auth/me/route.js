import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ user: null, isAuthenticated: false }, { status: 200 })
    }

    // Return user details securely (omit password)
    return NextResponse.json({
      isAuthenticated: true,
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
    console.error('Auth Me API Error:', error)
    return NextResponse.json({ error: 'Server error fetching user profile' }, { status: 500 })
  }
}
