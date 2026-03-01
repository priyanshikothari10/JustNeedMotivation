"use client"

import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
)

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

export default function WeeklyAnalytics() {
  const [labels, setLabels] = useState([])
  const [tasksPerDay, setTasksPerDay] = useState([])
  const [focusMinutesPerDay, setFocusMinutesPerDay] = useState([])

  useEffect(() => {
    try {
      const days = getLast7Days()
      const taskCounts = new Array(days.length).fill(0)
      const focusMinutes = new Array(days.length).fill(0)

      // Tasks: we only know current list, assume they belong to "today"
      const tasksRaw = typeof window !== 'undefined' ? localStorage.getItem('jnm:tasks') : null
      if (tasksRaw) {
        const tasks = JSON.parse(tasksRaw)
        const completedCount = tasks.filter((t) => t.completed).length
        const todayKey = days[days.length - 1].key
        const todayIndex = days.findIndex((d) => d.key === todayKey)
        if (todayIndex !== -1) {
          taskCounts[todayIndex] = completedCount
        }
      }

      // Focus time: read from pomodoro stats (today only)
      const statsRaw =
        typeof window !== 'undefined' ? localStorage.getItem('jnm:pomodoro:stats') : null
      if (statsRaw) {
        const stats = JSON.parse(statsRaw)
        const idx = days.findIndex((d) => d.key === stats.date)
        if (idx !== -1) {
          const minutes = Math.round((stats.totalFocusSeconds ?? 0) / 60)
          focusMinutes[idx] = minutes
        }
      }

      setLabels(days.map((d) => d.label))
      setTasksPerDay(taskCounts)
      setFocusMinutesPerDay(focusMinutes)
    } catch {
      // ignore parse errors
    }
  }, [])

  const barData = {
    labels,
    datasets: [
      {
        label: 'Tasks completed',
        data: tasksPerDay,
        backgroundColor: 'rgba(57,255,20,0.35)',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(57,255,20,0.8)'
      }
    ]
  }

  const lineData = {
    labels,
    datasets: [
      {
        label: 'Focus minutes',
        data: focusMinutesPerDay,
        borderColor: 'rgba(0,212,255,0.9)',
        backgroundColor: 'rgba(0,212,255,0.18)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: 'rgba(0,212,255,1)'
      }
    ]
  }

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#9CA3AF',
          font: { size: 11 }
        }
      },
      tooltip: {
        backgroundColor: '#020617',
        borderColor: 'rgba(148,163,184,0.4)',
        borderWidth: 1,
        titleColor: '#E5E7EB',
        bodyColor: '#E5E7EB'
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(148,163,184,0.12)' },
        ticks: { color: '#9CA3AF', font: { size: 10 } }
      },
      y: {
        grid: { color: 'rgba(148,163,184,0.12)' },
        ticks: { color: '#6B7280', font: { size: 10 }, precision: 0 }
      }
    }
  }

  return (
    <div className="card space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
            Weekly Productivity
          </p>
          <h2 className="text-lg font-semibold text-white">Analytics (7 days)</h2>
        </div>
      </header>

      <div className="space-y-3">
        <div className="h-40">
          <Bar data={barData} options={{ ...commonOptions, plugins: { ...commonOptions.plugins } }} />
        </div>

        <div className="h-40">
          <Line
            data={lineData}
            options={{ ...commonOptions, plugins: { ...commonOptions.plugins } }}
          />
        </div>
      </div>

      <p className="text-[11px] text-gray-500">
        Charts are based on tasks you tick off and focus time tracked by the Pomodoro timer.
      </p>
    </div>
  )
}

