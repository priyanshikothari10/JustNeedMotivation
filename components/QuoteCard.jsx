"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'

export default function QuoteCard() {
  const [quote, setQuote] = useState({ text: 'Slow progress is still progress.', author: 'Anonymous' })
  const { isAuthenticated, user, syncData } = useAuth()

  useEffect(() => {
    async function fetchDailyQuote() {
      try {
        const res = await fetch('/api/quotes/daily')
        if (res.ok) {
          const data = await res.json()
          if (data.quote) {
            setQuote(data.quote)
          }
        }
      } catch (err) {
        console.error('Error fetching daily quote:', err)
      }
    }
    fetchDailyQuote()
  }, [])

  const fullQuoteString = `“${quote.text}” — ${quote.author}`
  const isFavorited = user?.favoriteQuotes?.includes(fullQuoteString) || false

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      alert('Please log in to save and bookmark your favorite quotes!')
      return
    }

    try {
      const nextFavorites = isFavorited
        ? (user.favoriteQuotes || []).filter(q => q !== fullQuoteString)
        : [...(user.favoriteQuotes || []), fullQuoteString]

      // Call favoriting API
      const method = isFavorited ? 'DELETE' : 'POST'
      const res = await fetch('/api/quotes/favorite', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote: fullQuoteString })
      })

      if (res.ok) {
        // Sync context state
        syncData({ favoriteQuotes: nextFavorites })
      }
    } catch (err) {
      console.error('Error toggling quote bookmark:', err)
    }
  }

  return (
    <div className="card neon-border glow-neon-green flex flex-col justify-between gap-4 relative overflow-hidden">
      <div>
        <div className="flex items-center justify-between text-sm text-gray-300">
          <span>Today’s Motivation</span>
          
          <button
            onClick={toggleFavorite}
            aria-label="Bookmark quote"
            className="text-gray-400 hover:text-red-500 transition-colors p-1 -mr-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={isFavorited ? '#ef4444' : 'none'}
              stroke={isFavorited ? '#ef4444' : 'currentColor'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 transition-transform duration-250 active:scale-75 cursor-pointer"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </button>
        </div>
        <div className="mt-3 text-lg font-medium leading-relaxed">“{quote.text}”</div>
      </div>
      <div className="text-right text-xs text-gray-500 italic">— {quote.author}</div>
    </div>
  )
}
