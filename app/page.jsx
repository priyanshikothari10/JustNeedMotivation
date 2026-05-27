"use client"

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import DailyFocusCard from '../components/DailyFocusCard'
import TasksSection from '../components/TasksSection'
import ProgressTracker from '../components/ProgressTracker'
import QuoteCard from '../components/QuoteCard'
import DeepWorkStreak from '../components/DeepWorkStreak'
import WeeklyAnalytics from '../components/WeeklyAnalytics'
import StudentDashboard from '../components/StudentDashboard'
import { useAuth } from '@/lib/AuthContext'

export default function DashboardPage() {
  const { isAuthenticated, user, syncData, loading } = useAuth()
  const [tasks, setTasks] = useState([])
  const isInitialLoad = useRef(true)

  // Load tasks
  useEffect(() => {
    if (loading) return

    if (isAuthenticated && user) {
      // Map user tasks to local state
      // Ensure we preserve both `completed` and `status` fields
      const mappedTasks = (user.tasks || []).map(t => ({
        id: t.id || t._id,
        title: t.title,
        completed: t.completed || t.status === 'completed',
        status: t.status || (t.completed ? 'completed' : 'pending')
      }))
      setTasks(mappedTasks)
    } else {
      try {
        const raw = localStorage.getItem('jnm:tasks')
        if (raw) setTasks(JSON.parse(raw))
      } catch (e) {}
    }
    isInitialLoad.current = false
  }, [isAuthenticated, user, loading])

  // Sync tasks when they change
  useEffect(() => {
    if (loading || isInitialLoad.current) return

    if (isAuthenticated) {
      const dbTasks = tasks.map(t => ({
        id: typeof t.id === 'number' ? t.id : undefined,
        title: t.title,
        completed: t.completed,
        status: t.completed ? 'completed' : 'pending',
        completedAt: t.completed ? new Date() : null
      }))
      
      // Debounce or directly sync state
      const timer = setTimeout(() => {
        syncData({ tasks: dbTasks })
      }, 500)
      return () => clearTimeout(timer)
    } else {
      try {
        localStorage.setItem('jnm:tasks', JSON.stringify(tasks))
      } catch (e) {}
    }
  }, [tasks, isAuthenticated, loading, syncData])

  const completed = tasks.filter((t) => t.completed).length
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0

  return (
    <div className="py-6 space-y-6">
      {/* Dynamic Authentication Status Banner */}
      {!loading && !isAuthenticated && (
        <div className="p-4 rounded-xl border border-neon-blue/30 bg-neon-blue/5 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm shadow-[0_0_20px_rgba(0,212,255,0.05)]">
          <div>
            <h3 className="text-sm font-semibold text-white">Cloud Sync Offline</h3>
            <p className="text-xs text-gray-400 mt-1">
              You are running locally. Sign up or log in to sync your tasks, goals, streaks, and unlock personal journals & daily challenges!
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href="/login" className="px-3 py-1.5 rounded-md text-xs font-semibold bg-neon-blue text-black hover:brightness-110 transition shadow-[0_0_10px_rgba(0,212,255,0.2)]">
              Log In
            </Link>
            <Link href="/signup" className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-white transition">
              Sign Up
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <DailyFocusCard />
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium text-white">Today’s Tasks</h2>
              <span className="text-sm text-gray-400">
                {completed}/{tasks.length}
              </span>
            </div>

            <TasksSection tasks={tasks} setTasks={setTasks} />
          </div>

          <StudentDashboard />
        </div>

        <aside className="space-y-6">
          <div className="card flex items-center justify-center">
            <ProgressTracker percent={percent} />
          </div>

          <WeeklyAnalytics />

          <DeepWorkStreak />

          <QuoteCard />
        </aside>
      </div>
    </div>
  )
}
