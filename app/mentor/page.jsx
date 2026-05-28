"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import NeonBackground from '@/components/NeonBackground'

export default function AIMentorPage() {
  const { isAuthenticated, user, loading } = useAuth()
  
  // States
  const [activeTab, setActiveTab] = useState('chat') // 'chat' | 'revision' | 'history'
  const [history, setHistory] = useState({ today: [], thisWeek: [], entireCourse: [] })
  const [analytics, setAnalytics] = useState(null)
  const [conversations, setConversations] = useState([])
  const [activeConvId, setActiveConvId] = useState('')
  const [messages, setMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [weeklySummary, setWeeklySummary] = useState('')
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)
  
  // Custom API Key fallback state
  const [customKey, setCustomKey] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  // Interactive Quiz Parser State
  const [activeQuiz, setActiveQuiz] = useState(null) // Array of questions
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState(0)

  // Flashcards state
  const [flashcards, setFlashcards] = useState([])
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  // Learning Log Form State
  const [logType, setLogType] = useState('lesson')
  const [logTitle, setLogTitle] = useState('')
  const [logDetails, setLogDetails] = useState('')
  const [logScore, setLogScore] = useState('')
  const [logTotalQuestions, setLogTotalQuestions] = useState('')
  const [isLogging, setIsLogging] = useState(false)
  const [logMessage, setLogMessage] = useState('')

  const chatEndRef = useRef(null)

  // 1. Initial Load of Custom Keys & Initializers
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const key = localStorage.getItem('jnm:custom_gemini_key') || ''
      setCustomKey(key)
    }
  }, [])

  // 2. Fetch User Specific Learning Log & Chats if Authenticated
  useEffect(() => {
    if (loading) return
    if (isAuthenticated && user) {
      fetchLearningHistory()
      fetchAnalytics()
      
      // Load conversations from user object
      const userConvs = user.aiConversations || []
      setConversations(userConvs)
      
      if (userConvs.length > 0) {
        // Select latest conversation
        const sorted = [...userConvs].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        setActiveConvId(sorted[0].id)
        setMessages(sorted[0].messages || [])
      } else {
        const defaultId = 'c-' + Date.now()
        setActiveConvId(defaultId)
        setMessages([
          {
            sender: 'ai',
            text: `Welcome to your AI Mentor workspace, ${user.name}! 🧠 I am here to help you study, review concepts, practice with quizzes, and generate study resources. Tell me what you'd like to work on!`,
            timestamp: new Date()
          }
        ])
      }
      
      // Fetch user's flashcards
      fetchFlashcards()
    }
  }, [isAuthenticated, user, loading])

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isChatLoading])

  // Fetch helpers
  const fetchLearningHistory = async () => {
    try {
      const res = await fetch('/api/learning/history')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setHistory(data.categorized)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/learning/analytics')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setAnalytics(data.analytics)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchFlashcards = async () => {
    try {
      const res = await fetch('/api/learning/flashcards')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setFlashcards(data.flashcards || [])
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Handle Custom API key input save
  const handleSaveApiKey = (e) => {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      localStorage.setItem('jnm:custom_gemini_key', customKey.trim())
    }
    setShowSettings(false)
    // Reload quick instruction or let user know
    alert('Custom Gemini API Key saved locally!')
  }

  // Create a new chat session
  const handleNewChat = () => {
    const nextId = 'c-' + Date.now()
    setActiveConvId(nextId)
    setMessages([
      {
        sender: 'ai',
        text: "Started a fresh revision session. What topic would you like to review now? You can request a quiz or study cards at any time!",
        timestamp: new Date()
      }
    ])
  }

  // Choose a conversation from history
  const handleSelectConv = (conv) => {
    setActiveConvId(conv.id)
    setMessages(conv.messages || [])
  }

  // Preset quick chips trigger
  const handlePresetQuery = (queryText) => {
    if (isChatLoading) return
    setChatInput(queryText)
  }

  // Log a new activity manual form
  const handleAddLog = async (e) => {
    e.preventDefault()
    if (!logTitle.trim()) return

    setIsLogging(true)
    setLogMessage('')

    try {
      const payload = {
        type: logType,
        title: logTitle.trim(),
        details: logDetails.trim() || undefined,
        score: logType === 'quiz' && logScore ? Number(logScore) : undefined,
        totalQuestions: logType === 'quiz' && logTotalQuestions ? Number(logTotalQuestions) : undefined
      }

      const res = await fetch('/api/learning/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Failed to save study log')
      
      setLogTitle('')
      setLogDetails('')
      setLogScore('')
      setLogTotalQuestions('')
      setLogMessage('Study log successfully saved!')

      // Refresh data
      await fetchLearningHistory()
      await fetchAnalytics()
    } catch (err) {
      setLogMessage(`Error: ${err.message}`)
    } finally {
      setIsLogging(false)
      setTimeout(() => setLogMessage(''), 4000)
    }
  }

  // AI Chat Request Trigger
  const handleSendChatMessage = async (e) => {
    e.preventDefault()
    if (!chatInput.trim() || isChatLoading) return

    const userText = chatInput.trim()
    setChatInput('')

    // 1. Update list
    const userMsg = { sender: 'user', text: userText, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setIsChatLoading(true)

    try {
      const headers = { 'Content-Type': 'application/json' }
      if (customKey.trim()) {
        headers['x-gemini-key'] = customKey.trim()
      }

      const res = await fetch('/api/learning/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messageText: userText,
          conversationId: activeConvId
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to get tutor response')
      }

      const data = await res.json()
      const reply = data.reply || ''

      // 2. Parse AI response for hidden tags (e.g. interactive quizzes, flashcards)
      // Check for <quiz-data>...</quiz-data>
      const quizMatch = reply.match(/<quiz-data>([\s\S]*?)<\/quiz-data>/)
      if (quizMatch) {
        try {
          const quizJson = JSON.parse(quizMatch[1].trim())
          if (Array.isArray(quizJson)) {
            setActiveQuiz(quizJson)
            setQuizAnswers({})
            setQuizSubmitted(false)
            setActiveTab('revision') // switch to revision hub to answer!
          }
        } catch (e) {
          console.error("Failed to parse quiz json:", e)
        }
      }

      // Check for <flashcards-data>...</flashcards-data>
      const flashcardsMatch = reply.match(/<flashcards-data>([\s\S]*?)<\/flashcards-data>/)
      if (flashcardsMatch) {
        try {
          const cardsJson = JSON.parse(flashcardsMatch[1].trim())
          if (Array.isArray(cardsJson)) {
            // Save generated flashcards in database
            const saveRes = await fetch('/api/learning/flashcards', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ flashcards: cardsJson })
            })
            if (saveRes.ok) {
              await fetchFlashcards()
              setCurrentFlashcardIndex(0)
              setIsFlipped(false)
              setActiveTab('revision') // switch to see cards!
            }
          }
        } catch (e) {
          console.error("Failed to save AI flashcards:", e)
        }
      }

      // 3. Strip tags from text message display
      let cleanReply = reply.replace(/<quiz-data>[\s\S]*?<\/quiz-data>/g, '').trim()
      cleanReply = cleanReply.replace(/<flashcards-data>[\s\S]*?<\/flashcards-data>/g, '').trim()

      if (quizMatch) {
        cleanReply += "\n\n💡 *I have generated an interactive mini-quiz for you! It is ready in your Revision Hub on the right panel!*"
      }
      if (flashcardsMatch) {
        cleanReply += "\n\n💡 *I have generated custom revision flashcards and added them to your carousel in the Revision Hub!*"
      }

      setMessages(prev => [...prev, {
        sender: 'ai',
        text: cleanReply,
        timestamp: new Date()
      }])

      // Reload conversations list to get updated title/timestamp
      if (data.conversation) {
        setConversations(prev => {
          const filtered = prev.filter(c => c.id !== data.conversation.id)
          return [data.conversation, ...filtered]
        })
      }
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: `Tutor Error: ${err.message || 'Server error occurred.'} Make sure your Gemini API key is configured correctly in `.env` or Settings above.`,
        timestamp: new Date()
      }])
    } finally {
      setIsChatLoading(false)
    }
  }

  // Weekly Recap triggering
  const handleTriggerSummary = async () => {
    setIsSummaryLoading(true)
    setWeeklySummary('')
    try {
      const headers = {}
      if (customKey.trim()) {
        headers['x-gemini-key'] = customKey.trim()
      }
      const res = await fetch('/api/learning/summary', { headers })
      if (!res.ok) throw new Error('Could not pull recap')
      const data = await res.json()
      setWeeklySummary(data.summary || 'Summary loaded.')
    } catch (err) {
      setWeeklySummary(`Error: ${err.message}`)
    } finally {
      setIsSummaryLoading(false)
    }
  }

  // Quiz submission & logging
  const handleQuizOptionSelect = (qIdx, optIdx) => {
    setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }))
  }

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return
    let correctCount = 0
    activeQuiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.answerIndex) {
        correctCount++
      }
    })

    const scorePct = Math.round((correctCount / activeQuiz.length) * 100)
    setQuizScore(scorePct)
    setQuizSubmitted(true)

    // Log this quiz completed in the database!
    try {
      await fetch('/api/learning/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'quiz',
          title: `Tutor Quiz: ${activeQuiz[0]?.question.slice(0, 20)}...`,
          details: `Scored ${correctCount}/${activeQuiz.length} on AI mini quiz`,
          score: scorePct,
          totalQuestions: activeQuiz.length
        })
      })
      await fetchLearningHistory()
      await fetchAnalytics()
    } catch (e) {
      console.error(e)
    }
  }

  // Flashcards difficulty review updating
  const handleReviewFlashcard = async (difficulty) => {
    if (flashcards.length === 0) return
    const currentCard = flashcards[currentFlashcardIndex]

    try {
      // Post updated review metadata
      await fetch('/api/learning/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flashcard: {
            id: currentCard._id,
            difficulty,
            nextReviewDate: new Date(Date.now() + (difficulty === 'easy' ? 4 : difficulty === 'medium' ? 2 : 1) * 24 * 60 * 60 * 1000)
          }
        })
      })

      setIsFlipped(false)
      setTimeout(() => {
        if (currentFlashcardIndex < flashcards.length - 1) {
          setCurrentFlashcardIndex(prev => prev + 1)
        } else {
          setCurrentFlashcardIndex(0)
        }
        fetchFlashcards()
      }, 200)
    } catch (e) {
      console.error(e)
    }
  }

  // Loader state
  if (loading) {
    return (
      <main className="min-h-screen text-white flex items-center justify-center bg-black">
        <div className="text-sm text-gray-400 animate-pulse">Initializing AI Mentor core...</div>
      </main>
    )
  }

  // Offline/Unauthenticated layout
  if (!isAuthenticated) {
    return (
      <main className="min-h-[80vh] text-white p-4 md:p-8 relative z-10 max-w-4xl mx-auto flex flex-col items-center justify-center">
        <NeonBackground />
        <div className="text-center space-y-6 max-w-lg p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_35px_rgba(194,119,255,0.08)]">
          <h1 className="text-3xl font-bold text-neon-purple tracking-wide">AI Mentor Offline</h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            The Smart Learning AI Agent acts as a personal tutor that remembers your learning history. It requires an authenticated user account to track streaks, analyze weak concepts, store active chats, and compile weekly recaps.
          </p>
          <div className="pt-4">
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-purple to-purple-600 text-black font-bold tracking-wide shadow-[0_0_20px_rgba(194,119,255,0.3)] hover:brightness-110 transition-all inline-block"
            >
              Sign In to AI Mentor
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen text-white p-4 md:p-8 relative z-10 max-w-6xl mx-auto space-y-6">
      <NeonBackground />

      {/* Header Banner */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-neon-purple tracking-tight">AI Mentor</h1>
          <p className="text-gray-400 text-sm mt-1">
            Your personal, context-aware revision assistant. Study smarter, identify weak concepts, and practice.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 transition"
          >
            ⚙️ Settings
          </button>
          <button
            onClick={handleTriggerSummary}
            className="px-3 py-1.5 rounded-md text-xs font-bold bg-neon-purple text-black hover:brightness-110 transition shadow-[0_0_15px_rgba(194,119,255,0.2)]"
          >
            Weekly Recap
          </button>
        </div>
      </header>

      {/* API Key Settings Overlay */}
      {showSettings && (
        <form onSubmit={handleSaveApiKey} className="card p-5 border-neon-purple/40 bg-black/90 space-y-4">
          <h3 className="text-sm font-semibold text-neon-purple uppercase tracking-wider">Tutor Core Settings</h3>
          <p className="text-xs text-gray-400">
            If the server environment lacks a `GEMINI_API_KEY`, paste your Google AI Studio key below. It remains safely saved in your browser&apos;s localStorage:
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="password"
              placeholder="Paste GEMINI_API_KEY (starts with AIzaSy...)"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              className="flex-1 bg-black border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-neon-purple"
            />
            <button
              type="submit"
              className="bg-neon-purple text-black font-semibold px-4 py-2 rounded-md hover:brightness-110 transition text-sm"
            >
              Save Key
            </button>
          </div>
        </form>
      )}

      {/* Weekly Summary Display Area */}
      {weeklySummary && (
        <div className="card border-neon-blue/40 bg-neon-blue/5 p-5 space-y-4 relative z-20">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider">📅 AI Weekly Study Recap</h3>
            <button onClick={() => setWeeklySummary('')} className="text-xs text-gray-400 hover:text-white">Close ×</button>
          </div>
          <div className="text-xs text-gray-200 leading-relaxed overflow-y-auto max-h-48 prose prose-invert pr-2">
            {weeklySummary.split('\n').map((para, i) => (
              <p key={i} className="mb-2">{para}</p>
            ))}
          </div>
        </div>
      )}

      {isSummaryLoading && (
        <div className="card bg-neon-blue/5 border-neon-blue/20 p-4 text-center text-xs text-neon-blue animate-pulse">
          Analyzing your study history for the past 7 days and generating custom recommendations...
        </div>
      )}

      {/* Workspace Core grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Analytics and Chats List (cols-3) */}
        <aside className="lg:col-span-3 space-y-6">
          
          {/* Section 1: Dashboard Stats */}
          {analytics && (
            <section className="card space-y-3 bg-[#070707]/60">
              <h3 className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-bold">Smart Statistics</h3>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2">
                  <p className="text-lg font-bold text-neon-purple">{analytics.streak}d</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wide">Streak</p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2">
                  <p className="text-lg font-bold text-neon-green">{analytics.overallProgress}%</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wide">Goal Progress</p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2">
                  <p className="text-lg font-bold text-neon-blue">{Math.round(analytics.totalFocusMinutes / 60)}h</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wide">Focus Hours</p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2">
                  <p className="text-lg font-bold text-yellow-400">{analytics.breakdown.quiz}</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wide">Quizzes Done</p>
                </div>
              </div>

              {/* Weak concepts section */}
              {analytics.weakConcepts && analytics.weakConcepts.length > 0 && (
                <div className="border-t border-white/5 pt-3 space-y-1.5">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-red-400">Weak Topics Detected</p>
                  <div className="flex flex-wrap gap-1">
                    {analytics.weakConcepts.map((item, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[9px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                        {item.title} ({item.lowScore}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Section 2: Conversational Memory List */}
          <section className="card space-y-3 bg-[#070707]/60 max-h-80 flex flex-col">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-bold">Past Sessions</h3>
              <button
                onClick={handleNewChat}
                className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-neon-purple hover:bg-white/10 font-bold transition"
              >
                + New
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-xs">
              {conversations.length === 0 ? (
                <p className="text-[10px] text-gray-500 italic pl-1">No past chats. Start typing!</p>
              ) : (
                conversations.map((conv, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectConv(conv)}
                    className={`w-full text-left p-2 rounded-lg truncate transition border ${
                      activeConvId === conv.id
                        ? 'border-neon-purple/50 bg-neon-purple/5 text-white'
                        : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    💬 {conv.title || 'Revision Session'}
                  </button>
                ))
              )}
            </div>
          </section>
        </aside>

        {/* Center column: Main Chat UI (cols-6) */}
        <section className="lg:col-span-6 flex flex-col h-[600px] card p-0 overflow-hidden bg-black/40 relative">
          <header className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-purple animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Interactive AI Tutor</h3>
            </div>
            <div className="flex bg-white/5 border border-white/10 rounded-md p-0.5 text-[10px] font-bold">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-2 py-1 rounded transition ${activeTab === 'chat' ? 'bg-neon-purple text-black' : 'text-gray-400 hover:text-white'}`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-2 py-1 rounded transition ${activeTab === 'history' ? 'bg-neon-purple text-black' : 'text-gray-400 hover:text-white'}`}
              >
                History Logs
              </button>
            </div>
          </header>

          {activeTab === 'chat' ? (
            <>
              {/* Messages feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                        msg.sender === 'user'
                          ? 'bg-neon-purple text-black rounded-tr-none font-medium shadow-[0_0_15px_rgba(194,119,255,0.15)]'
                          : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none shadow-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 text-gray-400 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-neon-purple animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-neon-purple animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-neon-purple animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span>Thinking and recalling context...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Query Chips */}
              <div className="px-4 py-2 border-t border-white/5 bg-white/[0.01] flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none text-[10px] text-gray-400">
                <button onClick={() => handlePresetQuery("What did I study today?")} className="px-2 py-1 rounded-full border border-white/10 hover:border-neon-purple hover:text-white bg-black/60 transition">
                  What did I study today?
                </button>
                <button onClick={() => handlePresetQuery("Explain Kubernetes Pods in simple words.")} className="px-2 py-1 rounded-full border border-white/10 hover:border-neon-purple hover:text-white bg-black/60 transition">
                  Explain Kubernetes Pods
                </button>
                <button onClick={() => handlePresetQuery("Give me a quiz from this week's lessons.")} className="px-2 py-1 rounded-full border border-white/10 hover:border-neon-purple hover:text-white bg-black/60 transition">
                  Take a Quiz
                </button>
                <button onClick={() => handlePresetQuery("Generate revision flashcards for React Hooks.")} className="px-2 py-1 rounded-full border border-white/10 hover:border-neon-purple hover:text-white bg-black/60 transition">
                  Create Flashcards
                </button>
                <button onClick={() => handlePresetQuery("What are my weak topics?")} className="px-2 py-1 rounded-full border border-white/10 hover:border-neon-purple hover:text-white bg-black/60 transition">
                  What are my weak topics?
                </button>
              </div>

              {/* Chat Send Form */}
              <form onSubmit={handleSendChatMessage} className="p-4 border-t border-white/10 bg-black/50 flex gap-3">
                <input
                  type="text"
                  placeholder="Ask a doubt, explain a topic, generate revision cards..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isChatLoading}
                  className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-neon-purple"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="bg-neon-purple text-black font-bold px-5 py-2.5 rounded-xl hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100 transition shadow-[0_0_15px_rgba(194,119,255,0.3)] text-sm"
                >
                  ➔
                </button>
              </form>
            </>
          ) : (
            // History Log Tab
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neon-green">Study Activity Log</h3>
                <span className="text-[10px] text-gray-500">Categorized automatically</span>
              </div>

              <div className="space-y-4">
                {/* TODAY */}
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Today</h4>
                  {history.today.length === 0 ? (
                    <p className="text-xs text-gray-500 italic pl-2">No study activities logged today.</p>
                  ) : (
                    <div className="space-y-2 border-l border-white/10 pl-3">
                      {history.today.map((act, idx) => (
                        <div key={idx} className="bg-white/[0.01] border border-white/5 rounded-lg p-2 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-neon-purple uppercase text-[9px] mr-2">[{act.type}]</span>
                            <span className="text-white font-medium">{act.title}</span>
                          </div>
                          {act.score !== undefined && (
                            <span className={`text-[10px] font-bold ${act.score >= 75 ? 'text-neon-green' : 'text-red-400'}`}>
                              {act.score}%
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* WEEK */}
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">This Week</h4>
                  {history.thisWeek.length === 0 ? (
                    <p className="text-xs text-gray-500 italic pl-2">No activities completed this week.</p>
                  ) : (
                    <div className="space-y-2 border-l border-white/10 pl-3">
                      {history.thisWeek.map((act, idx) => (
                        <div key={idx} className="bg-white/[0.01] border border-white/5 rounded-lg p-2 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-neon-purple uppercase text-[9px] mr-2">[{act.type}]</span>
                            <span className="text-white font-medium">{act.title}</span>
                          </div>
                          {act.score !== undefined && (
                            <span className="text-neon-green text-[10px] font-bold">{act.score}%</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Right column: Revision Hub (Flashcards, Quiz, Study Logger) (cols-3) */}
        <aside className="lg:col-span-3 space-y-6">
          
          {/* Tab Selection */}
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-0.5 text-xs font-bold w-full text-center">
            <button
              onClick={() => setActiveTab('revision')}
              className={`flex-1 py-2 rounded-lg transition ${activeTab === 'revision' ? 'bg-neon-blue text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Revision Hub
            </button>
            <button
              onClick={() => setActiveTab('log')}
              className={`flex-1 py-2 rounded-lg transition ${activeTab === 'log' ? 'bg-neon-blue text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Log Study
            </button>
          </div>

          {activeTab === 'revision' ? (
            <div className="space-y-6">
              
              {/* Flashcards Carousel widget */}
              <section className="card space-y-3 bg-[#070707]/60">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-bold">Study Flashcards</h3>
                  <span className="text-[9px] text-neon-blue font-bold">
                    {flashcards.length > 0 ? `${currentFlashcardIndex + 1}/${flashcards.length}` : '0/0'}
                  </span>
                </div>

                {flashcards.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-white/10 rounded-xl text-xs text-gray-500 italic">
                    No flashcards saved. Ask the AI tutor to generate some!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Card container */}
                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="h-36 w-full relative rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-center p-4 cursor-pointer overflow-hidden transition-all duration-300 text-center select-none"
                    >
                      <AnimatePresence mode="wait">
                        {!isFlipped ? (
                          <motion.div
                            key="front"
                            initial={{ opacity: 0, rotateY: 90 }}
                            animate={{ opacity: 1, rotateY: 0 }}
                            exit={{ opacity: 0, rotateY: -90 }}
                            transition={{ duration: 0.15 }}
                            className="text-xs text-white font-medium"
                          >
                            <p className="text-[9px] uppercase tracking-wider text-neon-blue mb-2">Front</p>
                            {flashcards[currentFlashcardIndex].front}
                          </motion.div>
                        ) : (
                          <motion.div
                            key="back"
                            initial={{ opacity: 0, rotateY: 90 }}
                            animate={{ opacity: 1, rotateY: 0 }}
                            exit={{ opacity: 0, rotateY: -90 }}
                            transition={{ duration: 0.15 }}
                            className="text-xs text-neon-blue font-semibold"
                          >
                            <p className="text-[9px] uppercase tracking-wider text-neon-green mb-2">Back</p>
                            {flashcards[currentFlashcardIndex].back}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Flipping controller */}
                    <div className="flex justify-between items-center gap-1.5 pt-1">
                      <button
                        onClick={() => handleReviewFlashcard('easy')}
                        className="flex-1 py-1 rounded text-[9px] uppercase font-bold bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20"
                      >
                        😊 Easy
                      </button>
                      <button
                        onClick={() => handleReviewFlashcard('medium')}
                        className="flex-1 py-1 rounded text-[9px] uppercase font-bold bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20"
                      >
                        😐 Ok
                      </button>
                      <button
                        onClick={() => handleReviewFlashcard('hard')}
                        className="flex-1 py-1 rounded text-[9px] uppercase font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                      >
                        🔥 Hard
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Dynamic Interactive Quiz Player */}
              <section className="card space-y-3 bg-[#070707]/60">
                <h3 className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-bold">Interactive Mini Quiz</h3>

                {!activeQuiz ? (
                  <div className="p-8 text-center border border-dashed border-white/10 rounded-xl text-xs text-gray-500 italic">
                    No active quiz in session. Ask the AI mentor to &quot;test me on this week&apos;s topics!&quot;
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-[10px] text-gray-400 font-medium">Grades are logged directly to database analytics!</p>
                    
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {activeQuiz.map((q, qIdx) => (
                        <div key={qIdx} className="space-y-2 border-b border-white/5 pb-3">
                          <p className="text-xs font-semibold text-white">Q{qIdx + 1}: {q.question}</p>
                          <div className="grid gap-1.5">
                            {q.options.map((opt, optIdx) => {
                              const isSelected = quizAnswers[qIdx] === optIdx
                              const isCorrect = q.answerIndex === optIdx
                              
                              let buttonClass = "w-full text-left p-2 rounded-lg text-xs bg-white/5 border border-white/10 hover:bg-white/10 transition text-gray-300"
                              if (isSelected) {
                                buttonClass = "w-full text-left p-2 rounded-lg text-xs font-bold bg-neon-blue text-black transition"
                              }
                              if (quizSubmitted) {
                                if (isCorrect) {
                                  buttonClass = "w-full text-left p-2 rounded-lg text-xs font-bold bg-neon-green text-black transition"
                                } else if (isSelected) {
                                  buttonClass = "w-full text-left p-2 rounded-lg text-xs font-bold bg-red-500 text-white transition"
                                } else {
                                  buttonClass = "w-full text-left p-2 rounded-lg text-xs opacity-50 bg-white/5 border border-white/10 text-gray-400 transition"
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => !quizSubmitted && handleQuizOptionSelect(qIdx, optIdx)}
                                  disabled={quizSubmitted}
                                  className={buttonClass}
                                >
                                  {opt}
                                </button>
                              )
                            })}
                          </div>
                          {quizSubmitted && q.explanation && (
                            <p className="text-[10px] text-neon-green bg-neon-green/5 p-2 rounded border border-neon-green/10 mt-1 leading-relaxed">
                              💡 {q.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {!quizSubmitted ? (
                      <button
                        onClick={handleSubmitQuiz}
                        className="w-full bg-neon-blue text-black font-bold py-2 rounded-lg hover:brightness-110 transition text-xs"
                      >
                        Submit Answers
                      </button>
                    ) : (
                      <div className="space-y-2 pt-2 text-center">
                        <div className="text-sm font-extrabold text-neon-green">
                          Score: {quizScore}% {quizScore >= 75 ? '🎉 Pass!' : '📚 Revision Recommended'}
                        </div>
                        <button
                          onClick={() => {
                            setActiveQuiz(null)
                            setQuizAnswers({})
                            setQuizSubmitted(false)
                          }}
                          className="w-full bg-white/10 text-white border border-white/10 font-bold py-1.5 rounded-lg hover:bg-white/15 transition text-[10px] uppercase tracking-wider"
                        >
                          Clear Quiz Player
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </section>

            </div>
          ) : (
            // Tab 2: Add log manually
            <form onSubmit={handleAddLog} className="card space-y-4 bg-[#070707]/60">
              <h3 className="text-[10px] uppercase tracking-[0.16em] text-gray-500 font-bold">Manual Study Logger</h3>

              <div className="space-y-1">
                <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider">Activity Type</label>
                <select
                  value={logType}
                  onChange={(e) => setLogType(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-md px-3 py-2 text-white text-xs focus:outline-none focus:border-neon-blue"
                >
                  <option value="lesson">Lesson completed</option>
                  <option value="video">Video watched</option>
                  <option value="note">Notes created</option>
                  <option value="quiz">Quiz completed</option>
                  <option value="topic">Topic studied</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master React Context API"
                  value={logTitle}
                  onChange={(e) => setLogTitle(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-md px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider">Additional details</label>
                <textarea
                  placeholder="e.g. completed exercises or took screenshots..."
                  value={logDetails}
                  onChange={(e) => setLogDetails(e.target.value)}
                  rows={2}
                  className="w-full bg-black border border-white/10 rounded-md px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue text-xs leading-relaxed"
                />
              </div>

              {logType === 'quiz' && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-medium text-gray-400 uppercase tracking-wider">Score %</label>
                    <input
                      type="number"
                      placeholder="85"
                      min="0"
                      max="100"
                      value={logScore}
                      onChange={(e) => setLogScore(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-neon-blue text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-medium text-gray-400 uppercase tracking-wider">Questions count</label>
                    <input
                      type="number"
                      placeholder="10"
                      min="1"
                      value={logTotalQuestions}
                      onChange={(e) => setLogTotalQuestions(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-neon-blue text-xs"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLogging}
                className="w-full bg-neon-blue text-black font-bold py-2 rounded-lg hover:brightness-110 transition text-xs uppercase tracking-wider shadow-[0_0_10px_rgba(0,212,255,0.15)]"
              >
                {isLogging ? 'Saving log...' : 'Save Activity'}
              </button>

              {logMessage && (
                <div className={`text-[10px] text-center font-semibold pt-1 ${logMessage.includes('Error') ? 'text-red-400' : 'text-neon-green'}`}>
                  {logMessage}
                </div>
              )}
            </form>
          )}

        </aside>

      </div>
    </main>
  )
}
