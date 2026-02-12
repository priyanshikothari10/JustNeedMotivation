"use client"

import { motion } from 'framer-motion'

export default function ProgressTracker({ percent = 0 }) {
  const size = 96
  const stroke = 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dash = circumference * (1 - percent / 100)

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#39FF14"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animate={{ strokeDashoffset: dash }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </svg>

      <div className="mt-3 text-center">
        <div className="text-sm text-gray-400">Today</div>
        <div className="text-2xl font-semibold text-neon-green">{percent}%</div>
      </div>
    </div>
  )
}
