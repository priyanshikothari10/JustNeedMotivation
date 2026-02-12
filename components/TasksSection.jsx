"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function TasksSection({ tasks = [], setTasks }) {
  const [text, setText] = useState('')

  function addTask() {
    if (!text.trim()) return
    const newTask = { id: Date.now(), title: text.trim(), completed: false }
    setTasks([...tasks, newTask])
    setText('')
  }

  function toggle(id) {
    setTasks(tasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  function remove(id) {
    setTasks(tasks.filter(t => t.id !== id))
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add task..."
          className="flex-1 bg-transparent border border-white/6 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neon-green"
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
        />
        <button onClick={addTask} className="px-3 py-2 rounded-md bg-neon-green text-black font-semibold hover:brightness-95 transition">Add</button>
      </div>

      <ul className="mt-4 space-y-2">
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.li
              key={task.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className={`flex items-center justify-between p-3 rounded-md ${task.completed ? 'bg-white/4 ring-2 ring-neon-green' : 'bg-white/5'}`}
            >
              <div className="flex items-center gap-3">
                <motion.input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggle(task.id)}
                  whileTap={{ scale: 0.95 }}
                  className="w-5 h-5 rounded-sm accent-[var(--neon-green)]"
                />
                <span className={`select-none ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => remove(task.id)} className="text-sm text-gray-400 hover:text-white">Delete</button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}
