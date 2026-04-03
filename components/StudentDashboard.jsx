"use client"

import { useEffect, useState } from 'react'

const DEFAULT_NAME_KEY = 'jnm:student:name'

async function fetchJSON(url, options) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options && options.headers)
    }
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Request failed')
  }
  return res.json()
}

export default function StudentDashboard() {
  const [name, setName] = useState('')
  const [roadmapInput, setRoadmapInput] = useState('')
  const [tasks, setTasks] = useState([])
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const storedName = window.localStorage.getItem(DEFAULT_NAME_KEY) || ''
    if (storedName) {
      setName(storedName)
      loadStudent(storedName)
    }
  }, [])

  async function loadStudent(studentName) {
    if (!studentName) return
    setLoading(true)
    setError('')
    try {
      const data = await fetchJSON(`/api/student?name=${encodeURIComponent(studentName)}`)
      setTasks(data.tasks || [])
      setStreak(data.streak || 0)
      const roadmap = (data.roadmap || []).join(', ')
      setRoadmapInput(roadmap)
    } catch (e) {
      setError('Could not load student data')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveProfile() {
    if (!name.trim()) return
    setLoading(true)
    setError('')
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(DEFAULT_NAME_KEY, name.trim())
      }

      const roadmap = roadmapInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      const data = await fetchJSON('/api/student', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), roadmap })
      })

      setTasks(data.tasks || [])
      setStreak(data.streak || 0)
    } catch (e) {
      setError('Could not save profile')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddTask(title) {
    if (!name.trim() || !title.trim()) return
    setLoading(true)
    setError('')
    try {
      const data = await fetchJSON('/api/student/tasks', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), title: title.trim() })
      })
      setTasks(data.tasks || [])
      setStreak(data.streak || 0)
    } catch (e) {
      setError('Could not add task')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleTask(taskId, status) {
    if (!name.trim()) return
    setLoading(true)
    setError('')
    try {
      const nextStatus = status === 'completed' ? 'pending' : 'completed'
      const data = await fetchJSON('/api/student/tasks', {
        method: 'PATCH',
        body: JSON.stringify({ name: name.trim(), taskId, status: nextStatus })
      })
      setTasks(data.tasks || [])
      setStreak(data.streak || 0)
    } catch (e) {
      setError('Could not update task')
    } finally {
      setLoading(false)
    }
  }

  const completedCount = tasks.filter((t) => t.status === 'completed').length
  const pendingCount = tasks.length - completedCount

  const [newTaskTitle, setNewTaskTitle] = useState('')

  return (
    <div className="card space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Student</p>
          <h2 className="text-lg font-semibold text-white">Productivity Dashboard</h2>
        </div>
        {loading && (
          <span className="text-[11px] text-gray-400 animate-pulse">Syncing...</span>
        )}
      </header>

      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Student name"
            className="flex-1 bg-transparent border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neon-green"
          />
          <button
            type="button"
            onClick={handleSaveProfile}
            className="px-3 py-2 rounded-md text-sm font-medium bg-neon-green text-black hover:bg-lime-300 transition"
          >
            Save
          </button>
        </div>

        <textarea
          value={roadmapInput}
          onChange={(e) => setRoadmapInput(e.target.value)}
          placeholder="Roadmap goals (comma separated: Web Dev, DSA, Projects...)"
          rows={2}
          className="w-full bg-transparent border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neon-green"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">Daily tasks</p>
          <p className="text-xs text-gray-400">
            <span className="text-neon-green">{completedCount}</span> done ·{' '}
            <span className="text-gray-300">{pendingCount}</span> left
          </p>
        </div>

        <div className="flex gap-2">
          <input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add task linked to your roadmap..."
            className="flex-1 bg-transparent border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neon-green"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddTask(newTaskTitle)
                setNewTaskTitle('')
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              handleAddTask(newTaskTitle)
              setNewTaskTitle('')
            }}
            className="px-3 py-2 rounded-md text-sm font-medium bg-white/10 hover:bg-white/15 text-white border border-white/10 transition"
          >
            Add
          </button>
        </div>

        <ul className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {tasks.map((task) => (
            <li
              key={task._id}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer ${
                task.status === 'completed'
                  ? 'bg-white/5 border border-neon-green/50'
                  : 'bg-white/5 border border-white/5'
              }`}
              onClick={() => handleToggleTask(task._id, task.status)}
            >
              <span
                className={
                  task.status === 'completed'
                    ? 'line-through text-gray-400'
                    : 'text-gray-100'
                }
              >
                {task.title}
              </span>
              <span className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
                {task.status === 'completed' ? 'Done' : 'Pending'}
              </span>
            </li>
          ))}
          {tasks.length === 0 && (
            <li className="text-[12px] text-gray-500">
              No tasks yet. Add one that matches your current roadmap focus.
            </li>
          )}
        </ul>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          Streak:{' '}
          <span className="font-semibold text-neon-green">
            {streak} day{streak === 1 ? '' : 's'}
          </span>
        </span>
        {error && <span className="text-red-400">{error}</span>}
      </div>
    </div>
  )
}

