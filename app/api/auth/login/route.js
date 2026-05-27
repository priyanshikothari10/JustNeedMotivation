import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import { verifyPassword, createToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    await connectDB()

    const normalizedEmail = email.toLowerCase().trim()
    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const isMatch = verifyPassword(password, user.password)
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

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
    console.error('Login API Error:', error)

    const message = String(error?.message || '')
    if (message.includes('MongoDB connection string is not set')) {
      return NextResponse.json({ error: 'Server database is not configured yet. Please try again soon.' }, { status: 500 })
    }

    return NextResponse.json({ error: 'Server error during sign in' }, { status: 500 })
  }
}
