import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'JustNeedMotivation',
  description: 'Calm, neon learning tracker'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white antialiased">
        <div className="min-h-screen max-w-5xl mx-auto px-4 md:px-8">
          <header className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <h1 className="text-xl font-semibold tracking-tight text-neon-green text-center md:text-left">JustNeedMotivation</h1>
            <nav className="flex flex-wrap justify-center md:justify-end gap-2 text-sm">
              <Link href="/" className="px-3 py-1 rounded-md hover:bg-white/3 transition">Dashboard</Link>
              <Link href="/timer" className="px-3 py-1 rounded-md hover:bg-white/3 transition">Timer</Link>
              <Link href="/daily" className="px-3 py-1 rounded-md hover:bg-white/3 transition">Daily Log</Link>
              <Link href="/roadmap" className="px-3 py-1 rounded-md hover:bg-white/3 transition">Roadmap</Link>
              <Link href="/rewards" className="px-3 py-1 rounded-md hover:bg-white/3 transition">Rewards</Link>
            </nav>
          </header>

          <main>{children}</main>
          <footer className="py-8 text-center text-sm text-gray-500">Made with care • Keep going — you’re doing fine</footer>
        </div>
      </body>
    </html>
  )
}
