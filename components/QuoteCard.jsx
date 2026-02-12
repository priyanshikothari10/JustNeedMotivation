"use client"

import { useEffect, useState } from 'react'

const QUOTES = [
  'Slow progress is still progress.',
  'You don’t need to do everything today.',
  'Consistency builds momentum.',
  'Small steps lead to big changes.',
  'Focus on the next step, not the entire staircase.'
]

export default function QuoteCard() {
  const [quote, setQuote] = useState(QUOTES[0])

  useEffect(() => {
    const pick = QUOTES[Math.floor(Math.random() * QUOTES.length)]
    setQuote(pick)
  }, [])

  return (
    <div className="card neon-border glow-neon-green">
      <div className="text-sm text-gray-300">Today’s Motivation</div>
      <div className="mt-3 text-lg font-medium">“{quote}”</div>
    </div>
  )
}
