"use client"

import { useEffect, useState } from 'react'

export default function DailyFocusCard() {
  const [focus, setFocus] = useState('')
  useEffect(() => {
    try {
      const stored = localStorage.getItem('jnm:focus')
      if (stored) setFocus(stored)
    } catch (e) {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('jnm:focus', focus)
    } catch (e) {}
  }, [focus])

  return (
    <div className="card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex-1">
        <div className="text-sm text-gray-400">Today’s Focus</div>
        <input
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          placeholder="What is your main goal today? (DSA / AWS / College / Python)"
          className="mt-2 w-full bg-transparent border border-white/6 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neon-green"
        />
        <div className="mt-2 text-xs text-gray-400">Tip: keep it simple and focused — one main goal works best.</div>
      </div>
      <div className="hidden md:block">
        <button className="px-4 py-2 rounded-md bg-neon-green text-black font-semibold glow-neon-green">Set</button>
      </div>
    </div>
  )
}
