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
    <div className="w-full flex flex-col items-center gap-6 fade-in">
      <div
        className="glass rounded-2xl p-8 w-full max-w-2xl text-center shadow-glow transition-transform duration-500 [transform-style:preserve-3d]"
        aria-live="polite"
      >
        <div className="text-sm text-slate-300 mb-2">
          {askFor === 'capital' ? 'Pregunta: ¿Cuál es la capital?' : 'Pregunta: ¿A qué país pertenece esta capital?'}
        </div>
        <div className="text-3xl md:text-4xl font-semibold tracking-wide text-neon-blue">
          {question}
        </div>
        <button
          className="mt-6 px-4 py-2 rounded-lg bg-gradient-to-r from-neon-blue to-neon-purple text-black font-semibold hover:scale-105 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-neon-blue"
          onClick={() => setShowAnswer((s) => !s)}
          aria-label="Voltear tarjeta"
        >
          {showAnswer ? 'Ocultar respuesta' : 'Mostrar respuesta'}
        </button>
        {showAnswer && (
          <div className="mt-6 text-2xl md:text-3xl text-neon-green">
            {answer}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={goPrev}
          className="px-4 py-2 rounded-lg glass hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-neon-purple"
          aria-label="Anterior"
          title="Anterior"
        >
          ◀ Anterior
        </button>
        <div className="text-slate-400 text-sm">{index + 1} / {sequence.length}</div>
        <button
          onClick={goNext}
          className="px-4 py-2 rounded-lg glass hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-neon-purple"
          aria-label="Siguiente"
          title="Siguiente"
        >
          Siguiente ▶
        </button>
      </div>
    </div>
  );
} 