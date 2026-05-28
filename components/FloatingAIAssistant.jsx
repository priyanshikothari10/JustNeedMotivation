"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/AuthContext'

export default function FloatingAIAssistant() {
  const { isAuthenticated, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [convId, setConvId] = useState('')
  const [customKey, setCustomKey] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  
  const messagesEndRef = useRef(null)

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load custom key from local storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('jnm:custom_gemini_key') || ''
      setCustomKey(storedKey)
      setConvId('quick-' + Date.now())
    }
  }, [])

  // Setup initial message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      if (!isAuthenticated) {
        setMessages([
          {
            sender: 'ai',
            text: 'Hello! I am your AI Mentor. To unlock personal revision logs, customized quizzes, flashcards, and conversation memory, please log in to your account! 👋',
            timestamp: new Date()
          }
        ])
      } else {
        setMessages([
          {
            sender: 'ai',
            text: `Hi ${user?.name || 'there'}! I am your learning assistant. How can I help you revise, test your knowledge, or review what you studied today? 🧠`,
            timestamp: new Date()
          }
        ])
      }
    }
  }, [isOpen, isAuthenticated, user, messages.length])

  const handleSaveKey = (e) => {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      localStorage.setItem('jnm:custom_gemini_key', customKey.trim())
    }
    setShowSettings(false)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userText = inputValue.trim()
    setInputValue('')
    
    // Add user message to state
    const newUserMsg = { sender: 'user', text: userText, timestamp: new Date() }
    setMessages(prev => [...prev, newUserMsg])
    setIsLoading(true)

    try {
      if (!isAuthenticated) {
        // Simple offline rule-based help fallback for guest users
        setTimeout(() => {
          setMessages(prev => [...prev, {
            sender: 'ai',
            text: "It looks like you are not logged in! I'd love to help you review and study, but I need you to sign up or log in first so I can securely read your roadmap goals and save your chat history. See you in the cloud! ⚡",
            timestamp: new Date()
          }])
          setIsLoading(false)
        }, 1000)
        return
      }

      // Fetch AI response
      const headers = { 'Content-Type': 'application/json' }
      if (customKey.trim()) {
        headers['x-gemini-key'] = customKey.trim()
      }

      const res = await fetch('/api/learning/ai', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messageText: userText,
          conversationId: convId
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to get AI response')
      }

      const data = await res.json()
      
      // Remove any quiz or flashcard raw data tags from quick float preview to keep it clean
      let replyText = data.reply || ''
      replyText = replyText.replace(/<quiz-data>[\s\S]*?<\/quiz-data>/g, '').trim()
      replyText = replyText.replace(/<flashcards-data>[\s\S]*?<\/flashcards-data>/g, '').trim()
      
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: replyText || "I've processed your query! For comprehensive interactive quizzes and flashcards review, visit the dedicated AI Mentor page.",
        timestamp: new Date()
      }])
    } catch (error) {
      console.error('AI Quick Chat error:', error)
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: `Error: ${error.message || 'Something went wrong.'} Make sure your Gemini API Key is configured.`,
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-80 md:w-96 h-[500px] mb-4 bg-[#0a0a0a]/95 border border-white/10 rounded-2xl flex flex-col shadow-[0_10px_40px_rgba(194,119,255,0.15)] overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <header className="p-4 border-b border-white/10 bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="flex h-2.5 w-2.5 absolute -top-0.5 -right-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-purple opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-neon-purple"></span>
                  </span>
                  <div className="w-8 h-8 rounded-full bg-neon-purple/20 flex items-center justify-center text-neon-purple border border-neon-purple/30 font-bold text-sm">
                    AI
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Study Mentor</h3>
                  <p className="text-[10px] text-gray-400">Quick Revision Helper</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  title="Gemini API Settings"
                  className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition"
                >
                  ⚙️
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition font-bold"
                >
                  ✕
                </button>
              </div>
            </header>

            {/* Custom API Key Form Container */}
            {showSettings && (
              <form onSubmit={handleSaveKey} className="p-4 bg-black/90 border-b border-white/10 space-y-2">
                <p className="text-[10px] text-gray-400">If GEMINI_API_KEY is not defined in backend .env, paste yours here to run calls locally:</p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    className="flex-1 bg-transparent border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-neon-purple"
                  />
                  <button type="submit" className="px-2 py-1 rounded bg-neon-purple text-black font-semibold text-xs hover:brightness-110">
                    Save
                  </button>
                </div>
              </form>
            )}

            {/* Message Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-white/5">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-neon-purple text-black rounded-tr-none font-medium'
                        : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 text-gray-400 rounded-2xl rounded-tl-none px-3 py-2 text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-black/40 flex gap-2">
              <input
                type="text"
                placeholder={isAuthenticated ? "Ask details about today's roadmap, Kubernetes..." : "Login to enable AI Mentor chat..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-neon-purple"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="p-1.5 rounded-xl bg-neon-purple text-black font-semibold hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100 transition shadow-[0_0_10px_rgba(194,119,255,0.2)]"
              >
                ➔
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue text-black flex items-center justify-center font-bold text-xl shadow-[0_0_20px_rgba(194,119,255,0.45)] hover:shadow-[0_0_25px_rgba(194,119,255,0.65)] transition-all cursor-pointer border border-white/10"
        title="Quick AI Assistant"
      >
        💬
      </motion.button>
    </div>
  )
}
