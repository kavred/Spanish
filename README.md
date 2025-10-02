# Países y Capitales — SPA (React + Vite + Tailwind)

Single-page app for studying Spanish-speaking countries and their capitals. Includes flashcards, multiple-choice quiz with progress tracking in localStorage, and downloadable LaTeX-based PDF worksheet and answer key.

## Requirements
- Node.js 18+
- npm 9+
- For LaTeX PDFs: TeX Live (e.g., `texlive-full` recommended) and `latexmk`

## Setup
```bash
npm install
```

## Development
Run Tailwind in watch mode (in one terminal):
```bash
npm run css:watch
```
Run the dev server (in another terminal):
```bash
npm run dev
```
Open the app at the URL shown (default `http://localhost:5173`).

## Build for Production
```bash
# Build Tailwind (minified)
npm run css:build

# Build Vite
npm run build
```
Preview the production build locally:
```bash
npm run preview
```

You can deploy the `dist/` folder to any static host (Netlify, GitHub Pages, Vercel static, etc.).

## LaTeX Worksheets
Compile worksheet PDFs (requires TeX Live with pdflatex and latexmk):
```bash
npm run latex:build
```
This generates PDFs in the `worksheets/` directory. You can also download in-app generated PDFs using the header buttons (client-side `jsPDF`).

## Project Structure
```
public/
  index.html          # HTML template (loads public/output.css)
src/
  index.js            # React entry point
  App.jsx             # Root component & navigation
  components/
    Flashcard.jsx
    Quiz.jsx
    ProgressTracker.jsx
  data/
    countries.json
  styles/
    input.css         # Tailwind input
public/
  output.css          # Built Tailwind CSS (generated)
worksheets/
  worksheet.tex
  answerkey.tex
package.json
vite.config.js
postcss.config.js
tailwind.config.js
README.md
```

## Notes
- Progress is stored under `localStorage["progress"]` as per-country stats `{ attempts, correct }`.
- Special characters and accents are UTF-8; ensure your editor saves files as UTF-8.
- Accessibility: All interactive elements are keyboard focusable and have ARIA labels.
- No `<form>` elements are used; only buttons with `onClick` handlers. 