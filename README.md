# Spooky Candy Cloud

Spooky Candy Cloud is a Firebase-powered Halloween dashboard that lets families track
and rate candy collections for each kiddo. Sign in with Google, log candy hauls,
see neighborhood favorites by zip code, and manage annual subscriptions that unlock
advanced insights.

## Features

- Google Sign-In via Firebase Authentication
- Guided onboarding that captures the family's zip code
- Automatic seeding of a whimsical candy catalog for every new account
- Kid profiles with costumes, birth years, and total candy tracking
- Candy log with counts, tasting notes, and ⭐ ratings
- Zip code insights that surface the most popular treats locally
- Annual paywall toggle with placeholder billing hook for $3/year renewals
- Firebase-friendly structure that can be deployed to Firebase Hosting through GitHub Actions

## Project structure

```
.
├── assets
│   ├── app.js                # Main application logic (Firebase, UI, charts)
│   ├── firebase-config.js    # Placeholder config (update with your Firebase project)
│   ├── hero-monsters.svg     # Hero illustration
│   ├── logo.svg              # App logo
│   └── styles.css            # Spooky interface styling
├── data
│   └── defaultCandyTypes.json # Seed data for user candy catalogs
└── index.html                # Landing page and app shell
```

## Local setup

1. **Install the Firebase CLI** (needed for hosting deploys):

   ```bash
   npm install -g firebase-tools
   ```

2. **Create a Firebase project** (if you don’t already have one) and enable:

   - Authentication → Sign-in method → Google
   - Firestore Database (in Native mode)

3. **Update Firebase configuration**

   Copy the config snippet from **Project settings → General → Your apps** and paste
   it into `assets/firebase-config.js`.

4. **Serve locally**

   ```bash
   firebase login
   firebase init hosting
   # choose "Use an existing project" and select yours
   # set public directory to "." and configure as a single-page app (yes)
   firebase emulators:start
   ```

   Then open the provided localhost URL.

## Firestore data model

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
  name, emoji, colorHex, colorName, description, defaultRating

users/{uid}/kids/{kidId}
  name
  favoriteCostume
  birthYear
  createdAt
  updatedAt

users/{uid}/kids/{kidId}/candies/{logId}
  catalogId
  displayName
  count
  rating
  notes
  colorHex
  colorName
  emoji
  createdAt
  updatedAt

zipStats/{zip}/contributors/{uid}
  candyCounts (map of candy name -> total pieces)
  totalPieces
  updatedAt
```

## Subscription paywall

The UI exposes an “Activate my pass” button that currently marks the user’s
subscription as active for one year. Replace this logic with your preferred billing
provider (Stripe, Lemon Squeezy, etc.) and, upon successful payment, call the same
Firestore update used in `handleActivateSubscription()`.

Suggested path:

1. Implement Firebase Cloud Functions that listen for webhook events from your billing
   partner and update the `users/{uid}` document accordingly.
2. Restrict paywall access by updating security rules so only active subscribers can
   read analytics documents.

## Zip code insights

Each time a user logs candy, their totals are published to `zipStats/{zip}/contributors`.
This allows you to aggregate per-zip favorites in Firestore or BigQuery. The client
fetches contributor docs and assembles the “Popular by Zip” table. Consider exporting
this collection to BigQuery for richer analytics by city or metro area.

## Deploying with GitHub & Firebase Hosting

1. **Connect the repo** to Firebase Hosting (Hosting → Add site → GitHub integration).
2. **Select the `cloud-hosting` branch** as the production branch.
3. Firebase will generate a GitHub Actions workflow that runs `firebase deploy` on every
   push to `cloud-hosting`.

To deploy manually:

```bash
firebase deploy --only hosting
```

## Customization ideas

- Add sharing links for each kid’s candy haul recap
- Integrate Firestore listeners with Cloud Functions to compute city-wide leaderboards
- Gate new premium analytics behind additional subscription tiers
- Gamify the experience with achievements for top-rated candies or new zip codes visited

Enjoy building a sweet, spooky experience! 🎃
