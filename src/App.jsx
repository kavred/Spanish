import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import data from './data/countries.json';

const Flashcard = lazy(() => import('./components/Flashcard.jsx'));
const Quiz = lazy(() => import('./components/Quiz.jsx'));
const ProgressTracker = lazy(() => import('./components/ProgressTracker.jsx'));

function generateWorksheetPdf() {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 48;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  const title = 'Worksheet: Countries and Capitals';

  doc.setFont('times', 'normal');
  doc.setFontSize(20);
  doc.text(title, margin, margin);
  doc.setFontSize(12);

  const pairs = [...data];
  // Shuffle for worksheet
  for (let i = pairs.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  const left = pairs.map((p, idx) => `${idx + 1}. ${p.country}`);
  const right = pairs
    .map((p, idx) => `${String.fromCharCode(65 + idx)}. ${p.capital}`)
    .sort(() => Math.random() - 0.5);

  let y = margin + 28;
  doc.text('Match each country with its corresponding capital.', margin, y);
  y += 20;

  const colWidth = width / 2 - 12;
  for (let i = 0; i < pairs.length; i += 1) {
    const rowY = y + i * 18;
    const l = left[i];
    const r = right[i];
    doc.text(l, margin, rowY);
    doc.text(r, margin + colWidth + 24, rowY);
  }

  const filename = 'worksheet_countries_capitals.pdf';
  doc.save(filename);
}

function generateStatsPdf() {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 48;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  
  // Load progress data
  const progress = JSON.parse(localStorage.getItem('progress') || '{}');
  
  doc.setFont('times', 'normal');
  doc.setFontSize(20);
  doc.text('Learning Statistics Report', margin, margin);
  doc.setFontSize(12);
  
  let y = margin + 40;
  
  // Overall stats
  const totalAttempts = Object.values(progress).reduce((sum, stats) => sum + stats.attempts, 0);
  const totalCorrect = Object.values(progress).reduce((sum, stats) => sum + stats.correct, 0);
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  
  doc.setFontSize(14);
  doc.text('Overall Performance', margin, y);
  doc.setFontSize(12);
  y += 20;
  doc.text(`Total Questions Answered: ${totalAttempts}`, margin, y);
  y += 16;
  doc.text(`Total Correct: ${totalCorrect}`, margin, y);
  y += 16;
  doc.text(`Overall Accuracy: ${overallAccuracy}%`, margin, y);
  y += 30;
  
  // Most missed countries
  const countryStats = data.map(country => {
    const stats = progress[country.country] || { attempts: 0, correct: 0 };
    const accuracy = stats.attempts > 0 ? (stats.correct / stats.attempts) * 100 : 0;
    const missed = stats.attempts - stats.correct;
    return {
      ...country,
      accuracy,
      missed,
      attempts: stats.attempts
    };
  }).sort((a, b) => b.missed - a.missed);
  
  doc.setFontSize(14);
  doc.text('Most Challenging Countries', margin, y);
  doc.setFontSize(12);
  y += 20;
  
  const topMissed = countryStats.slice(0, 10);
  topMissed.forEach((country, idx) => {
    if (country.attempts > 0) {
      doc.text(`${idx + 1}. ${country.country} - ${country.capital}`, margin, y);
      y += 16;
      doc.text(`  Missed: ${country.missed} times, Accuracy: ${Math.round(country.accuracy)}%`, margin + 20, y);
      y += 16;
    }
  });
  
  y += 20;
  
  // Mastery levels
  const mastered = countryStats.filter(c => c.accuracy >= 70).length;
  const learning = countryStats.filter(c => c.accuracy > 0 && c.accuracy < 70).length;
  const notStarted = countryStats.filter(c => c.attempts === 0).length;
  
  doc.setFontSize(14);
  doc.text('Mastery Levels', margin, y);
  doc.setFontSize(12);
  y += 20;
  doc.text(`Mastered (70%+): ${mastered} countries`, margin, y);
  y += 16;
  doc.text(`Learning (0-69%): ${learning} countries`, margin, y);
  y += 16;
  doc.text(`Not Started: ${notStarted} countries`, margin, y);
  
  const filename = `learning_stats_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

export default function App() {
  const [view, setView] = useState('flashcards');

  // Handle hash navigation
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash === 'progress') {
      setView('progress');
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const NavButton = ({ id, children, aria }) => (
    <button
      onClick={() => setView(id)}
      className={[
        'px-[clamp(0.75rem,2vw,1rem)] py-[clamp(0.5rem,1.5vw,0.5rem)] rounded-lg glass hover:bg-white/10 transition-colors focus:outline-none focus:ring-2',
        view === id ? 'ring-neon-blue' : 'ring-transparent',
      ].join(' ')}
      aria-label={aria}
      title={aria}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen px-[2vw] py-[2vh] flex flex-col items-center">
      <header className="w-full max-w-[90vw] flex flex-col md:flex-row md:items-center md:justify-between gap-[2vw]">
        <div className="text-[clamp(1.5rem,5vw,2.5rem)] font-bold tracking-wide">
          <span className="text-neon-blue">Countries</span> <span className="text-neon-purple">&</span> <span className="text-neon-green">Capitals</span>
        </div>
        <nav className="flex flex-wrap items-center gap-[0.5vw]">
          <NavButton id="flashcards" aria="Flashcards">Flashcards</NavButton>
          <NavButton id="quiz" aria="Quiz">Quiz</NavButton>
          <NavButton id="progress" aria="Progress">Progress</NavButton>
          <button
            onClick={() => generateWorksheetPdf()}
            className="px-[clamp(0.75rem,2vw,1rem)] py-[clamp(0.5rem,1.5vw,0.5rem)] rounded-lg bg-gradient-to-r from-neon-green to-neon-blue text-black font-semibold hover:scale-105 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-neon-green"
            aria-label="Download worksheet"
            title="Download worksheet (PDF)"
          >
            Download Worksheet (PDF)
          </button>
          <button
            onClick={() => generateStatsPdf()}
            className="px-[clamp(0.75rem,2vw,1rem)] py-[clamp(0.5rem,1.5vw,0.5rem)] rounded-lg glass hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-neon-purple"
            aria-label="Download stats"
            title="Download learning statistics (PDF)"
          >
            Download Stats (PDF)
          </button>
        </nav>
      </header>

      <main className="mt-[2vh] w-full flex-1 flex items-start justify-center">
        <Suspense fallback={<div className="text-slate-300">Loading…</div>}>
          {view === 'flashcards' && <Flashcard />}
          {view === 'quiz' && <Quiz />}
          {view === 'progress' && <ProgressTracker />}
        </Suspense>
      </main>

      <footer className="mt-[2vh] text-[clamp(0.75rem,2vw,0.875rem)] text-slate-500">&copy; {new Date().getFullYear()} Interactive Learning</footer>
    </div>
  );
} 