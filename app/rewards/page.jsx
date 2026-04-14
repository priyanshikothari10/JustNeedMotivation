import NeonBackground from "../../components/NeonBackground";

const rewardsList = [
  {
    id: 1,
    title: "Rewards & Achievements System",
    subtitle: "Get rewarded for your hard work.",
    points: [
      "Unlockable themes",
      "Milestone badges",
      "Weekly completion summaries"
    ]
  }
];

export default function RewardsPage() {
  return (
    <main className="min-h-screen text-white p-8 relative z-10 max-w-4xl mx-auto">
      <NeonBackground />

      <h1 className="text-4xl font-bold text-neon-green mb-8">
        Rewards
      </h1>

      <div className="space-y-4">
        {rewardsList.map((reward) => (
          <article
            key={reward.id}
            className="border border-white/10 rounded-lg p-5 space-y-2 bg-black/50 backdrop-blur-sm"
          >
            <h2 className="text-lg font-medium text-neon-green">{reward.title}</h2>
            <p className="text-sm text-gray-400">{reward.subtitle}</p>

            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1 pt-2">
              {reward.points.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </main>
  );
}
