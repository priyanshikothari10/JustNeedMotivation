'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSignup = (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert("Passwords don't match!")
      return
    }
    // Integration logic here
    console.log('Signing up with:', { name, email, password })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md p-8 md:p-10 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_40px_rgba(57,255,20,0.05)] relative overflow-hidden"
      >
        {/* Subtle decorative glow behind form */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-neon-purple/10 blur-[60px] rounded-full pointer-events-none" />

        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Create Account</h2>
          <p className="text-sm text-gray-400">Join us and start tracking your momentum.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5 relative z-10">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-purple/50 focus:border-neon-purple/50 transition-all"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-purple/50 focus:border-neon-purple/50 transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-purple/50 focus:border-neon-purple/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-purple/50 focus:border-neon-purple/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-3 px-4 mt-2 rounded-xl bg-gradient-to-r from-neon-purple/90 to-blue-500 hover:from-neon-purple hover:to-blue-400 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(194,119,255,0.3)] transition-all"
          >
            Sign Up
          </motion.button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400 relative z-10">
          Already have an account?{' '}
          <Link href="/login" className="text-neon-purple/90 hover:text-neon-purple font-medium transition-colors">
            Log in
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
