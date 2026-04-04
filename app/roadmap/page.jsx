const completedFeatures = [
  {
    id: 1,
    title: "Smart Focus Timer (Pomodoro Mode)",
    subtitle: "Make deep work feel light and structured.",
    points: [
      "25 min focus + 5 min break",
      "Auto track sessions",
      "Show daily focus hours",
      "Add 'Deep Work Streak'",
    ],
  },
];

const featureRoadmap = [
  {
    id: 2,
    title: "Rewards & Achievements System",
    subtitle: "Get rewarded for your hard work.",
    points: [
      "Unlockable themes",
      "Milestone badges",
      "Weekly completion summaries"
    ]
  }
];

export default function RoadmapPage() {
  return (
    <main className="min-h-screen bg-black text-white p-8 space-y-12 max-w-4xl mx-auto">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Planned Features</h1>
        <p className="text-gray-400 text-sm">
          A focused list of upcoming improvements.
        </p>
        <div className="space-y-4">
          {featureRoadmap.map((feature) => (
            <article
              key={feature.id}
              className="border border-white/10 rounded-lg p-5 space-y-2 bg-white/[0.02]"
            >
              <h2 className="text-lg font-medium text-neon-green">{feature.title}</h2>
              <p className="text-sm text-gray-400">{feature.subtitle}</p>

              <ul className="list-disc list-inside text-sm text-gray-300 space-y-1 pt-2">
                {feature.points.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-400">Completed Features</h2>
        <p className="text-gray-500 text-sm">
          Features that have already been shipped.
        </p>
        <div className="space-y-4 opacity-70">
          {completedFeatures.map((feature) => (
            <article
              key={feature.id}
              className="border border-gray-800 rounded-lg p-5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-white/50">{feature.title}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white/40 uppercase tracking-wider border border-white/5">
                  Shipped
                </span>
              </div>
              <p className="text-sm text-gray-500">{feature.subtitle}</p>

              <ul className="list-disc list-inside text-sm text-gray-500 space-y-1 pt-2">
                {feature.points.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
