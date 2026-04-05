'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    // Integration logic here
    console.log('Logging in with:', { email, password })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md p-8 md:p-10 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_40px_rgba(57,255,20,0.05)] relative overflow-hidden"
      >
        {/* Subtle decorative glow behind form */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-neon-blue/10 blur-[60px] rounded-full pointer-events-none" />

        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h2>
          <p className="text-sm text-gray-400">Log in to keep your momentum going.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
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
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue/50 transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium text-gray-300" htmlFor="password">
                Password
              </label>
              <Link href="#" className="text-xs text-neon-blue/80 hover:text-neon-blue transition-colors">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-neon-green/90 to-emerald-400 hover:from-neon-green hover:to-emerald-300 text-black font-bold tracking-wide shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all"
          >
            Sign In
          </motion.button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400 relative z-10">
          Don&apos;t have an account?{' '}
          <Link href="#" className="text-neon-green/90 hover:text-neon-green font-medium transition-colors">
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
