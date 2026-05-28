import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { callGemini } from '@/lib/gemini'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messageText, conversationId } = body || {}

    if (!messageText) {
      return NextResponse.json({ error: 'Missing messageText' }, { status: 400 })
    }

    // 1. Resolve or create active conversation
    let activeConvId = conversationId || 'c-' + Date.now()
    if (!user.aiConversations) {
      user.aiConversations = []
    }

    let conversation = user.aiConversations.find(c => c.id === activeConvId)
    if (!conversation) {
      conversation = {
        id: activeConvId,
        title: messageText.slice(0, 30) + (messageText.length > 30 ? '...' : ''),
        messages: [],
        updatedAt: new Date()
      }
      user.aiConversations.push(conversation)
    }

    // Append user message
    conversation.messages.push({
      sender: 'user',
      text: messageText,
      timestamp: new Date()
    })

    // 2. Build Context
    const history = user.learningHistory || []
    const roadmap = user.roadmap || []
    const tasks = user.tasks || []
    
    // Grouping for prompt context
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const todayActs = history.filter(act => new Date(act.timestamp) >= todayStart)
    const weekActs = history.filter(act => new Date(act.timestamp) >= weekStart)

    const formattedToday = todayActs.map(a => `- [${a.type.toUpperCase()}] ${a.title} (${a.details || ''})`).join('\n')
    const formattedWeek = weekActs.map(a => `- [${a.type.toUpperCase()}] ${a.title} (${a.details || ''})`).join('\n')
    
    // Dynamic Weak Concepts from quiz history
    const weakConceptsMap = {}
    history.forEach(act => {
      if (act.type === 'quiz' && act.score !== undefined && act.score < 75) {
        weakConceptsMap[act.title.replace(/Quiz:?\s*/i, '').trim()] = act.score
      }
    })
    const weakConcepts = Object.keys(weakConceptsMap)

    const completedRoadmap = roadmap.filter(r => r.progress === 100).map(r => r.title)
    const pendingRoadmap = roadmap.filter(r => r.progress < 100).map(r => `${r.title} (${r.progress}% complete)`)

    const activeTasks = tasks.filter(t => !t.completed).map(t => t.title)

    // Build chat history context (last 12 messages for performance)
    const recentMessages = conversation.messages.slice(-12, -1) // omit the current message that was just added
    const formattedHistory = recentMessages.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n')

    // 3. System Prompt Construction
    const systemPrompt = `You are a highly capable, supportive Personal AI Tutor and Mentor for the user named "${user.name}".
Your goal is to help them understand topics, revise, test themselves, generate study tools, and track their motivation.

Here is the user's exact learning status:
- Streak: ${user.streak} days
- Completed course goals: ${completedRoadmap.join(', ') || 'None yet'}
- Ongoing course goals: ${pendingRoadmap.join(', ') || 'None yet'}
- Active tasks to complete today: ${activeTasks.join(', ') || 'No pending tasks today'}
- Studied TODAY:
${formattedToday || '(No activities logged today yet)'}
- Studied THIS WEEK:
${formattedWeek || '(No activities logged this week yet)'}
- Identified weak areas (Quiz score < 75%): ${weakConcepts.join(', ') || 'None! Excellent job.'}

Rules for interaction:
1. Tone: Warm, engaging, knowledgeable, and direct. Treat the user with encouragement and clear explanations.
2. Context Awareness:
   - If the user asks "What did I study today?", "What have I done this week?", or "Summarize my progress", pull from the status above and formulate a neat, descriptive recap.
   - If the user asks for a simple explanation, use the "explain like I'm 5" (ELI5) approach, giving creative real-world analogies.
3. Interactive Features:
   - **QUIZZES**: If the user asks for a quiz, doubts, or requests test questions, generate a multiple-choice quiz of 3 to 4 questions based on their recent studies (e.g. Kubernetes, React, or whatever they are studying).
     - At the very end of your reply, you MUST embed the quiz JSON structure EXACTLY inside a tags block like this:
       <quiz-data>[{"question": "Q1 text", "options": ["opt1", "opt2", "opt3", "opt4"], "answerIndex": 0, "explanation": "Why opt1 is correct"}]</quiz-data>
     - Do not place any text inside the tag other than the JSON array itself.
   - **FLASHCARDS**: If the user asks for flashcards, study cards, or terms to review, generate 3 to 5 study flashcards.
     - At the very end of your reply, you MUST embed the flashcards JSON structure EXACTLY inside a tags block like this:
       <flashcards-data>[{"front": "Term / Question", "back": "Definition / Answer"}]</flashcards-data>
     - Ensure the JSON is valid.

Keep the main text of your response clean and encouraging. When embedding quiz or flashcard tags, place them at the very bottom of your response.`

    const prompt = `Recent Conversation Memory:
${formattedHistory || '(No previous messages)'}

User message: "${messageText}"

AI Response:`

    // Retrieve user supplied custom API key
    const customApiKey = request.headers.get('x-gemini-key') || undefined

    const aiReply = await callGemini({
      prompt,
      systemPrompt,
      customApiKey
    })

    // Append AI response
    conversation.messages.push({
      sender: 'ai',
      text: aiReply,
      timestamp: new Date()
    })
    conversation.updatedAt = new Date()

    // Save user document
    await user.save()

    return NextResponse.json({
      success: true,
      conversationId: activeConvId,
      reply: aiReply,
      conversation
    })
  } catch (error) {
    console.error('Learning AI Chat Route Error:', error)
    return NextResponse.json({ error: error.message || 'Server error in AI Assistant' }, { status: 500 })
  }
}
