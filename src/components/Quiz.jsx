import React, { useEffect, useMemo, useState } from 'react';
import data from '../data/countries.json';

function shuffle(array) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function loadProgress() {
  try {
    const raw = localStorage.getItem('progress');
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveProgress(p) {
  localStorage.setItem('progress', JSON.stringify(p));
}

export default function Quiz() {
  const questions = useMemo(() => shuffle(data).slice(0, 20), []);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(null);
  const [progress, setProgress] = useState(loadProgress());
  const [askFor, setAskFor] = useState('capital');

  useEffect(() => {
    setAskFor(Math.random() > 0.5 ? 'capital' : 'country');
  }, [index]);

  const current = questions[index];
  const correctAnswer = askFor === 'capital' ? current.capital : current.country;

  const options = useMemo(() => {
    const others = shuffle(
      data.filter((d) => (askFor === 'capital' ? d.capital !== correctAnswer : d.country !== correctAnswer))
    ).slice(0, 3);
    const pool = [
      correctAnswer,
      ...others.map((d) => (askFor === 'capital' ? d.capital : d.country)),
    ];
    return shuffle(pool);
  }, [current, askFor]);

  function handleAnswer(option) {
    if (answered) return;
    setSelected(option);
    const isCorrect = option === correctAnswer;
    setAnswered(true);
    if (isCorrect) setCorrectCount((c) => c + 1);

    // Update mastery per country key
    const countryKey = current.country;
    const stats = progress[countryKey] || { attempts: 0, correct: 0 };
    const nextStats = {
      attempts: stats.attempts + 1,
      correct: stats.correct + (isCorrect ? 1 : 0),
    };
    const nextProgress = { ...progress, [countryKey]: nextStats };
    setProgress(nextProgress);
    saveProgress(nextProgress);
  }

  function nextQuestion() {
    setAnswered(false);
    setSelected(null);
    setIndex((i) => i + 1);
  }

  function retry() {
    window.location.reload();
  }

  const done = index >= questions.length;

  if (done) {
    return (
      <div className="w-full max-w-2xl glass rounded-2xl p-8 text-center fade-in">
        <div className="text-3xl font-semibold text-neon-purple">Resultado final</div>
        <div className="mt-4 text-2xl">{correctCount} / {questions.length}</div>
        <button
          onClick={retry}
          className="mt-6 px-4 py-2 rounded-lg bg-gradient-to-r from-neon-blue to-neon-purple text-black font-semibold hover:scale-105 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-neon-blue"
          aria-label="Reintentar"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl glass rounded-2xl p-8 fade-in">
      <div className="text-sm text-slate-300 mb-2">
        {askFor === 'capital' ? 'Selecciona la capital correcta para:' : 'Selecciona el país correcto para:'}
      </div>
      <div className="text-2xl md:text-3xl font-semibold text-neon-green">{askFor === 'capital' ? current.country : current.capital}</div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => {
          const isCorrect = answered && opt === correctAnswer;
          const isIncorrect = answered && opt === selected && opt !== correctAnswer;
          return (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              className={[
                'px-4 py-3 rounded-xl text-left glass transition transform hover:scale-[1.01] focus:outline-none focus:ring-2',
                isCorrect ? 'bg-green-500/20 ring-green-400' : '',
                isIncorrect ? 'bg-red-500/20 ring-red-400' : '',
              ].join(' ')}
              aria-label={`Opción ${opt}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-4 text-sm">
          {selected === correctAnswer ? (
            <span className="text-green-400">¡Correcto!</span>
          ) : (
            <span className="text-red-400">Incorrecto, la respuesta es {correctAnswer}.</span>
          )}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <div className="text-slate-400">Pregunta {index + 1} / {questions.length}</div>
        <button
          onClick={nextQuestion}
          disabled={!answered}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-neon-blue to-neon-purple text-black font-semibold disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-neon-purple"
          aria-label="Siguiente pregunta"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
} 