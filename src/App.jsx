import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import data from './data/countries.json';

const Flashcard = lazy(() => import('./components/Flashcard.jsx'));
const Quiz = lazy(() => import('./components/Quiz.jsx'));
const ProgressTracker = lazy(() => import('./components/ProgressTracker.jsx'));

function generateWorksheetPdf(withAnswers = false) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 48;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  const title = withAnswers ? 'Answer Key: Countries and Capitals' : 'Worksheet: Countries and Capitals';

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

  if (withAnswers) {
    y += pairs.length * 18 + 28;
    doc.setFontSize(14);
    doc.text('Answer Key:', margin, y);
    doc.setFontSize(12);
    y += 16;
    pairs.forEach((p, idx) => {
      const letter = String.fromCharCode(65 + right.findIndex((r) => r.endsWith(p.capital)));
      doc.text(`${idx + 1} → ${letter}`, margin, y + idx * 16);
    });
  }

  const filename = withAnswers ? 'answer_key_countries_capitals.pdf' : 'worksheet_countries_capitals.pdf';
  doc.save(filename);
}

export default function App() {
  const [view, setView] = useState('flashcards');

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const NavButton = ({ id, children, aria }) => (
    <button
      onClick={() => setView(id)}
      className={[
        'px-4 py-2 rounded-lg glass hover:bg-white/10 transition-colors focus:outline-none focus:ring-2',
        view === id ? 'ring-neon-blue' : 'ring-transparent',
      ].join(' ')}
      aria-label={aria}
      title={aria}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen px-4 py-8 flex flex-col items-center">
      <header className="w-full max-w-5xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-2xl md:text-3xl font-bold tracking-wide">
          <span className="text-neon-blue">Countries</span> <span className="text-neon-purple">&</span> <span className="text-neon-green">Capitals</span>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          <NavButton id="flashcards" aria="Flashcards">Flashcards</NavButton>
          <NavButton id="quiz" aria="Quiz">Quiz</NavButton>
          <NavButton id="progress" aria="Progress">Progress</NavButton>
          <button
            onClick={() => generateWorksheetPdf(false)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-neon-green to-neon-blue text-black font-semibold hover:scale-105 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-neon-green"
            aria-label="Download worksheet"
            title="Download worksheet (PDF)"
          >
            Download Worksheet (PDF)
          </button>
          <button
            onClick={() => generateWorksheetPdf(true)}
            className="px-4 py-2 rounded-lg glass hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-neon-purple"
            aria-label="Download answer key"
            title="Download answer key (PDF)"
          >
            Answer Key (PDF)
          </button>
        </nav>
      </header>

      <main className="mt-10 w-full flex-1 flex items-start justify-center">
        <Suspense fallback={<div className="text-slate-300">Loading…</div>}>
          {view === 'flashcards' && <Flashcard />}
          {view === 'quiz' && <Quiz />}
          {view === 'progress' && <ProgressTracker />}
        </Suspense>
      </main>

      <footer className="mt-10 text-xs text-slate-500">&copy; {new Date().getFullYear()} Interactive Learning</footer>
    </div>
  );
} 