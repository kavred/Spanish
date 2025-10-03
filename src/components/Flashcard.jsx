import React, { useEffect, useMemo, useState } from 'react';
import data from '../data/countries.json';

function getShuffledArray(array) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function Flashcard() {
  const sequence = useMemo(() => getShuffledArray(data), []);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [askFor, setAskFor] = useState('capital'); // or 'country'

  useEffect(() => {
    // Randomize side on mount and whenever index changes
    setAskFor(Math.random() > 0.5 ? 'capital' : 'country');
    setShowAnswer(false);
  }, [index]);

  const item = sequence[index];
  const question = askFor === 'capital' ? item.country : item.capital;
  const answer = askFor === 'capital' ? item.capital : item.country;

  function goNext() {
    setIndex((prev) => (prev + 1) % sequence.length);
  }

  function goPrev() {
    setIndex((prev) => (prev - 1 + sequence.length) % sequence.length);
  }

  return (
    <div className="w-full flex flex-col items-center gap-[2vh] fade-in">
      <div
        className="glass rounded-2xl p-[clamp(1rem,4vw,2rem)] w-full max-w-[90vw] text-center shadow-glow transition-transform duration-500 [transform-style:preserve-3d]"
        aria-live="polite"
      >
        <div className="text-[clamp(0.875rem,2.5vw,1rem)] text-slate-300 mb-2">
          {askFor === 'capital' ? 'Question: What is the capital?' : 'Question: Which country does this capital belong to?'}
        </div>
        <div className="text-[clamp(1.5rem,6vw,2.5rem)] font-semibold tracking-wide text-neon-blue">
          {question}
        </div>
        <button
          className="mt-[1.5vh] px-[clamp(1rem,3vw,1rem)] py-[clamp(0.5rem,2vw,0.5rem)] rounded-lg bg-gradient-to-r from-neon-blue to-neon-purple text-black font-semibold hover:scale-105 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-neon-blue"
          onClick={() => setShowAnswer((s) => !s)}
          aria-label="Flip card"
        >
          {showAnswer ? 'Hide answer' : 'Show answer'}
        </button>
        {showAnswer && (
          <div className="mt-[1.5vh] text-[clamp(1.25rem,4vw,1.875rem)] text-neon-green">
            {answer}
          </div>
        )}
      </div>

      <div className="flex items-center gap-[0.75vw]">
        <button
          onClick={goPrev}
          className="px-[clamp(1rem,3vw,1rem)] py-[clamp(0.5rem,2vw,0.5rem)] rounded-lg glass hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-neon-purple"
          aria-label="Previous"
          title="Previous"
        >
          ◀ Previous
        </button>
        <div className="text-slate-400 text-[clamp(0.875rem,2.5vw,1rem)]">{index + 1} / {sequence.length}</div>
        <button
          onClick={goNext}
          className="px-[clamp(1rem,3vw,1rem)] py-[clamp(0.5rem,2vw,0.5rem)] rounded-lg glass hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-neon-purple"
          aria-label="Next"
          title="Next"
        >
          Next ▶
        </button>
      </div>
    </div>
  );
} 