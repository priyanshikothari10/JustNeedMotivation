import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function getLast7Days() {
  const days = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString(undefined, { weekday: 'short' })
    days.push({ key, label })
  }
  return days
}

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const days = getLast7Days()
    const labels = days.map(d => d.label)
    const tasksPerDay = new Array(days.length).fill(0)
    const focusMinutesPerDay = new Array(days.length).fill(0)

    // Compute stats for each day
    days.forEach((day, index) => {
      // 1. Pomodoro minutes for this day
      const stat = user.pomodoroStats?.find(p => p.date === day.key)
      if (stat) {
        focusMinutesPerDay[index] = Math.round((stat.totalFocusSeconds || 0) / 60)
      }

      // 2. Count completed tasks for this day
      const completedTasksCount = user.tasks?.filter(task => {
        const isCompleted = task.completed || task.status === 'completed'
        if (!isCompleted) return false
        
        // Fallback to task.createdAt if completedAt is missing
        const dateToCheck = task.completedAt || task.createdAt || new Date()
        const taskDate = new Date(dateToCheck).toISOString().slice(0, 10)
        return taskDate === day.key
      }).length || 0

      tasksPerDay[index] = completedTasksCount
    })

    return NextResponse.json({
      success: true,
      labels,
      tasksPerDay,
      focusMinutesPerDay
    })
  } catch (error) {
    console.error('Analytics API Error:', error)
    return NextResponse.json({ error: 'Server error fetching analytics' }, { status: 500 })
  }
}
