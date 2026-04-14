"use client";

import { useState } from "react";

const completedFeatures = [];

export default function RoadmapPage() {
  const [featureRoadmap, setFeatureRoadmap] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");

  const handleAddFeature = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newFeature = {
      id: Date.now(),
      title: newTitle,
      subtitle: newSubtitle,
      points: []
    };

    setFeatureRoadmap([...featureRoadmap, newFeature]);
    setNewTitle("");
    setNewSubtitle("");
  };

  return (
    <main className="min-h-screen bg-black text-white p-8 space-y-12 max-w-4xl mx-auto">
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Your Roadmap</h1>
          <p className="text-gray-400 text-sm">
            Add your own planned features and goals.
          </p>
        </div>

        {/* Add Feature Form */}
        <form onSubmit={handleAddFeature} className="space-y-4 bg-white/[0.02] border border-white/10 rounded-lg p-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Feature Title</label>
            <input 
              type="text" 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Dark Mode Theme"
              className="w-full bg-black border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:border-neon-green text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Description (Optional)</label>
            <input 
              type="text" 
              value={newSubtitle}
              onChange={(e) => setNewSubtitle(e.target.value)}
              placeholder="e.g. Implement a dark theme for better night viewing"
              className="w-full bg-black border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:border-neon-green text-sm"
            />
          </div>
          <button 
            type="submit"
            className="bg-neon-green text-black font-semibold px-4 py-2 rounded-md hover:bg-[#66ff66] transition-colors text-sm"
          >
            Add to Roadmap
          </button>
        </form>

        <div className="space-y-4 pt-4">
          {featureRoadmap.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No features added to roadmap yet.</p>
          ) : (
            featureRoadmap.map((feature) => (
              <article
                key={feature.id}
                className="border border-white/10 rounded-lg p-5 space-y-2 bg-white/[0.02]"
              >
                <h2 className="text-lg font-medium text-neon-green">{feature.title}</h2>
                <p className="text-sm text-gray-400">{feature.subtitle}</p>

                {feature.points && feature.points.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-gray-300 space-y-1 pt-2">
                    {feature.points.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))
          )}
        </div>
      </section>

      {completedFeatures.length > 0 && (
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
      )}
    </main>
  );
}
