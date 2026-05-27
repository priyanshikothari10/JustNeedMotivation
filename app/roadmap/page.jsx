"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

export default function RoadmapPage() {
  const { isAuthenticated, user, syncData, loading } = useAuth();
  const [featureRoadmap, setFeatureRoadmap] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const isInitialLoad = useRef(true);

  // 1. Initial State Loading
  useEffect(() => {
    if (loading) return;

    if (isAuthenticated && user) {
      setFeatureRoadmap(user.roadmap || []);
    } else {
      try {
        const raw = localStorage.getItem("jnm:roadmap");
        if (raw) setFeatureRoadmap(JSON.parse(raw));
      } catch (e) {}
    }
    isInitialLoad.current = false;
  }, [isAuthenticated, user, loading]);

  // 2. Data Sync
  const syncRoadmap = (nextRoadmap) => {
    setFeatureRoadmap(nextRoadmap);
    if (isAuthenticated) {
      syncData({ roadmap: nextRoadmap });
    } else {
      try {
        localStorage.setItem("jnm:roadmap", JSON.stringify(nextRoadmap));
      } catch (e) {}
    }
  };

  const handleAddFeature = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newFeature = {
      id: Date.now(),
      title: newTitle.trim(),
      subtitle: newSubtitle.trim(),
      points: [],
      status: "pending",
      progress: 0
    };

    const nextRoadmap = [...featureRoadmap, newFeature];
    syncRoadmap(nextRoadmap);
    setNewTitle("");
    setNewSubtitle("");
  };

  const handleProgressChange = (id, nextProgress) => {
    const parsedProgress = Math.min(100, Math.max(0, parseInt(nextProgress) || 0));
    const nextRoadmap = featureRoadmap.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          progress: parsedProgress,
          status: parsedProgress === 100 ? "completed" : "pending"
        };
      }
      return item;
    });
    syncRoadmap(nextRoadmap);
  };

  const handleDeleteFeature = (id) => {
    const nextRoadmap = featureRoadmap.filter((item) => item.id !== id);
    syncRoadmap(nextRoadmap);
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8 space-y-12 max-w-4xl mx-auto">
      {/* Unauthenticated Sync Banner */}
      {!loading && !isAuthenticated && (
        <div className="p-4 rounded-xl border border-neon-blue/30 bg-neon-blue/5 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm shadow-[0_0_20px_rgba(0,212,255,0.05)]">
          <div>
            <h3 className="text-sm font-semibold text-white">Cloud Sync Offline</h3>
            <p className="text-xs text-gray-400 mt-1">
              Log in to sync your custom roadmap goals and track progress across all your devices!
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href="/login" className="px-3 py-1.5 rounded-md text-xs font-semibold bg-neon-blue text-black hover:brightness-110 transition">
              Log In
            </Link>
          </div>
        </div>
      )}

      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Your Roadmap & Goals</h1>
          <p className="text-gray-400 text-sm">
            Add custom milestones, set target completions, and track progress using the dynamic progress bar.
          </p>
        </div>

        {/* Add Feature Form */}
        <form onSubmit={handleAddFeature} className="space-y-4 bg-white/[0.02] border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">New Goal Milestone</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Goal / Feature Title</label>
              <input 
                type="text" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Master React Hooks"
                className="w-full bg-black border border-white/10 rounded-md px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Description (Optional)</label>
              <input 
                type="text" 
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                placeholder="e.g. Complete custom hook assignments and build 3 demos"
                className="w-full bg-black border border-white/10 rounded-md px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green text-sm"
              />
            </div>
          </div>
          <button 
            type="submit"
            className="bg-neon-green text-black font-semibold px-4 py-2 rounded-md hover:bg-[#66ff66] transition-colors text-sm shadow-[0_0_15px_rgba(57,255,20,0.15)]"
          >
            Add Goal
          </button>
        </form>

        <div className="space-y-4 pt-4">
          {featureRoadmap.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No custom goals added yet. Add one above!</p>
          ) : (
            featureRoadmap.map((feature) => (
              <article
                key={feature.id}
                className="border border-white/10 rounded-xl p-5 space-y-4 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-neon-green">{feature.title}</h2>
                    {feature.subtitle && <p className="text-sm text-gray-400 mt-1">{feature.subtitle}</p>}
                  </div>
                  <button 
                    onClick={() => handleDeleteFeature(feature.id)}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>

                {/* Dynamic Goal Progress Tracking */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Goal Progress</span>
                    <span className="font-semibold text-neon-green">{feature.progress}%</span>
                  </div>

                  {/* Range Slider for custom progress */}
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={feature.progress || 0}
                      onChange={(e) => handleProgressChange(feature.id, e.target.value)}
                      className="flex-1 accent-neon-green bg-gray-800 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Dynamic Neon Progress Bar */}
                  <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden relative border border-white/5">
                    <div 
                      className="bg-gradient-to-r from-neon-green to-emerald-400 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(57,255,20,0.4)]"
                      style={{ width: `${feature.progress || 0}%` }}
                    />
                  </div>
                </div>

                {feature.progress === 100 && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-neon-green/10 text-neon-green uppercase tracking-wider border border-neon-green/20">
                    Completed 🏆
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
