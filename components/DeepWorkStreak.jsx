"use client"

import { useEffect, useState } from 'react'

function getTodayKey() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

function isYesterday(dateStr) {
  if (!dateStr) return false
  const today = new Date(getTodayKey())
  const prev = new Date(dateStr)
  const diffMs = today.getTime() - prev.getTime()
  const oneDayMs = 24 * 60 * 60 * 1000
  return Math.round(diffMs / oneDayMs) === 1
}

export default function DeepWorkStreak() {
  const [streak, setStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)

  function readAndComputeStreak() {
    try {
      const today = getTodayKey()
      const statsRaw = localStorage.getItem('jnm:pomodoro:stats')
      const streakRaw = localStorage.getItem('jnm:pomodoro:streak')

      const stats = statsRaw ? JSON.parse(statsRaw) : null
      const prev = streakRaw ? JSON.parse(streakRaw) : null

      const sessionsToday =
        stats && stats.date === today && typeof stats.completedSessions === 'number'
          ? stats.completedSessions
          : 0

      let currentStreak = prev?.streak ?? 0
      let maxStreak = prev?.longestStreak ?? 0
      const lastDate = prev?.lastDate ?? null

      // If there is at least one session today and we haven't already counted today
      if (sessionsToday > 0 && lastDate !== today) {
        if (isYesterday(lastDate)) {
          currentStreak = currentStreak + 1
        } else {
          currentStreak = 1
        }
        if (currentStreak > maxStreak) maxStreak = currentStreak
      }

      // If today has no sessions and we moved past the last active day, streak resets
      if (sessionsToday === 0 && lastDate && lastDate !== today) {
        const lastIsYesterday = isYesterday(lastDate)
        const todayIsAfterLast = !lastIsYesterday && lastDate !== today
        if (todayIsAfterLast) {
          currentStreak = 0
        }
      }

      const payload = {
        lastDate: sessionsToday > 0 ? today : lastDate,
        streak: currentStreak,
        longestStreak: maxStreak
      }

      localStorage.setItem('jnm:pomodoro:streak', JSON.stringify(payload))

      setStreak(currentStreak)
      setLongestStreak(maxStreak)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    readAndComputeStreak()

    function handleCustomUpdate() {
      readAndComputeStreak()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('jnm:pomodoro:streak-updated', handleCustomUpdate)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('jnm:pomodoro:streak-updated', handleCustomUpdate)
      }
    }
  }, [])

  return (
    <div className="card space-y-3">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Deep Work</p>
          <h2 className="text-lg font-semibold text-white">Streak</h2>
        </div>
      </header>

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-gray-400 mb-1">Current streak</p>
          <p className="text-3xl font-semibold text-neon-green">{streak} days</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500 mb-1">
            Longest
          </p>
          <p className="text-lg font-semibold text-white">{longestStreak} days</p>
        </div>
      </div>

      <p className="text-[11px] text-gray-500">
        Complete at least one Pomodoro session per day to keep your deep work streak alive.
      </p>
    </div>
  )
}

