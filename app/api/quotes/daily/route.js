import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Quote from '@/models/Quote'

export const dynamic = 'force-dynamic'

const PREMIUM_QUOTES = [
  { text: "Slow progress is still progress.", author: "Anonymous" },
  { text: "Consistency builds momentum.", author: "Productivity Guide" },
  { text: "Small steps lead to big changes.", author: "Daily Wisdom" },
  { text: "Focus on the next step, not the entire staircase.", author: "Martin Luther King Jr." },
  { text: "You don't need to do everything today.", author: "Gentle Reminder" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "Great things are done by a series of small things brought together.", author: "Vincent Van Gogh" },
  { text: "Energy and persistence conquer all things.", author: "Benjamin Franklin" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Your focus determines your reality.", author: "Qui-Gon Jinn" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "If you get tired, learn to rest, not to quit.", author: "Banksy" }
]

export async function GET() {
  try {
    await connectDB()

    // Seed DB once (keeps your existing quote set and makes it database-backed).
    const existingCount = await Quote.countDocuments()
    if (existingCount === 0) {
      await Quote.insertMany(PREMIUM_QUOTES.map(q => ({ ...q, source: 'seed' })), { ordered: false })
    }

    // Generate an index based on the day of the year
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 0)
    const diff = now - start
    const oneDay = 1000 * 60 * 60 * 24
    const dayOfYear = Math.floor(diff / oneDay)

    const total = await Quote.countDocuments()
    const quoteIndex = total ? dayOfYear % total : dayOfYear % PREMIUM_QUOTES.length

    // Deterministically pick the Nth quote (stable across requests that day).
    const dailyQuoteDoc = await Quote.findOne({})
      .sort({ _id: 1 })
      .skip(quoteIndex)
      .lean()

    const dailyQuote = dailyQuoteDoc
      ? { text: dailyQuoteDoc.text, author: dailyQuoteDoc.author || 'Anonymous' }
      : PREMIUM_QUOTES[dayOfYear % PREMIUM_QUOTES.length]
    
    return NextResponse.json({
      success: true,
      quote: dailyQuote
    })
  } catch (error) {
    console.error('Daily Quote API Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
