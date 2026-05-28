import './globals.css'
import { AuthProvider } from '@/lib/AuthContext'
import Header from '@/components/Header'
import FloatingAIAssistant from '@/components/FloatingAIAssistant'

export const metadata = {
  title: 'JustNeedMotivation',
  description: 'Calm, neon learning tracker'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white antialiased">
        <AuthProvider>
          <div className="min-h-screen max-w-5xl mx-auto px-4 md:px-8">
            <Header />

            <main>{children}</main>
            <FloatingAIAssistant />
            <footer className="py-8 text-center text-sm text-gray-500">Made with care • Keep going — you’re doing fine</footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
