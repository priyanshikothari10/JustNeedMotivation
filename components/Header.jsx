"use client"

import Link from 'next/link'
import Logo from '@/components/Logo'
import { useAuth } from '@/lib/AuthContext'

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <header className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <Link href="/" className="-ml-3">
        <Logo />
      </Link>
      <nav className="flex flex-wrap justify-center md:justify-end items-center gap-2 text-sm">
        <Link href="/" className="px-3 py-1 rounded-md hover:bg-white/3 transition">Dashboard</Link>
        <Link href="/timer" className="px-3 py-1 rounded-md hover:bg-white/3 transition">Timer</Link>
        <Link href="/daily" className="px-3 py-1 rounded-md hover:bg-white/3 transition">Daily Log</Link>
        <Link href="/roadmap" className="px-3 py-1 rounded-md hover:bg-white/3 transition">Roadmap</Link>
        <Link href="/rewards" className="px-3 py-1 rounded-md hover:bg-white/3 transition">Rewards</Link>
        
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3 ml-2">
            <span className="text-gray-400 text-xs">
              Hi, <span className="text-neon-green font-semibold">{user.name}</span>
            </span>
            <button
              onClick={logout}
              className="px-3 py-1 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 text-neon-purple font-medium transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-3 py-1 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 text-neon-blue transition ml-2 font-medium"
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  )
}
