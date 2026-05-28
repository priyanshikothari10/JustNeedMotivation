import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { callGemini } from '@/lib/gemini'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const history = user.learningHistory || []
    
    // Get activities in the last 7 days
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const weeklyActivities = history.filter(act => new Date(act.timestamp) >= sevenDaysAgo)

    if (weeklyActivities.length === 0) {
      return NextResponse.json({
        success: true,
        summary: "No learning activities recorded in the last 7 days. Start logging completed lessons, watched videos, notes, or quiz attempts to get an AI-compiled weekly study summary!"
      })
    }

    // Format list of activities
    const activitiesList = weeklyActivities.map(act => {
      const dateStr = new Date(act.timestamp).toLocaleDateString()
      let detailsStr = act.details ? ` (${act.details})` : ''
      if (act.type === 'quiz' && act.score !== undefined) {
        detailsStr = ` - Score: ${act.score}/${act.totalQuestions || 5} (${act.score >= 75 ? 'Passed' : 'Needs revision'})`
      }
      return `- [${act.type.toUpperCase()}] "${act.title}" on ${dateStr}${detailsStr}`
    }).join('\n')

    const prompt = `Here are my completed study activities from this week:\n\n${activitiesList}\n\nPlease generate a supportive and comprehensive weekly learning recap and summary. Highlight achievements, point out topics that may need revision based on low quiz scores, and recommend 2-3 logical next steps for my learning path.`

    const systemPrompt = `You are a supportive, high-energy personal study mentor. Your tone is inspiring, encouraging, and clear. Generate a beautiful, professionally structured markdown summary of the user's weekly learning achievements. Use emojis, brief sections, and a positive motivational tone. Make sure to identify weak concepts if there are quizzes with scores under 75% and suggest logical revision plans.`

    // Allow user to supply custom API key in headers if server env key is missing
    const customApiKey = request.headers.get('x-gemini-key') || undefined

    const summaryText = await callGemini({
      prompt,
      systemPrompt,
      customApiKey
    })

    return NextResponse.json({
      success: true,
      summary: summaryText
    })
  } catch (error) {
    console.error('Learning Summary Route Error:', error)
    return NextResponse.json({ error: error.message || 'Server error compiling summary' }, { status: 500 })
  }
}
