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
    <div className="w-full max-w-[90vw] glass rounded-2xl p-[clamp(1rem,3vw,1.5rem)] fade-in">
      <div className="text-[clamp(1.25rem,4vw,1.5rem)] font-semibold text-neon-blue mb-[1vh]">Progress by Country</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1vw]">
        {data.map(({ country }) => {
          const stats = progress[country] || { attempts: 0, correct: 0 };
          const pct = getPercent(stats.correct, stats.attempts);
          return (
            <div key={country} className="p-[clamp(0.75rem,2vw,1rem)] rounded-xl glass">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-[clamp(0.875rem,2.5vw,1rem)]">{country}</div>
                <div className={`text-[clamp(0.75rem,2vw,0.875rem)] ${pct >= 70 ? 'text-green-400' : pct >= 40 ? 'text-yellow-300' : 'text-red-400'}`}>
                  {pct}% mastered
                </div>
              </div>
              <div className="mt-[0.5vh] w-full bg-white/10 rounded-full h-[0.5vh] overflow-hidden">
                <div className="h-[0.5vh] bg-gradient-to-r from-neon-blue to-neon-green" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-[0.25vh] text-[clamp(0.75rem,2vw,0.75rem)] text-slate-400">{stats.correct} correct out of {stats.attempts} attempts</div>
            </div>
          );
        })}
      </div>
      <div className="mt-[1.5vh] flex gap-[0.75vw]">
        <button
          onClick={() => {
            if (window.confirm('Are you sure you would like to reset your progress? This action cannot be undone.')) {
              localStorage.removeItem('progress');
              setProgress({});
            }
          }}
          className="px-[clamp(1rem,3vw,1rem)] py-[clamp(0.5rem,2vw,0.5rem)] rounded-lg glass hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-neon-purple"
          aria-label="Reset progress"
        >
          Reset Progress
        </button>
      </div>
    </div>
  );
} 