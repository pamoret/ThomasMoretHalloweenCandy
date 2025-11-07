# Function Reference

The site logic lives in `assets/main.js`. Functions are organized by responsibility to keep the single-page experience maintainable.

## Data lifecycle

| Function | Purpose |
| --- | --- |
| `loadPersistedState()` | Reads any previously stored family data from `localStorage`. |
| `persistState()` | Writes the current signed-in family profile and kid list back to `localStorage` after edits. |
| `hydrateState(baseData, persisted)` | Combines the seed JSON from `data/candy.json` with locally saved updates so the UI always starts with a coherent dataset. |
| `normaliseKid(rawKid)` | Ensures each kid has consistent IDs and flattened candy entries for charts and tables. |
| `createId(prefix)` | Generates deterministic IDs that work both offline and when synced to Firestore. |
| `ensureCollectionForYear(kid, year)` | Returns the candy collection for a specific year, creating it if it does not exist. |

## Rendering helpers

| Function | Purpose |
| --- | --- |
| `showPanel(panelKey)` | Switches visible panels when navigation pills are clicked. |
| `updateAllFamilyViews()` | Central orchestrator that refreshes every widget when data changes. |
| `updateFamilySummary()` | Computes headline metrics (kid count, total pieces, unique candy). |
| `updateSpotlightKid()` | Picks a random kid for the spotlight card and surfaces their stats. |
| `updateLeaderboard()` | Sorts kids by total candy collected and renders the leaderboard. |
| `updateAchievements()` | Generates achievement badges based on milestones. |
| `updateLearningPrompts()` | Populates the activity prompts list. |
| `updateStarMeter()` | Converts the average star rating into a progress bar. |
| `updateTimeline()` | Builds a chronological trail of candy collection events. |
| `updateMoodboard()` | Creates the color swatch grid derived from candy colors. |
| `updateKidCards()` | Renders the cards used in the kid management panel. |
| `updateCandyTable()` | Populates the candy vault table for the selected kid. |
| `updateTotalTreats()` / `updateZipInsights()` | Refresh high-level stats for the insights panel. |

## Interactions and dialogs

| Function | Purpose |
| --- | --- |
| `simulateSignIn()` / `signOut()` | Provide the demo authentication experience. |
| `openKidEditor(kidId)` / `upsertKid(kidData)` | Handle the kid dialog workflow for creating and editing profiles. |
| `openCandyEditor(kidId, candyId)` / `upsertCandy(kidId, candyData)` | Manage candy entry creation and updates. |
| `renderRatingButtons()` | Builds the interactive emoji-based star selector. |
| `handleZipUpdate(event)` | Saves the family zip code and refreshes related insights. |

## Visualizations & exports

| Function | Purpose |
| --- | --- |
| `prepareCharts()` / `updateCharts()` | Configure and refresh the Chart.js visualizations for favorites and candy colors. |
| `initializeMap()` / `updateMap()` | Manage the Leaflet map lifecycle and markers. |
| `downloadFamilyData()` | Exports the current family state as JSON. |
| `downloadInsights()` | Exports a generated insights snapshot for reporting. |

Each function is pure where possible so it can be migrated into modular code or unit tests as the project scales.
