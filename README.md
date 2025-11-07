# Spooky Candy Cloud

Spooky Candy Cloud is a consolidated Halloween candy tracker that merges the best ideas from the previous experimental branches into one maintainable site. It provides family-level dashboards, kid management tools, candy logging, and a suite of insights powered by Chart.js and Leaflet.

## Getting started

1. Install dependencies (none required for the static build).
2. Launch a dev server: `python -m http.server 4173` and open `http://localhost:4173` in your browser.
3. Click **Sign in with Google** to load the demo experience. This populates the interface and enables data persistence via `localStorage`.

## Features

- Family HQ summary with achievements, quests, and a color moodboard.
- Kid profiles with editable costumes, ages, and candy summaries.
- Candy vault table for logging pieces, ratings, and tasting notes.
- Insights panel with totals, favorite candy analysis, color distribution, and a Leaflet-powered map of collection locations.
- JSON export buttons for raw data and insights snapshots.
- Firebase-ready data model and documented Firestore rules (see `docs/firebase-rules.md`).

## Project structure

```
.
├── assets/
│   ├── hero-monsters.svg
│   ├── logo.svg
│   ├── main.js
│   └── styles.css
├── data/
│   └── candy.json
├── docs/
│   ├── firebase-rules.md
│   ├── functions.md
│   └── overview.md
└── index.html
```

## Documentation

- `docs/overview.md` – Product and UX summary.
- `docs/functions.md` – Explanation of core JavaScript functions.
- `docs/firebase-rules.md` – Suggested Firestore collections and security rules for production.

## Contributing

1. Update `data/candy.json` with new seed data as required.
2. Extend `assets/main.js` with new UI behaviors and keep functions composable.
3. Run a local server to validate the experience before opening a pull request.

All previous branch directories have been removed so this repository reflects the single source of truth for the experience.
