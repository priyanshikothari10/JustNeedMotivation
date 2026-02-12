const featureRoadmap = [
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

export default function RoadmapPage() {
  return (
    <main className="min-h-screen bg-black text-white p-8 space-y-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">Product Roadmap</h1>
        <p className="text-gray-400 text-sm">
          A focused list of improvements to build and feel proud of.
        </p>
      </section>

      <section className="space-y-4">
        {featureRoadmap.map((feature) => (
          <article
            key={feature.id}
            className="border border-gray-800 rounded-lg p-5 space-y-2"
          >
            <h2 className="text-lg font-medium">{feature.title}</h2>
            <p className="text-sm text-gray-400">{feature.subtitle}</p>

            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
              {feature.points.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
}
