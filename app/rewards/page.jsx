import NeonBackground from "../../components/NeonBackground";

export default function HomePage() {
  return (
    <main className="min-h-screen text-white p-8">
      <NeonBackground />

      <h1 className="text-4xl font-bold text-neon-green">
        JustNeedMotivation
      </h1>

      <p className="mt-4 text-gray-400">
        Track your learning. Stay consistent. Beat pressure.
      </p>
    </main>
  );
}
