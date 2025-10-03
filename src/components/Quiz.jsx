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
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(null);
  const [progress, setProgress] = useState(loadProgress());
  const [askFor, setAskFor] = useState('capital');
  const [showCompletion, setShowCompletion] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState([]);

  // Filter questions based on mastery (70% threshold)
  const availableQuestions = useMemo(() => {
    return data.filter(item => {
      const stats = progress[item.country] || { attempts: 0, correct: 0 };
      const mastery = stats.attempts === 0 ? 0 : (stats.correct / stats.attempts) * 100;
      return mastery < 70; // Only include questions below 70% mastery
    });
  }, [progress]);

  // Initialize questions when component mounts or progress changes
  useEffect(() => {
    if (availableQuestions.length === 0) {
      setShowCompletion(true);
    } else {
      setCurrentQuestions(shuffle([...availableQuestions]));
      setIndex(0);
      setCorrectCount(0);
      setAnswered(false);
      setSelected(null);
    }
  }, [availableQuestions]);

  // Check if we need to refresh questions after each answer
  useEffect(() => {
    const updatedAvailableQuestions = data.filter(item => {
      const stats = progress[item.country] || { attempts: 0, correct: 0 };
      const mastery = stats.attempts === 0 ? 0 : (stats.correct / stats.attempts) * 100;
      return mastery < 70;
    });
    
    if (updatedAvailableQuestions.length === 0) {
      setShowCompletion(true);
    } else if (updatedAvailableQuestions.length !== availableQuestions.length) {
      // Refresh questions if some have been mastered
      setCurrentQuestions(shuffle([...updatedAvailableQuestions]));
      setIndex(0);
    }
  }, [progress, availableQuestions.length]);

  const questions = currentQuestions;

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
    
    // If we've reached the end of current questions, reshuffle and start over
    if (index + 1 >= questions.length) {
      setCurrentQuestions(shuffle([...availableQuestions]));
      setIndex(0);
    } else {
      setIndex((i) => i + 1);
    }
  }

  function retry() {
    window.location.reload();
  }

  function handleResetProgress() {
    if (window.confirm('Are you sure you want to reset your progress? This will clear all your mastery data.')) {
      localStorage.removeItem('progress');
      window.location.reload();
    }
  }

  function handleViewResults() {
    // Navigate to progress view - this would need to be handled by parent component
    window.location.hash = '#progress';
    window.location.reload();
  }

  if (showCompletion) {
    return (
      <div className="w-full max-w-[90vw] glass rounded-2xl p-[clamp(1rem,4vw,2rem)] text-center fade-in">
        <div className="text-[clamp(1.5rem,5vw,2rem)] font-semibold text-neon-green mb-[1vh]">🎉 Congratulations!</div>
        <div className="text-[clamp(1rem,3vw,1.25rem)] mb-[1.5vh]">You have mastered all countries and capitals!</div>
        <div className="text-[clamp(0.875rem,2.5vw,1.125rem)] mb-[2vh]">You have achieved 70%+ accuracy on all questions.</div>
        <div className="flex flex-col sm:flex-row gap-[1vw] justify-center">
          <button
            onClick={handleResetProgress}
            className="px-[clamp(1rem,3vw,1.5rem)] py-[clamp(0.5rem,2vw,0.75rem)] rounded-lg bg-gradient-to-r from-neon-blue to-neon-purple text-black font-semibold hover:scale-105 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-neon-blue"
            aria-label="Reset progress and play again"
          >
            Play Again
          </button>
          <button
            onClick={handleViewResults}
            className="px-[clamp(1rem,3vw,1.5rem)] py-[clamp(0.5rem,2vw,0.75rem)] rounded-lg glass hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-neon-green"
            aria-label="View your results"
          >
            View Results
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="w-full max-w-[90vw] glass rounded-2xl p-[clamp(1rem,4vw,2rem)] fade-in">
      <div className="text-[clamp(0.875rem,2.5vw,1rem)] text-slate-300 mb-[0.5vh]">
        {askFor === 'capital' ? 'Select the correct capital for:' : 'Select the correct country for:'}
      </div>
      <div className="text-[clamp(1.25rem,4vw,1.875rem)] font-semibold text-neon-green">{askFor === 'capital' ? current.country : current.capital}</div>

      <div className="mt-[1.5vh] grid grid-cols-1 sm:grid-cols-2 gap-[0.75vw]">
        {options.map((opt) => {
          const isCorrect = answered && opt === correctAnswer;
          const isIncorrect = answered && opt === selected && opt !== correctAnswer;
          return (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              className={[
                'px-[clamp(0.75rem,2vw,1rem)] py-[clamp(0.5rem,1.5vw,0.75rem)] rounded-xl text-left glass transition transform hover:scale-[1.01] focus:outline-none focus:ring-2',
                isCorrect ? 'bg-green-500/20 ring-green-400' : '',
                isIncorrect ? 'bg-red-500/20 ring-red-400' : '',
              ].join(' ')}
              aria-label={`Option ${opt}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

        {answered && (
          <div className="mt-[1vh] text-[clamp(0.875rem,2.5vw,1rem)]">
            {selected === correctAnswer ? (
              <span className="text-green-400">Correct!</span>
            ) : (
              <span className="text-red-400">Incorrect, the answer is {correctAnswer}.</span>
            )}
          </div>
        )}

        <div className="mt-[1.5vh] flex items-center justify-between">
          <div className="text-slate-400 text-[clamp(0.875rem,2.5vw,1rem)]">
            Questions remaining: {availableQuestions.length}
          </div>
          <button
            onClick={nextQuestion}
            disabled={!answered}
            className="px-[clamp(1rem,3vw,1rem)] py-[clamp(0.5rem,2vw,0.5rem)] rounded-lg bg-gradient-to-r from-neon-blue to-neon-purple text-black font-semibold disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-neon-purple"
            aria-label="Next question"
          >
            Next
          </button>
        </div>
    </div>
  );
} 