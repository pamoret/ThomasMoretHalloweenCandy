import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  orderBy,
  query,
  writeBatch,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

function assertFirebaseConfig(config) {
  const missing = Object.entries(config).some(
    ([, value]) => typeof value === 'string' && value.startsWith('YOUR_FIREBASE_'),
  );
  if (missing) {
    throw new Error(
      'Firebase configuration is incomplete. Update assets/firebase-config.js with your project keys.',
    );
  }
}

assertFirebaseConfig(firebaseConfig);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const defaultCandyUrl = new URL('../data/defaultCandyTypes.json', import.meta.url);

const state = {
  user: null,
  profile: null,
  kids: new Map(), // kidId -> { data, candies: [] }
  candyCatalog: [],
  currentKidId: null,
  favoriteChart: null,
  colorChart: null,
  unsubscribers: {
    kids: null,
    catalog: null,
  },
  candyListeners: new Map(), // kidId -> unsubscribe
};

// DOM references
const signInButton = document.getElementById('googleSignIn');
const signOutButton = document.getElementById('signOut');
const userBadge = document.getElementById('userBadge');
const userNameEl = document.getElementById('userName');
const userAvatarEl = document.getElementById('userAvatar');
const subscriptionStatusEl = document.getElementById('subscriptionStatus');
const paywallSection = document.getElementById('paywall');
const activateSubscriptionBtn = document.getElementById('activateSubscription');
const kidManagerSection = document.getElementById('kidManager');
const candyManagerSection = document.getElementById('candyManager');
const insightsSection = document.getElementById('insights');
const addKidBtn = document.getElementById('addKid');
const kidListEl = document.getElementById('kidList');
const kidSelectEl = document.getElementById('kidSelect');
const addCandyBtn = document.getElementById('addCandy');
const candyEmptyState = document.getElementById('candyEmptyState');
const candyTableWrapper = document.getElementById('candyTableWrapper');
const candyTableBody = document.getElementById('candyTableBody');
const zipDisplayEl = document.getElementById('zipDisplay');
const topZipCandyEl = document.getElementById('topZipCandy');
const refreshInsightsBtn = document.getElementById('refreshInsights');
const totalTreatsEl = document.getElementById('totalTreats');
const kidTreatBreakdownEl = document.getElementById('kidTreatBreakdown');
const zipBreakdownBody = document.getElementById('zipBreakdown');

const zipDialog = document.getElementById('zipDialog');
const zipInput = document.getElementById('zipInput');
const zipSubmit = document.getElementById('zipSubmit');
const kidDialog = document.getElementById('kidDialog');
const kidForm = document.getElementById('kidForm');
const kidFormTitle = document.getElementById('kidFormTitle');
const kidNameInput = document.getElementById('kidName');
const kidCostumeInput = document.getElementById('kidCostume');
const kidBirthYearInput = document.getElementById('kidBirthYear');
const candyDialog = document.getElementById('candyDialog');
const candyForm = document.getElementById('candyForm');
const candyFormTitle = document.getElementById('candyFormTitle');
const candyTypeSelect = document.getElementById('candyType');
const candyCountInput = document.getElementById('candyCount');
const candyNotesInput = document.getElementById('candyNotes');
const ratingSelector = document.getElementById('ratingSelector');

const kidCardTemplate = document.getElementById('kidCardTemplate');
const candyRowTemplate = document.getElementById('candyRowTemplate');

let editingKidId = null;
let editingCandyId = null;
let selectedRating = 0;

const ratingMax = 5;
const ratingEmojis = ['💀', '🎃', '🍬', '🧙', '🌟'];

function formatTimestamp(value) {
  if (!value) return '—';
  const date = value instanceof Timestamp ? value.toDate() : new Date(value);
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
}

function computeAge(birthYear) {
  if (!birthYear) return null;
  const year = Number(birthYear);
  if (!Number.isFinite(year)) return null;
  const currentYear = new Date().getFullYear();
  return currentYear - year;
}

function renderRating(rating) {
  if (!rating || rating <= 0) return '—';
  return '⭐'.repeat(rating);
}

function renderRatingButtons(value = 0) {
  ratingSelector.innerHTML = '';
  for (let i = 1; i <= ratingMax; i += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = ratingEmojis[i - 1];
    button.dataset.value = String(i);
    if (i === value) {
      button.classList.add('active');
    }
    button.addEventListener('click', () => {
      selectedRating = i;
      renderRatingButtons(selectedRating);
    });
    ratingSelector.appendChild(button);
  }
}

function resetCandyForm() {
  candyForm.reset();
  selectedRating = 0;
  renderRatingButtons(selectedRating);
  editingCandyId = null;
}

function resetKidForm() {
  kidForm.reset();
  editingKidId = null;
}

function closeDialog(dialog) {
  if (dialog.open) {
    dialog.close();
  }
}

function showElement(element) {
  element.classList.remove('hidden');
}

function hideElement(element) {
  element.classList.add('hidden');
}

function toggleAuthUI(isSignedIn) {
  if (isSignedIn) {
    hideElement(signInButton);
    showElement(userBadge);
  } else {
    showElement(signInButton);
    hideElement(userBadge);
    hideElement(kidManagerSection);
    hideElement(candyManagerSection);
    hideElement(insightsSection);
    hideElement(paywallSection);
  }
}

function isSubscriptionActive(profile) {
  if (!profile) return false;
  if (profile.subscriptionStatus !== 'active') return false;
  if (!profile.subscriptionExpiry) return false;
  const expiryDate = profile.subscriptionExpiry instanceof Timestamp
    ? profile.subscriptionExpiry.toDate()
    : new Date(profile.subscriptionExpiry);
  return expiryDate.getTime() > Date.now();
}

function updateSubscriptionUI() {
  const profile = state.profile;
  if (!profile) {
    subscriptionStatusEl.textContent = '';
    hideElement(paywallSection);
    return;
  }
  const active = isSubscriptionActive(profile);
  if (active) {
    subscriptionStatusEl.textContent = 'Treat pass active';
    hideElement(paywallSection);
    showElement(insightsSection);
  } else {
    const expiryText = profile.subscriptionExpiry
      ? formatTimestamp(profile.subscriptionExpiry)
      : '—';
    subscriptionStatusEl.textContent = `Renew to unlock · expired ${expiryText}`;
    showElement(paywallSection);
    hideElement(insightsSection);
  }
}

function updateUserBadge(user) {
  userNameEl.textContent = user.displayName ?? 'Candy collector';
  if (user.photoURL) {
    userAvatarEl.src = user.photoURL;
  } else {
    userAvatarEl.src = 'https://avatars.dicebear.com/api/bottts/candy.svg';
  }
}

function populateCandySelect() {
  candyTypeSelect.innerHTML = '';
  const fragment = document.createDocumentFragment();
  state.candyCatalog.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = `${item.emoji ?? '🍬'} ${item.name}`;
    fragment.appendChild(option);
  });
  candyTypeSelect.appendChild(fragment);
}

function renderKidSelect() {
  kidSelectEl.innerHTML = '';
  const fragment = document.createDocumentFragment();
  state.kids.forEach((kid, id) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = kid.data.name;
    fragment.appendChild(option);
  });
  kidSelectEl.appendChild(fragment);
  if (state.kids.size === 0) {
    state.currentKidId = null;
    hideElement(candyTableWrapper);
    showElement(candyEmptyState);
    kidSelectEl.disabled = true;
  } else {
    kidSelectEl.disabled = false;
    if (!state.currentKidId || !state.kids.has(state.currentKidId)) {
      const firstKidId = state.kids.keys().next().value;
      state.currentKidId = firstKidId;
    }
    kidSelectEl.value = state.currentKidId;
    showElement(candyTableWrapper);
    hideElement(candyEmptyState);
  }
}

function renderKidCards() {
  kidListEl.innerHTML = '';
  const fragment = document.createDocumentFragment();
  state.kids.forEach((kid, id) => {
    const instance = kidCardTemplate.content.firstElementChild.cloneNode(true);
    instance.dataset.id = id;
    instance.querySelector('.kid-name').textContent = kid.data.name;
    instance.querySelector('.kid-costume').textContent = kid.data.favoriteCostume
      ? `Favorite costume: ${kid.data.favoriteCostume}`
      : 'Favorite costume TBD';
    const age = computeAge(kid.data.birthYear);
    instance.querySelector('.kid-age').textContent = age
      ? `${age} years old`
      : 'Age unknown';
    const totalCandy = kid.candies.reduce((sum, candy) => sum + (candy.count ?? 0), 0);
    instance.querySelector('.kid-summary').textContent = `${totalCandy} total pieces logged`;
    instance.querySelector('.edit-kid').addEventListener('click', () => openKidDialog(id));
    fragment.appendChild(instance);
  });
  kidListEl.appendChild(fragment);
}

function renderCandyTable() {
  candyTableBody.innerHTML = '';
  if (!state.currentKidId) {
    showElement(candyEmptyState);
    hideElement(candyTableWrapper);
    return;
  }
  const kid = state.kids.get(state.currentKidId);
  if (!kid) {
    showElement(candyEmptyState);
    hideElement(candyTableWrapper);
    return;
  }
  if (kid.candies.length === 0) {
    showElement(candyEmptyState);
    hideElement(candyTableWrapper);
    return;
  }
  hideElement(candyEmptyState);
  showElement(candyTableWrapper);
  const fragment = document.createDocumentFragment();
  kid.candies.forEach((candy) => {
    const row = candyRowTemplate.content.firstElementChild.cloneNode(true);
    row.dataset.id = candy.id;
    row.querySelector('.candy-type').textContent = candy.displayName ?? candy.type;
    row.querySelector('.candy-count').textContent = candy.count ?? 0;
    row.querySelector('.candy-rating').textContent = renderRating(candy.rating);
    row.querySelector('.candy-notes').textContent = candy.notes || '—';
    row.querySelector('.candy-updated').textContent = formatTimestamp(candy.updatedAt);
    row.querySelector('.edit-candy').addEventListener('click', () => openCandyDialog(candy.id));
    fragment.appendChild(row);
  });
  candyTableBody.appendChild(fragment);
}

function ensureCharts() {
  if (typeof window.Chart === 'undefined') {
    console.warn('Chart.js is not loaded. Skipping chart rendering.');
    return false;
  }
  const favoriteCanvas = document.getElementById('favoriteChart');
  const colorCanvas = document.getElementById('colorChart');
  if (!state.favoriteChart) {
    state.favoriteChart = new window.Chart(favoriteCanvas, {
      type: 'bar',
      data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
      },
    });
  }
  if (!state.colorChart) {
    state.colorChart = new window.Chart(colorCanvas, {
      type: 'doughnut',
      data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });
  }
  return true;
}

function randomPalette(size) {
  const palette = ['#ff6f1d', '#a855f7', '#48e287', '#facc15', '#fb7185', '#38bdf8', '#f97316'];
  return Array.from({ length: size }, (_, index) => palette[index % palette.length]);
}

function updateCharts(aggregate) {
  if (!ensureCharts()) {
    return;
  }
  const { favoriteChart, colorChart } = state;
  favoriteChart.data.labels = aggregate.topRated.map((item) => item.name);
  favoriteChart.data.datasets[0].data = aggregate.topRated.map((item) => item.averageRating);
  favoriteChart.data.datasets[0].backgroundColor = randomPalette(aggregate.topRated.length);
  favoriteChart.update();

  colorChart.data.labels = aggregate.byColor.map((item) => item.colorName);
  colorChart.data.datasets[0].data = aggregate.byColor.map((item) => item.total);
  colorChart.data.datasets[0].backgroundColor = aggregate.byColor.map((item) => item.colorHex);
  colorChart.update();
}

function computeAggregates() {
  const totals = new Map();
  const ratings = new Map();
  const byKid = new Map();
  const colors = new Map();

  state.kids.forEach((kid) => {
    const kidTotal = kid.candies.reduce((sum, candy) => sum + (candy.count ?? 0), 0);
    byKid.set(kid.data.name, kidTotal);
    kid.candies.forEach((candy) => {
      const previous = totals.get(candy.displayName) ?? 0;
      totals.set(candy.displayName, previous + (candy.count ?? 0));
      const ratingEntry = ratings.get(candy.displayName) ?? { total: 0, count: 0 };
      if (candy.rating) {
        ratingEntry.total += candy.rating;
        ratingEntry.count += 1;
      }
      ratings.set(candy.displayName, ratingEntry);
      if (candy.colorHex) {
        const colorEntry = colors.get(candy.colorHex) ?? { total: 0, name: candy.colorName ?? 'Candy' };
        colorEntry.total += candy.count ?? 0;
        colors.set(candy.colorHex, colorEntry);
      }
    });
  });

  const totalPieces = Array.from(totals.values()).reduce((sum, value) => sum + value, 0);
  const kidBreakdown = Array.from(byKid.entries())
    .map(([kidName, value]) => `${kidName}: ${value}`)
    .join(' · ');

  const topRated = Array.from(ratings.entries())
    .map(([name, { total, count }]) => ({
      name,
      averageRating: count === 0 ? 0 : Number((total / count).toFixed(2)),
    }))
    .filter((item) => item.averageRating > 0)
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 5);

  const byColor = Array.from(colors.entries()).map(([colorHex, { total, name }]) => ({
    colorHex,
    total,
    colorName: name,
  }));

  return {
    totalPieces,
    kidBreakdown,
    totals,
    topRated,
    byColor,
  };
}

async function updateZipContribution(aggregate) {
  if (!state.profile?.zipCode || !state.user) {
    return;
  }
  const zip = state.profile.zipCode;
  const contributionRef = doc(db, 'zipStats', zip, 'contributors', state.user.uid);
  const candyCounts = {};
  aggregate.totals.forEach((value, key) => {
    candyCounts[key] = value;
  });
  await setDoc(
    contributionRef,
    {
      candyCounts,
      totalPieces: aggregate.totalPieces,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

async function fetchZipInsights() {
  if (!state.profile?.zipCode) {
    return;
  }
  const zip = state.profile.zipCode;
  zipDisplayEl.textContent = zip;
  const contributorSnap = await getDocs(collection(db, 'zipStats', zip, 'contributors'));
  const combined = new Map();
  contributorSnap.forEach((docSnap) => {
    const data = docSnap.data();
    const counts = data.candyCounts ?? {};
    Object.entries(counts).forEach(([name, value]) => {
      const current = combined.get(name) ?? 0;
      combined.set(name, current + Number(value));
    });
  });
  const sorted = Array.from(combined.entries()).sort((a, b) => b[1] - a[1]);
  const top = sorted[0];
  topZipCandyEl.textContent = top ? `${top[0]} (${top[1]})` : '—';
  zipBreakdownBody.innerHTML = '';
  const fragment = document.createDocumentFragment();
  sorted.slice(0, 6).forEach(([name, value]) => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.textContent = name;
    const valueCell = document.createElement('td');
    valueCell.textContent = value;
    row.append(nameCell, valueCell);
    fragment.appendChild(row);
  });
  if (fragment.childElementCount === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 2;
    cell.textContent = 'No data yet';
    row.appendChild(cell);
    fragment.appendChild(row);
  }
  zipBreakdownBody.appendChild(fragment);
}

function refreshInsightsView() {
  const aggregate = computeAggregates();
  totalTreatsEl.textContent = aggregate.totalPieces;
  kidTreatBreakdownEl.textContent = aggregate.kidBreakdown || 'Log candy to see the magic!';
  updateCharts(aggregate);
  updateZipContribution(aggregate)
    .then(() => fetchZipInsights())
    .catch((error) => {
      console.error('Failed to update zip contribution', error);
    });
}

async function ensureZipCode(profileExists) {
  if (profileExists?.zipCode) {
    zipDisplayEl.textContent = profileExists.zipCode;
    return profileExists.zipCode;
  }
  return new Promise((resolve, reject) => {
    function handleSubmit(event) {
      event.preventDefault();
      const value = zipInput.value.trim();
      if (!value) {
        zipInput.setCustomValidity('Zip is required');
        zipInput.reportValidity();
        return;
      }
      zipInput.setCustomValidity('');
      zipDialog.close(value);
    }

    function handleClose() {
      zipSubmit.removeEventListener('click', handleSubmit);
      zipDialog.removeEventListener('close', handleClose);
      const value = zipDialog.returnValue;
      if (!value || value === 'cancel') {
        reject(new Error('Zip code required'));
      } else {
        zipDisplayEl.textContent = value;
        resolve(value);
      }
    }

    zipSubmit.addEventListener('click', handleSubmit);
    zipDialog.addEventListener('close', handleClose);
    zipInput.value = profileExists?.zipCode ?? '';
    zipDialog.showModal();
  });
}

async function seedCandyCatalog(uid) {
  const response = await fetch(defaultCandyUrl);
  const defaults = await response.json();
  const batch = writeBatch(db);
  defaults.forEach((item) => {
    const ref = doc(collection(db, 'users', uid, 'catalog'));
    batch.set(ref, {
      name: item.name,
      emoji: item.emoji,
      colorHex: item.colorHex,
      colorName: item.colorName,
      defaultRating: item.defaultRating ?? 0,
      description: item.description ?? '',
      createdAt: serverTimestamp(),
    });
  });
  await batch.commit();
}

async function ensureUserProfile(user) {
  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) {
    const zip = await ensureZipCode({});
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const profile = {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      zipCode: zip,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      subscriptionStatus: 'active',
      subscriptionExpiry: Timestamp.fromDate(nextYear),
    };
    await setDoc(userRef, profile);
    await seedCandyCatalog(user.uid);
    state.profile = { ...profile, zipCode: zip };
    return profile;
  }
  const data = snapshot.data();
  if (!data.zipCode) {
    const zip = await ensureZipCode(data);
    await updateDoc(userRef, { zipCode: zip });
    data.zipCode = zip;
  }
  await updateDoc(userRef, { lastLoginAt: serverTimestamp() });
  state.profile = data;
  return data;
}

function subscribeToKids(uid) {
  if (state.unsubscribers.kids) {
    state.unsubscribers.kids();
  }
  state.kids.forEach((_, kidId) => {
    const existing = state.candyListeners.get(kidId);
    if (existing) existing();
  });
  state.kids.clear();
  state.candyListeners.clear();
  const kidsRef = collection(db, 'users', uid, 'kids');
  const kidsQuery = query(kidsRef, orderBy('name'));
  state.unsubscribers.kids = onSnapshot(kidsQuery, (snapshot) => {
    const removedIds = new Set(state.kids.keys());
    snapshot.forEach((docSnap) => {
      const kidId = docSnap.id;
      removedIds.delete(kidId);
      const existing = state.kids.get(kidId) ?? { candies: [] };
      existing.data = docSnap.data();
      state.kids.set(kidId, existing);
      if (!state.candyListeners.has(kidId)) {
        const candiesRef = collection(db, 'users', uid, 'kids', kidId, 'candies');
        const unsub = onSnapshot(candiesRef, (cSnap) => {
          const candies = cSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          const entry = state.kids.get(kidId);
          if (entry) {
            entry.candies = candies.sort((a, b) => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0));
            state.kids.set(kidId, entry);
            renderKidCards();
            renderKidSelect();
            renderCandyTable();
            refreshInsightsView();
          }
        });
        state.candyListeners.set(kidId, unsub);
      }
    });
    removedIds.forEach((kidId) => {
      const unsub = state.candyListeners.get(kidId);
      if (unsub) unsub();
      state.candyListeners.delete(kidId);
      state.kids.delete(kidId);
    });
    renderKidCards();
    renderKidSelect();
    renderCandyTable();
    refreshInsightsView();
  });
}

function subscribeToCatalog(uid) {
  if (state.unsubscribers.catalog) {
    state.unsubscribers.catalog();
  }
  const catalogRef = collection(db, 'users', uid, 'catalog');
  const catalogQuery = query(catalogRef, orderBy('name'));
  state.unsubscribers.catalog = onSnapshot(catalogQuery, (snapshot) => {
    state.candyCatalog = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    populateCandySelect();
  });
}

function openKidDialog(kidId = null) {
  editingKidId = kidId;
  if (kidId) {
    const kid = state.kids.get(kidId);
    kidFormTitle.textContent = 'Edit kid';
    kidNameInput.value = kid?.data?.name ?? '';
    kidCostumeInput.value = kid?.data?.favoriteCostume ?? '';
    kidBirthYearInput.value = kid?.data?.birthYear ?? '';
  } else {
    kidFormTitle.textContent = 'Add kid';
    resetKidForm();
  }
  kidDialog.showModal();
}

function openCandyDialog(candyId = null) {
  editingCandyId = candyId;
  if (!state.currentKidId) {
    return;
  }
  const kid = state.kids.get(state.currentKidId);
  if (!kid) {
    return;
  }
  populateCandySelect();
  if (candyId) {
    const candy = kid.candies.find((item) => item.id === candyId);
    candyFormTitle.textContent = 'Edit candy';
    candyTypeSelect.value = candy.catalogId ?? candy.type ?? '';
    candyCountInput.value = candy.count ?? 0;
    candyNotesInput.value = candy.notes ?? '';
    selectedRating = candy.rating ?? 0;
  } else {
    candyFormTitle.textContent = 'Add candy';
    candyForm.reset();
    candyNotesInput.value = '';
    selectedRating = 0;
  }
  renderRatingButtons(selectedRating);
  candyDialog.showModal();
}

async function handleKidSubmit(event) {
  event.preventDefault();
  if (!state.user) return;
  const payload = {
    name: kidNameInput.value.trim(),
    favoriteCostume: kidCostumeInput.value.trim(),
    birthYear: kidBirthYearInput.value ? Number(kidBirthYearInput.value) : null,
    updatedAt: serverTimestamp(),
  };
  if (!payload.name) {
    kidNameInput.reportValidity();
    return;
  }
  const kidsRef = collection(db, 'users', state.user.uid, 'kids');
  if (editingKidId) {
    const kidRef = doc(kidsRef, editingKidId);
    await updateDoc(kidRef, payload);
  } else {
    payload.createdAt = serverTimestamp();
    const docRef = await addDoc(kidsRef, payload);
    state.currentKidId = docRef.id;
  }
  closeDialog(kidDialog);
  resetKidForm();
}

function findCatalogItem(catalogId) {
  return state.candyCatalog.find((item) => item.id === catalogId);
}

async function handleCandySubmit(event) {
  event.preventDefault();
  if (!state.user || !state.currentKidId) return;
  const catalogId = candyTypeSelect.value;
  const catalogItem = findCatalogItem(catalogId);
  const count = Number(candyCountInput.value);
  const payload = {
    catalogId,
    displayName: catalogItem?.name ?? 'Candy',
    type: catalogItem?.name ?? 'Candy',
    count: Number.isFinite(count) ? count : 0,
    rating: selectedRating,
    notes: candyNotesInput.value.trim(),
    colorHex: catalogItem?.colorHex ?? '#f97316',
    colorName: catalogItem?.colorName ?? 'Candy',
    emoji: catalogItem?.emoji ?? '🍬',
    updatedAt: serverTimestamp(),
  };
  const candiesRef = collection(db, 'users', state.user.uid, 'kids', state.currentKidId, 'candies');
  if (editingCandyId) {
    const candyRef = doc(candiesRef, editingCandyId);
    await updateDoc(candyRef, payload);
  } else {
    payload.createdAt = serverTimestamp();
    await addDoc(candiesRef, payload);
  }
  closeDialog(candyDialog);
  resetCandyForm();
}

async function handleActivateSubscription() {
  if (!state.user) return;
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const userRef = doc(db, 'users', state.user.uid);
  await updateDoc(userRef, {
    subscriptionStatus: 'active',
    subscriptionExpiry: Timestamp.fromDate(nextYear),
    lastPaymentAt: serverTimestamp(),
  });
  state.profile = {
    ...state.profile,
    subscriptionStatus: 'active',
    subscriptionExpiry: Timestamp.fromDate(nextYear),
  };
  updateSubscriptionUI();
  alert('Subscription activated! Your spooky insights are unlocked.');
}

async function handleSignIn() {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error('Failed to sign in', error);
    alert('Sign-in failed. Please try again.');
  }
}

async function handleSignOut() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Failed to sign out', error);
  }
}

function cleanupSubscriptions() {
  if (state.unsubscribers.kids) {
    state.unsubscribers.kids();
    state.unsubscribers.kids = null;
  }
  if (state.unsubscribers.catalog) {
    state.unsubscribers.catalog();
    state.unsubscribers.catalog = null;
  }
  state.candyListeners.forEach((unsub) => unsub());
  state.candyListeners.clear();
  state.kids.clear();
}

onAuthStateChanged(auth, async (user) => {
  state.user = user;
  if (!user) {
    cleanupSubscriptions();
    state.profile = null;
    toggleAuthUI(false);
    return;
  }
  toggleAuthUI(true);
  updateUserBadge(user);
  try {
    const profile = await ensureUserProfile(user);
    state.profile = profile;
    zipDisplayEl.textContent = profile.zipCode;
    updateSubscriptionUI();
    showElement(kidManagerSection);
    showElement(candyManagerSection);
    if (isSubscriptionActive(profile)) {
      showElement(insightsSection);
    }
    subscribeToCatalog(user.uid);
    subscribeToKids(user.uid);
    fetchZipInsights().catch((error) => console.error('Failed to fetch zip insights', error));
  } catch (error) {
    console.error('Profile setup failed', error);
    alert('We need your zip code to continue.');
    await signOut(auth);
  }
});

signInButton.addEventListener('click', handleSignIn);
signOutButton.addEventListener('click', handleSignOut);
activateSubscriptionBtn.addEventListener('click', handleActivateSubscription);
addKidBtn.addEventListener('click', () => openKidDialog());
addCandyBtn.addEventListener('click', () => openCandyDialog());
kidSelectEl.addEventListener('change', (event) => {
  state.currentKidId = event.target.value;
  renderCandyTable();
});
refreshInsightsBtn.addEventListener('click', () => {
  fetchZipInsights().catch((error) => console.error('Failed to refresh insights', error));
});

document.querySelectorAll('[data-close]').forEach((button) => {
  const dialog = button.closest('dialog');
  button.addEventListener('click', () => closeDialog(dialog));
});

kidForm.addEventListener('submit', handleKidSubmit);
candyForm.addEventListener('submit', handleCandySubmit);

renderRatingButtons();
