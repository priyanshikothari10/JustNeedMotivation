"use client"

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'jnm:theme'

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const stored = window.localStorage.getItem(STORAGE_KEY)
    let initial = stored

    if (!initial) {
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
      initial = prefersDark ? 'dark' : 'light'
    }

    setTheme(initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggle = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gray-200 hover:bg-white/10 dark:bg-black/20 dark:hover:bg-black/40 transition-colors"
      aria-label="Toggle dark mode"
    >
      <span className="relative inline-flex h-4 w-7 items-center rounded-full bg-gray-700 dark:bg-gray-300 transition-colors">
        <span
          className={`h-3 w-3 rounded-full bg-white shadow transform transition-transform ${
            isDark ? 'translate-x-3.5' : 'translate-x-0.5'
          }`}
        />
      </span>
      <span className="hidden sm:inline text-[11px] uppercase tracking-[0.16em] text-gray-300 dark:text-gray-200">
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  )
}

