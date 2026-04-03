import PomodoroTimer from '../../components/PomodoroTimer'

export default function TimerPage() {
  return (
    <div className="py-6 max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-white mb-2">Focus Mode</h1>
        <p className="text-sm text-gray-400">Time down, focus up. Disconnect from distractions.</p>
      </div>
      <PomodoroTimer />
    </div>
  )
}
