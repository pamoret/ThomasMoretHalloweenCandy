# Spooky Candy Cloud

Spooky Candy Cloud is a Firebase-powered Halloween dashboard that helps families track
and rate every treat from their trick-or-treating adventures. The application uses
Firebase Authentication, Firestore, and Hosting so it can be previewed locally and
deployed with a single command when production-ready.

---

## 1. Tech stack

- **Frontend:** Vanilla HTML/CSS/JS with Chart.js for visualizations
- **Backend services:** Firebase Authentication, Firestore, Firebase Hosting
- **Tooling:** Node.js (for the Firebase CLI), Firebase Emulator Suite for local testing

---

## 2. Repository layout

```
.
├── assets
│   ├── app.js                # Main application logic (Firebase integration & UI rendering)
│   ├── firebase-config.js    # Project-specific Firebase configuration (update before running)
│   ├── hero-monsters.svg     # Hero illustration used on the landing page
│   ├── logo.svg              # Application logo
│   └── styles.css            # Main stylesheet
├── data
│   └── defaultCandyTypes.json # Default candy catalog seeded for each new family
└── index.html                # App shell and modal/dialog markup
```

---

## 3. Prerequisites

Install these dependencies before attempting to run or deploy the project:

| Tool | Version | Purpose |
| ---- | ------- | ------- |
| [Node.js](https://nodejs.org/) | 18 LTS or newer | Required for the Firebase CLI |
| [npm](https://www.npmjs.com/) | 9+ (bundled with Node) | Used to install Firebase CLI |
| [Firebase CLI](https://firebase.google.com/docs/cli) | 13+ | Local emulation & deployments |
| Modern browser | Latest Chrome/Firefox/Safari | Testing the app locally |

The repository contains only static assets, so no additional package installation is
required beyond the CLI tools listed above.

---

## 4. Firebase project configuration

1. **Create or select a Firebase project.**
2. **Enable products:**
   - Authentication → Sign-in method → enable **Google**.
   - Firestore Database → create a database in **Native mode**.
3. **Add a Web App** inside Project Settings → General → *Your apps* to generate the
   Firebase configuration snippet.
4. **Update `assets/firebase-config.js`:** Replace every `YOUR_FIREBASE_*` placeholder
   with the values from the snippet. The app performs a runtime assertion and will refuse
   to load if any placeholder remains, ensuring configuration mistakes are caught early.

---

## 5. Local development workflow

```bash
# Install the Firebase CLI (once per machine)
npm install -g firebase-tools

# Authenticate with Google (opens a browser window)
firebase login

# Configure the project directory to use your Firebase project
firebase use --add
# Select the Firebase project you prepared earlier and give it an alias (e.g. "prod").

# Initialize Firebase Hosting configuration (only on first run)
firebase init hosting
# Recommended prompts:
# - Use existing project → pick the alias created above
# - Public directory → .
# - Configure as a single-page app → yes
# - Set up automatic builds and deploys with GitHub → optional now, can be configured later

# Start the local emulators for Hosting + Firestore
firebase emulators:start
```

The CLI prints a local URL (typically `http://127.0.0.1:5000`). Visit that address in a
browser to interact with the app. Sign in with Google to trigger automatic seeding of the
default candy catalog and Firestore collections for your account.

> **Tip:** If you only need a static preview without Firebase features, you can run
> `python -m http.server 8080` (or any static server) and open `http://localhost:8080`,
> but authentication and Firestore-powered insights will be disabled.

---

## 6. Verifying configuration

1. Sign in with Google via the local emulator.
2. Upon first sign-in, the app prompts for a zip code, seeds candy catalog data, and
   creates initial Firestore documents. Open the Firestore tab in the Emulator UI to
   confirm the following collections exist:
   - `users/{uid}` with profile, subscription, and zip code fields.
   - `users/{uid}/kids` empty collection (add kids through the UI to populate).
   - `users/{uid}/catalog` seeded with entries from `defaultCandyTypes.json`.
3. Add a kid and log a few candy entries. Confirm that the dashboard updates and that
   the `zipStats/{zip}/contributors/{uid}` document reflects aggregated counts.
4. Click **Activate my pass** to ensure subscription state updates and premium insights
   unlock as expected.

---

## 7. Production deployment

### Manual deploy

```bash
# Make sure you are authenticated and targeting the correct project
firebase deploy --only hosting
```

This uploads the static assets in the repository to Firebase Hosting. The command output
includes the live URL once the deployment finishes.

### GitHub Actions automation

1. In the Firebase console open **Hosting → GitHub integration**.
2. Connect your GitHub repository and choose the branch you want to deploy from (e.g.
   `main`).
3. Firebase creates a workflow file in `.github/workflows/` that runs `firebase deploy`
   whenever commits land on the selected branch. Review and commit the generated workflow
   to enable continuous deployment.

---

## 8. Firestore data model reference

```
users/{uid}
  displayName
  email
  photoURL
  zipCode
  subscriptionStatus ('active' | 'expired' | 'past_due')
  subscriptionExpiry (timestamp)
  createdAt (timestamp)
  lastLoginAt (timestamp)
  lastPaymentAt (timestamp)

users/{uid}/catalog/{candyId}
  name, emoji, colorHex, colorName, description, defaultRating, createdAt

users/{uid}/kids/{kidId}
  name, favoriteCostume, birthYear, createdAt, updatedAt

users/{uid}/kids/{kidId}/candies/{logId}
  catalogId, displayName, type, count, rating, notes,
  colorHex, colorName, emoji, collectedYear, createdAt, updatedAt

zipStats/{zip}/contributors/{uid}
  candyCounts (map of candy name -> total pieces)
  totalPieces
  updatedAt
```

---

## 9. Subscription & billing integration notes

- The **Activate my pass** button currently updates Firestore directly to mark the
  subscription as active for one year. Replace `handleActivateSubscription()` in
  `assets/app.js` with your billing provider's webhook or checkout flow.
- After integrating billing, tighten Firestore security rules to limit analytics access
  to active subscribers only.

---

## 10. Next steps & customization ideas

- Add social sharing for each kid's candy recap.
- Use Firebase Functions + scheduled exports to BigQuery for richer neighborhood trends.
- Introduce tiered subscriptions or badges for families that explore new neighborhoods.

Enjoy building a sweet, spooky experience! 🎃
