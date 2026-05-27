"use client"

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/lib/AuthContext'

const FOCUS_MINUTES = 25
const BREAK_MINUTES = 5

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function getTodayKey() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

export default function PomodoroTimer() {
  const { isAuthenticated, user, syncData, loading } = useAuth()
  
  const [mode, setMode] = useState('focus') // 'focus' | 'break'
  const [isRunning, setIsRunning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MINUTES * 60)

  const [completedSessions, setCompletedSessions] = useState(0)
  const [totalFocusSecondsToday, setTotalFocusSecondsToday] = useState(0)
  const isInitialLoad = useRef(true)

  // 1. Initial State Loading
  useEffect(() => {
    if (loading) return

    if (isAuthenticated && user) {
      const todayKey = getTodayKey()
      const todayStat = user.pomodoroStats?.find(p => p.date === todayKey)
      if (todayStat) {
        setCompletedSessions(todayStat.completedSessions ?? 0)
        setTotalFocusSecondsToday(todayStat.totalFocusSeconds ?? 0)
      } else {
        setCompletedSessions(0)
        setTotalFocusSecondsToday(0)
      }
    } else {
      try {
        const raw = localStorage.getItem('jnm:pomodoro:stats')
        if (raw) {
          const parsed = JSON.parse(raw)
          const todayKey = getTodayKey()
          if (parsed.date === todayKey) {
            setCompletedSessions(parsed.completedSessions ?? 0)
            setTotalFocusSecondsToday(parsed.totalFocusSeconds ?? 0)
          }
        }
      } catch {
        // ignore
      }
    }
    isInitialLoad.current = false
  }, [isAuthenticated, user, loading])

  // 2. Local Storage Sync (Unauthenticated only)
  useEffect(() => {
    if (isAuthenticated || loading || isInitialLoad.current) return

    const todayKey = getTodayKey()
    const payload = {
      date: todayKey,
      completedSessions,
      totalFocusSeconds: totalFocusSecondsToday
    }
    try {
      localStorage.setItem('jnm:pomodoro:stats', JSON.stringify(payload))
    } catch {
      // ignore
    }
  }, [completedSessions, totalFocusSecondsToday, isAuthenticated, loading])

  // 3. Timer interval effect
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) {
          return prev - 1
        }

        handlePhaseEnd()
        return 0
      })
    }, 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, mode, completedSessions, totalFocusSecondsToday])

  // 4. Client-side Streak updates + DB Sync
  function updateStreakAndSync(nextSessions, nextSeconds) {
    const today = getTodayKey()
    
    if (isAuthenticated && user) {
      let currentStreak = user.streak ?? 0
      let longestStreak = user.longestStreak ?? 0
      const lastDate = user.lastStreakDate ?? null

      if (lastDate !== today) {
        const todayDate = new Date(today)
        const last = lastDate ? new Date(lastDate) : null
        const oneDayMs = 24 * 60 * 60 * 1000
        let nextStreak

        if (last && Math.round((todayDate - last) / oneDayMs) === 1) {
          nextStreak = currentStreak + 1
        } else {
          nextStreak = 1
        }

        const nextLongest = Math.max(longestStreak, nextStreak)

        // Sync focus stats and streak to backend
        syncData({
          pomodoroStats: {
            date: today,
            completedSessions: nextSessions,
            totalFocusSeconds: nextSeconds
          },
          streak: nextStreak,
          longestStreak: nextLongest,
          lastStreakDate: today
        })
      } else {
        // Just sync focus stats, streak is already active today
        syncData({
          pomodoroStats: {
            date: today,
            completedSessions: nextSessions,
            totalFocusSeconds: nextSeconds
          }
        })
      }
    } else {
      // Local Storage Streak computation
      try {
        const streakRaw = localStorage.getItem('jnm:pomodoro:streak')
        let currentStreak = 0
        let longestStreak = 0
        let lastDate = null

        if (streakRaw) {
          const parsed = JSON.parse(streakRaw)
          currentStreak = parsed.streak ?? 0
          longestStreak = parsed.longestStreak ?? 0
          lastDate = parsed.lastDate ?? null
        }

        if (lastDate !== today) {
          const todayDate = new Date(today)
          const last = lastDate ? new Date(lastDate) : null
          const oneDayMs = 24 * 60 * 60 * 1000
          let nextStreak

          if (last && Math.round((todayDate - last) / oneDayMs) === 1) {
            nextStreak = currentStreak + 1
          } else {
            nextStreak = 1
          }

          const nextLongest = Math.max(longestStreak, nextStreak)

          const payload = {
            lastDate: today,
            streak: nextStreak,
            longestStreak: nextLongest
          }

          localStorage.setItem('jnm:pomodoro:streak', JSON.stringify(payload))

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('jnm:pomodoro:streak-updated'))
          }
        }
      } catch {
        // ignore
      }
    }
  }

  function handlePhaseEnd() {
    setIsRunning(false)

    if (mode === 'focus') {
      const nextSessions = completedSessions + 1
      const nextSeconds = totalFocusSecondsToday + FOCUS_MINUTES * 60
      
      setCompletedSessions(nextSessions)
      setTotalFocusSecondsToday(nextSeconds)
      
      updateStreakAndSync(nextSessions, nextSeconds)
      
      setMode('break')
      setSecondsLeft(BREAK_MINUTES * 60)
      setIsRunning(true)
    } else {
      setMode('focus')
      setSecondsLeft(FOCUS_MINUTES * 60)
      setIsRunning(true)
    }
  }

  function handleStart() {
    setIsRunning(true)
  }

  function handlePause() {
    setIsRunning(false)
  }

  function handleReset() {
    setIsRunning(false)
    const baseSeconds = mode === 'focus' ? FOCUS_MINUTES * 60 : BREAK_MINUTES * 60
    setSecondsLeft(baseSeconds)
  }

  const totalForPhase = mode === 'focus' ? FOCUS_MINUTES * 60 : BREAK_MINUTES * 60
  const progress = 1 - secondsLeft / totalForPhase
  const percent = Math.round(progress * 100)

  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - progress * circumference

  const totalFocusMinutesToday = Math.floor(totalFocusSecondsToday / 60)

  return (
    <div className="card glow-neon-green flex flex-col gap-4 bg-black/80">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Smart Focus Timer</p>
          <h2 className="text-lg font-semibold text-white">Pomodoro Mode</h2>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] border ${
            mode === 'focus'
              ? 'border-neon-green/60 text-neon-green/90'
              : 'border-sky-400/60 text-sky-300/90'
          }`}
        >
          {mode === 'focus' ? 'Focus' : 'Break'}
        </span>
      </header>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex items-center justify-center">
          <svg className="w-32 h-32" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r={radius}
              className="stroke-gray-800"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="70"
              cy="70"
              r={radius}
              className="stroke-neon-green"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs uppercase tracking-[0.16em] text-gray-500">
              {mode === 'focus' ? 'Focus' : 'Break'}
            </span>
            <span className="text-2xl font-mono font-semibold text-white">
              {formatTime(secondsLeft)}
            </span>
            <span className="text-[11px] text-gray-500">{percent}%</span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-3">
          <p className="text-xs text-gray-400">
            25 min focus + 5 min break. Sessions auto-switch between focus and break.
          </p>

          <div className="flex items-center gap-2">
            {isRunning ? (
              <button
                onClick={handlePause}
                className="px-3 py-1.5 rounded-md text-sm font-medium bg-white/10 hover:bg-white/15 text-white border border-white/10 transition"
              >
                Pause
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="px-3 py-1.5 rounded-md text-sm font-medium bg-neon-green text-black hover:bg-lime-300 transition"
              >
                Start
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 transition"
            >
              Reset
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-gray-300">
            <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500 mb-1">
                Focus sessions
              </p>
              <p className="text-lg font-semibold text-white">{completedSessions}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500 mb-1">
                Focus time today
              </p>
              <p className="text-lg font-semibold text-white">{totalFocusMinutesToday} min</p>
            </div>
          </div>

          <p className="text-[11px] text-gray-500">
            Tip: Treat each 25-minute block as <span className="text-neon-green">deep work</span>.
            Don&apos;t break the chain.
          </p>
        </div>
      </div>
    </div>
  )
}
