# Spooky Candy Cloud Overview

Spooky Candy Cloud is a single-page experience for families to document Halloween candy adventures. The site blends family management tools, a candy logging workflow, and rich insights so parents can understand every trick-or-treat haul at a glance.

## Key sections

- **Hero** – Introduces the concept and provides quick actions to update the family home base or jump to the dashboard.
- **Feature previews** – Gives a card-based tour of every panel and action so stakeholders can explore capabilities without signing in.
- **Family HQ** – Summarizes family-wide metrics, tracks achievements, shows a candy color moodboard, and surfaces a nightly quest.
- **Kid Crew** – Lists all registered kids with their favorite costume, age, and collection summary. Cards link to the edit workflow.
- **Candy Vault** – Focuses on candy data entry and review. Each kid’s candy log can be edited with tasting notes and star ratings.
- **Insights** – Visualizes totals, top-rated candies, color distribution, neighborhood preferences, and the geographic map of collection locations.

## Feature highlights

- **Demo sign-in** simulates a Google authentication flow so the UI can be exercised without a Firebase project.
- **Persistent data** is stored in `localStorage` once a demo sign-in happens, allowing the same browser to pick up edits later.
- **Downloadable exports** provide both the raw family data and an insights snapshot as JSON for further analysis.
- **Accessibility-first design** ensures controls are labelled, navigation uses ARIA attributes, and chart/map sections include accessible descriptions.
- **Firebase ready** – All data structures align with Firestore documents so the frontend can be connected to a backend with minimal changes.
