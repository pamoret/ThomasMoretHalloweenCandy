# Deploying Spooky Candy Cloud to Firebase Hosting

This project is a static web app, so Firebase Hosting can serve it directly without a custom backend. Follow the steps below to publish and enable continuous delivery from GitHub.

## 1. Prerequisites
- Firebase project with Hosting enabled.
- Node.js 18+ (for the Firebase CLI).
- Firebase CLI (`npm install -g firebase-tools`).
- GitHub repository connected to the Firebase project.

## 2. One-time setup
1. **Authenticate**
   ```bash
   firebase login
   ```

2. **Initialize Hosting** inside the repository root:
   ```bash
   firebase init hosting
   ```
   Recommended answers to the prompts:
   - Use an existing project → choose your Firebase project.
   - Public directory → `.` (the root already contains `index.html`).
   - Configure as a single-page app → **No** (routing is handled client-side without rewrites).
   - Set up automatic builds and deploys with GitHub → you can accept here or configure later.

3. **Configuration files**
   Initialization creates `firebase.json` and `.firebaserc`. Commit these files to the repo. If you enable GitHub deploys, Firebase also adds a workflow under `.github/workflows/`.

## 3. Local testing
```bash
firebase emulators:start --only hosting
```
Visit the printed URL (usually `http://127.0.0.1:5000`) to verify the app. Because the project is static, you can also run `python -m http.server 8000` for a quick preview without the emulator.

## 4. Manual deployment
```bash
firebase deploy --only hosting
```
After the upload, the CLI prints both the hosting URL and the live channel preview URL. Share the preview for QA or use `firebase hosting:channel:deploy staging` to create named channels.

## 5. GitHub automation (CI/CD)
If you skipped the GitHub integration during `firebase init`, you can enable it later:
1. In the Firebase console, open **Hosting → GitHub integration**.
2. Connect your GitHub repo and choose the branch (e.g., `main`) to deploy from.
3. Firebase generates a workflow file (`.github/workflows/firebase-hosting-merge.yml`). Review, adjust, and commit it.
4. On each push to the selected branch, GitHub Actions runs `npm install` (for the CLI), builds if necessary, and executes `firebase deploy --only hosting` with the credentials stored as GitHub secrets.

## 6. Updating Firebase configuration (optional)
If you later connect real Firebase services, populate `assets/firebase-config.js` with your project keys and load the Firebase SDKs in `index.html`. Update the security rules and consider moving sensitive logic to Cloud Functions. For now, the site runs entirely in the browser with local storage demo data.

## 7. Ongoing workflow
- Develop new features in branches.
- Use the Firebase emulator or a local static server for QA.
- Merge into `main` to trigger the GitHub Action (or run `firebase deploy` manually).
- Confirm the deployment in the Firebase console and share the live URL globally.

Happy shipping! 🚀
