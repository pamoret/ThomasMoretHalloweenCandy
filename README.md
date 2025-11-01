# Spooky Candy Cloud

Spooky Candy Cloud is a family-friendly Halloween dashboard where parents can manage kid profiles, log every candy discovery, and celebrate learning moments together. The experience now runs entirely in the browser with a built-in demo mode so you can explore the hub without configuring Firebase.

## Features

- **Family Candy HQ** – roster overview, sparkle score, quest board, and conversation starters for parents.
- **Kid management** – add/edit kid cards with costumes, birth years, and automatic summary stats.
- **Candy vault** – track pieces, ratings, and tasting notes per kid with rich filtering (star rating, year, type, search).
- **Smart limits & paywalls** – simulate $2 Kid Passes and candy vault upgrades, plus a yearly subscription toggle.
- **Neighborhood insights** – charts and tables (powered by Chart.js) that visualize favorite treats once the pass is active.
- **Local-first storage** – all data persists in `localStorage`, and a sample family is auto-seeded for demos and screenshots.

## Project structure

```
.
├── assets
│   ├── app.js                # Main application logic (local storage, UI, charts)
│   ├── firebase-config.js    # Optional: hook up a real Firebase project if desired
│   ├── hero-monsters.svg     # Hero illustration
│   ├── logo.svg              # App logo
│   └── styles.css            # Spooky interface styling
├── data
│   └── defaultCandyTypes.json # Seed data for candy catalog options
└── index.html                # Landing page and app shell
```

## Quick start

1. Install dependencies (none required!)
2. Serve the site locally using any static server, for example:

   ```bash
   python -m http.server 8000
   ```

3. Visit `http://localhost:8000/` in your browser. The demo account signs in automatically, and you can explore every module immediately.

## Optional Firebase integration

The previous Firebase-powered workflow is still achievable. To reconnect Firestore and Google Sign-In:

1. Update `assets/firebase-config.js` with your Firebase project keys.
2. Replace the local storage helpers in `assets/app.js` with Firebase SDK calls that match your data model.
3. Wire the upgrade buttons (`handleActivateSubscription`, `handleKidUpgradeConfirm`, `handleCandyUpgradeConfirm`) to Stripe or your billing provider.

## Customization ideas

- Add delete buttons for candy rows or kid cards when connecting to a backend.
- Extend the chart palette with seasonal color themes or kid-specific comparison modes.
- Sync the simulated paywall toggles with a production-ready subscription service.
- Export the family snapshot to a printable “Candy Chronicle” PDF for sharing with relatives.

Enjoy building a sweet, spooky experience! 🎃
