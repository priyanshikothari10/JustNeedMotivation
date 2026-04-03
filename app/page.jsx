"use client"

import { useEffect, useState } from 'react'
import DailyFocusCard from '../components/DailyFocusCard'
import TasksSection from '../components/TasksSection'
import ProgressTracker from '../components/ProgressTracker'
import QuoteCard from '../components/QuoteCard'
import DeepWorkStreak from '../components/DeepWorkStreak'
import WeeklyAnalytics from '../components/WeeklyAnalytics'
import StudentDashboard from '../components/StudentDashboard'

export default function DashboardPage() {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('jnm:tasks')
      if (raw) setTasks(JSON.parse(raw))
    } catch (e) {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('jnm:tasks', JSON.stringify(tasks))
    } catch (e) {}
  }, [tasks])

  const completed = tasks.filter((t) => t.completed).length
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0

  return (
    <div className="py-6 grid gap-6 grid-cols-1 md:grid-cols-3">
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
  )
}
