"use client"

import { useEffect, useState } from 'react'
import DailyFocusCard from '../components/DailyFocusCard'
import TasksSection from '../components/TasksSection'
import ProgressTracker from '../components/ProgressTracker'
import QuoteCard from '../components/QuoteCard'
import PomodoroTimer from '../components/PomodoroTimer'
import DeepWorkStreak from '../components/DeepWorkStreak'

export default function DashboardPage() {
  const [tasks, setTasks] = useState([])
  const [showTimer, setShowTimer] = useState(false)

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

        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => setShowTimer((prev) => !prev)}
            className="px-4 py-2 rounded-md text-sm font-medium bg-neon-green text-black hover:bg-lime-300 transition shadow-sm"
          >
            {showTimer ? 'Hide Focus Timer' : 'Start Focus Timer'}
          </button>
        </div>

        {showTimer && (
          <div className="space-y-2">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowTimer(false)}
                className="px-2 py-1 rounded-md text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 transition"
              >
                Close
              </button>
            </div>
            <PomodoroTimer />
          </div>
        )}

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium text-white">Today’s Tasks</h2>
            <span className="text-sm text-gray-400">{completed}/{tasks.length}</span>
          </div>

          <TasksSection tasks={tasks} setTasks={setTasks} />
        </div>
      </div>

      <aside className="space-y-6">
        <div className="card flex items-center justify-center">
          <ProgressTracker percent={percent} />
        </div>

        <DeepWorkStreak />

        <QuoteCard />
      </aside>
    </div>
  )
}
