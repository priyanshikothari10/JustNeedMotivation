import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/quotes/favorite - get user's bookmarks
export async function GET(request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: true, favorites: user.favoriteQuotes || [] })
  } catch (error) {
    console.error('Favorites GET Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/quotes/favorite - add user's bookmark
export async function POST(request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { quote } = await request.json()
    if (!quote) {
      return NextResponse.json({ error: 'Quote is required' }, { status: 400 })
    }

    if (!user.favoriteQuotes.includes(quote)) {
      user.favoriteQuotes.push(quote)
      await user.save()
    }

    return NextResponse.json({ success: true, favorites: user.favoriteQuotes })
  } catch (error) {
    console.error('Favorites POST Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE /api/quotes/favorite - remove user's bookmark
export async function DELETE(request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { quote } = await request.json()
    if (!quote) {
      return NextResponse.json({ error: 'Quote is required' }, { status: 400 })
    }

    user.favoriteQuotes = user.favoriteQuotes.filter(q => q !== quote)
    await user.save()

    return NextResponse.json({ success: true, favorites: user.favoriteQuotes })
  } catch (error) {
    console.error('Favorites DELETE Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
