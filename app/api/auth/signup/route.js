import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import { hashPassword, createToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
    }

    await connectDB()

    const normalizedEmail = email.toLowerCase().trim()
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return NextResponse.json({ error: 'Email is already registered' }, { status: 400 })
    }

    const hashedPassword = hashPassword(password)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      streak: 0,
      longestStreak: 0,
      lastStreakDate: null,
      focusGoal: '',
      tasks: [],
      pomodoroStats: [],
      journalEntries: [],
      challenges: [],
      roadmap: [],
      favoriteQuotes: []
    })

    const token = createToken({ userId: user._id.toString(), email: user.email, name: user.name })

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        streak: user.streak,
        longestStreak: user.longestStreak,
        focusGoal: user.focusGoal,
        favoriteQuotes: user.favoriteQuotes
      }
    })

    // Set HttpOnly secure token cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Signup API Error:', error)

    // Duplicate email race-condition safety
    if (error?.code === 11000 && error?.keyPattern?.email) {
      return NextResponse.json({ error: 'Email is already registered' }, { status: 400 })
    }

    const message = String(error?.message || '')
    if (message.includes('MongoDB connection string is not set')) {
      return NextResponse.json({ error: 'Server database is not configured yet. Please try again soon.' }, { status: 500 })
    }

    return NextResponse.json({ error: 'Server error during registration' }, { status: 500 })
  }
}
