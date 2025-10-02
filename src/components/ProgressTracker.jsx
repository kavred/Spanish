import React, { useEffect, useState } from 'react';
import data from '../data/countries.json';

function loadProgress() {
  try {
    const raw = localStorage.getItem('progress');
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function getPercent(correct, attempts) {
  if (attempts === 0) return 0;
  return Math.round((correct / attempts) * 100);
}

export default function ProgressTracker() {
  const [progress, setProgress] = useState({});

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  return (
    <div className="w-full max-w-3xl glass rounded-2xl p-6 fade-in">
      <div className="text-2xl font-semibold text-neon-blue mb-4">Progress by Country</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.map(({ country }) => {
          const stats = progress[country] || { attempts: 0, correct: 0 };
          const pct = getPercent(stats.correct, stats.attempts);
          return (
            <div key={country} className="p-4 rounded-xl glass">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{country}</div>
                <div className={pct >= 70 ? 'text-green-400' : pct >= 40 ? 'text-yellow-300' : 'text-red-400'}>
                  {pct}% mastered
                </div>
              </div>
              <div className="mt-2 w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-neon-blue to-neon-green" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-1 text-xs text-slate-400">{stats.correct} correct out of {stats.attempts} attempts</div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => { localStorage.removeItem('progress'); setProgress({}); }}
          className="px-4 py-2 rounded-lg glass hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-neon-purple"
          aria-label="Reset progress"
        >
          Reset Progress
        </button>
      </div>
    </div>
  );
} 