"use client"

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import NeonBackground from '@/components/NeonBackground'

function getTodayKey() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

const MOODS = [
  { name: 'Focused', color: 'border-neon-blue text-neon-blue shadow-[0_0_10px_rgba(0,212,255,0.15)] bg-neon-blue/5' },
  { name: 'Inspired', color: 'border-neon-purple text-neon-purple shadow-[0_0_10px_rgba(194,119,255,0.15)] bg-neon-purple/5' },
  { name: 'Calm', color: 'border-neon-green text-neon-green shadow-[0_0_10px_rgba(57,255,20,0.15)] bg-neon-green/5' },
  { name: 'Tired', color: 'border-gray-600 text-gray-400 bg-gray-900/40' }
]

export default function DailyLogPage() {
  const { isAuthenticated, user, syncData, loading } = useAuth()
  const [journalText, setJournalText] = useState('')
  const [selectedMood, setSelectedMood] = useState('Focused')
  const [activeTab, setActiveTab] = useState('journal') // 'journal' | 'challenges' | 'bookmarks'
  const [didInitChallenges, setDidInitChallenges] = useState(false)

  // Challenges evaluation
  const today = getTodayKey()
  const hasJournaledToday = user?.journalEntries?.some(j => j.date === today) || false
  
  const hasFocusSessionToday = user?.pomodoroStats?.some(p => {
    return p.date === today && p.completedSessions > 0
  }) || false

  const hasCompletedTaskToday = user?.tasks?.some(t => {
    const isDone = t.completed || t.status === 'completed'
    if (!isDone) return false
    const taskDate = new Date(t.completedAt || t.createdAt || new Date()).toISOString().slice(0, 10)
    return taskDate === today
  }) || false

  const challenges = useMemo(() => ([
    {
      id: 'task',
      title: 'Tackle a Task',
      desc: 'Check off at least one daily task from your todo list.',
      completed: hasCompletedTaskToday
    },
    {
      id: 'focus',
      title: 'Deep Work Session',
      desc: 'Complete at least one 25-minute focus Pomodoro session today.',
      completed: hasFocusSessionToday
    },
    {
      id: 'journal',
      title: 'Daily Reflection',
      desc: 'Write and log today’s personal journal entry.',
      completed: hasJournaledToday
    }
  ]), [hasCompletedTaskToday, hasFocusSessionToday, hasJournaledToday])

  // Persist today's challenge set (so challenges are truly "tracked", not just computed)
  useEffect(() => {
    if (loading || !isAuthenticated || !user || didInitChallenges) return

    const existing = Array.isArray(user.challenges) ? user.challenges : []
    const hasToday = existing.some(c => c.date === today)
    if (hasToday) {
      setDidInitChallenges(true)
      return
    }

    const next = [
      {
        date: today,
        challengeText: 'Tackle a Task • Deep Work Session • Daily Reflection',
        completed: challenges.every(c => c.completed),
        completedAt: challenges.every(c => c.completed) ? new Date() : null
      },
      ...existing
    ]

    syncData({ challenges: next })
    setDidInitChallenges(true)
  }, [loading, isAuthenticated, user, today, challenges, syncData, didInitChallenges])

  const handleAddJournal = async (e) => {
    e.preventDefault()
    if (!journalText.trim() || !isAuthenticated) return

    const newEntry = {
      id: 'j-' + Date.now(),
      date: today,
      content: journalText.trim(),
      mood: selectedMood,
      createdAt: new Date()
    }

    const currentEntries = user.journalEntries || []
    // Prevent double logging for same day (or just append)
    const nextEntries = [newEntry, ...currentEntries]

    await syncData({ journalEntries: nextEntries })
    setJournalText('')
    
    // Check if streak needs updating
    // If they did their first action of today, increment streak
    if (user.lastStreakDate !== today) {
      let currentStreak = user.streak ?? 0
      let longestStreak = user.longestStreak ?? 0
      const lastDate = user.lastStreakDate ?? null
      let nextStreak = 1

      if (lastDate) {
        const todayDate = new Date(today)
        const last = new Date(lastDate)
        const oneDayMs = 24 * 60 * 60 * 1000
        if (Math.round((todayDate - last) / oneDayMs) === 1) {
          nextStreak = currentStreak + 1
        }
      }

      const nextLongest = Math.max(longestStreak, nextStreak)
      syncData({
        streak: nextStreak,
        longestStreak: nextLongest,
        lastStreakDate: today
      })
    }
  }

  const handleRemoveBookmark = async (fullQuote) => {
    if (!isAuthenticated) return
    try {
      const nextFavorites = (user.favoriteQuotes || []).filter(q => q !== fullQuote)
      
      const res = await fetch('/api/quotes/favorite', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote: fullQuote })
      })

      if (res.ok) {
        syncData({ favoriteQuotes: nextFavorites })
      }
    } catch (err) {
      console.error('Error removing bookmark:', err)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen text-white flex items-center justify-center bg-black">
        <div className="text-sm text-gray-400 animate-pulse">Synchronizing journal database...</div>
      </main>
    )
  }

  // 1. Unauthenticated landing page
  if (!isAuthenticated) {
    return (
      <main className="min-h-[80vh] text-white p-4 md:p-8 relative z-10 max-w-4xl mx-auto flex flex-col items-center justify-center">
        <NeonBackground />
        <div className="text-center space-y-6 max-w-lg p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_30px_rgba(0,212,255,0.05)]">
          <h1 className="text-3xl font-bold text-neon-blue tracking-wide">Daily Log Offline</h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            The Personal Journal, bookmarked Quotes, and daily Challenges tracking require cloud synchronization to save your momentum safely.
          </p>
          <div className="pt-4">
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-blue to-blue-500 text-black font-bold tracking-wide shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:brightness-110 transition-all inline-block"
            >
              Access Daily Log
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen text-white p-4 md:p-8 relative z-10 max-w-4xl mx-auto space-y-8">
      <NeonBackground />

      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-neon-green tracking-tight">Daily Log</h1>
          <p className="text-gray-400 text-sm mt-1">Reflect, track challenges, and review bookmarked inspiration.</p>
        </div>
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('journal')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'journal' ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Reflection
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'challenges' ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Challenges ({challenges.filter(c => c.completed).length}/{challenges.length})
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'bookmarks' ? 'bg-white/10 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Bookmarks ({user.favoriteQuotes?.length || 0})
          </button>
        </div>
      </header>

      {/* TAB 1: JOURNAL REFLECTION */}
      {activeTab === 'journal' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Journal Input */}
            <form onSubmit={handleAddJournal} className="card space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">How are you feeling today?</label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => setSelectedMood(m.name)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-wide transition-all ${
                        selectedMood === m.name
                          ? m.color
                          : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white bg-transparent'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider" htmlFor="reflection">Today’s Journal Reflection</label>
                <textarea
                  id="reflection"
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  placeholder="What is on your mind? Capture your goals, thoughts, wins, and obstacles..."
                  rows={5}
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green text-sm leading-relaxed"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-neon-green text-black font-bold px-4 py-2 rounded-md hover:bg-lime-300 transition shadow-[0_0_15px_rgba(57,255,20,0.15)] text-sm"
              >
                Log Reflection
              </button>
            </form>

            {/* Timeline of past reflections */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Momentum History</h2>
              
              <div className="space-y-4 relative pl-4 border-l border-white/10">
                {(user.journalEntries || []).length === 0 ? (
                  <p className="text-xs text-gray-500 italic pl-2">No logged entries yet. Write your first reflection above!</p>
                ) : (
                  user.journalEntries.map((entry) => (
                    <div key={entry.id} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-neon-green border-2 border-black group-hover:scale-125 transition-transform" />
                      
                      <div className="card space-y-2 group-hover:border-white/20 transition-all bg-black/40">
                        <header className="flex items-center justify-between text-xs">
                          <span className="font-mono text-gray-400">{entry.date}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${
                            entry.mood === 'Focused' ? 'border-neon-blue/40 text-neon-blue/90' :
                            entry.mood === 'Inspired' ? 'border-neon-purple/40 text-neon-purple/90' :
                            entry.mood === 'Calm' ? 'border-neon-green/40 text-neon-green/90' : 'border-gray-600 text-gray-400'
                          }`}>
                            {entry.mood}
                          </span>
                        </header>
                        <p className="text-sm text-gray-300 leading-relaxed white-space-pre-wrap">{entry.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Challenges Sidebar */}
          <div className="space-y-6">
            <div className="card bg-black/80">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Daily Challenges</h2>
              <ul className="space-y-3">
                {challenges.map((c) => (
                  <li key={c.id} className="flex items-start gap-3">
                    <span className={`flex items-center justify-center w-5 h-5 rounded-full border text-xs shrink-0 mt-0.5 ${
                      c.completed ? 'border-neon-green text-neon-green bg-neon-green/10 shadow-[0_0_8px_rgba(57,255,20,0.2)]' : 'border-white/10 text-gray-500'
                    }`}>
                      {c.completed ? '✓' : ''}
                    </span>
                    <div>
                      <h4 className={`text-xs font-bold ${c.completed ? 'text-neon-green line-through' : 'text-gray-200'}`}>
                        {c.title}
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">{c.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DAILY CHALLENGES EXPANDED */}
      {activeTab === 'challenges' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {challenges.map((c) => (
              <div
                key={c.id}
                className={`card flex flex-col justify-between p-6 gap-4 bg-black/50 border transition-all ${
                  c.completed ? 'border-neon-green/40 shadow-[0_0_20px_rgba(57,255,20,0.05)]' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="space-y-2">
                  <header className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-gray-500">Auto-evaluating</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
                      c.completed ? 'bg-neon-green/10 text-neon-green border border-neon-green/20' : 'bg-white/5 text-gray-400 border border-white/5'
                    }`}>
                      {c.completed ? 'Completed' : 'Active'}
                    </span>
                  </header>
                  <h3 className={`text-lg font-bold ${c.completed ? 'text-neon-green line-through' : 'text-white'}`}>{c.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{c.desc}</p>
                </div>

                <div className="text-[10px] text-gray-500 pt-2 border-t border-white/5 flex items-center justify-between">
                  <span>Requirement: database status check</span>
                  {c.completed ? (
                    <span className="text-neon-green font-bold">100% Complete</span>
                  ) : (
                    <span className="text-gray-400">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BOOKMARKED FAVORITE QUOTES */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Saved Inspiration</h2>
          {(user.favoriteQuotes || []).length === 0 ? (
            <p className="text-xs text-gray-500 italic card p-8 text-center border-dashed">
              No bookmarked quotes yet. Browse the dashboard and click the heart icon on today&apos;s quote!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.favoriteQuotes.map((quoteStr, idx) => (
                <div key={idx} className="card glow-neon-green neon-border flex flex-col justify-between p-5 gap-3 bg-black/60 relative group">
                  <p className="text-sm text-gray-200 leading-relaxed italic">{quoteStr.split(' — ')[0]}</p>
                  
                  <footer className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[10px] text-gray-500">
                      {quoteStr.split(' — ')[1] || 'Anonymous'}
                    </span>
                    <button
                      onClick={() => handleRemoveBookmark(quoteStr)}
                      className="text-xs text-red-500 hover:text-red-400 transition-colors font-medium cursor-pointer"
                    >
                      Remove
                    </button>
                  </footer>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  )
}
