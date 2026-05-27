import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' })

    // Expire/Clear token cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Immediately expire
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Logout API Error:', error)
    return NextResponse.json({ error: 'Server error during sign out' }, { status: 500 })
  }
}
