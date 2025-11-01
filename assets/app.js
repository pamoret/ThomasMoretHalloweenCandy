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
  filters: {
    rating: 'all',
    year: 'all',
    type: 'all',
    search: '',
  },
  currentQuest: null,
  familyStats: null,
  unsubscribers: {
    kids: null,
    catalog: null,
  },
  candyListeners: new Map(), // kidId -> unsubscribe
};

const FREE_CANDY_LIMIT = 25;
const QUESTS = [
  'Build a candy rainbow by lining up treats from darkest to lightest.',
  'Trade two candies with a sibling and note how the collection changes.',
  'Make a five-sentence spooky story featuring your top-rated candy.',
  'Sort tonight\'s haul into three flavor piles: chocolate, fruity, and mystery.',
  'Create a secret handshake before sharing your sweetest treat.',
  'Design a candy crown using wrappers from your favorites.',
];

const BADGE_LEVELS = [
  { min: 0, label: 'Candy Rookie', emoji: '🍼' },
  { min: 20, label: 'Sugar Sprinter', emoji: '🏃' },
  { min: 60, label: 'Treat Tactician', emoji: '🧠' },
  { min: 120, label: 'Legend of Lollies', emoji: '👑' },
];

// DOM references
const signInButton = document.getElementById('googleSignIn');
const signOutButton = document.getElementById('signOut');
const userBadge = document.getElementById('userBadge');
const userNameEl = document.getElementById('userName');
const userAvatarEl = document.getElementById('userAvatar');
const subscriptionStatusEl = document.getElementById('subscriptionStatus');
const paywallSection = document.getElementById('paywall');
const activateSubscriptionBtn = document.getElementById('activateSubscription');
const familyHubSection = document.getElementById('familyHub');
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
const candyFiltersBar = document.getElementById('candyFilters');
const ratingFilterEl = document.getElementById('ratingFilter');
const yearFilterEl = document.getElementById('yearFilter');
const typeFilterEl = document.getElementById('typeFilter');
const searchFilterInput = document.getElementById('searchFilter');
const clearFiltersBtn = document.getElementById('clearFilters');
const candyFilterSummaryEl = document.getElementById('candyFilterSummary');
const zipDisplayEl = document.getElementById('zipDisplay');
const topZipCandyEl = document.getElementById('topZipCandy');
const refreshInsightsBtn = document.getElementById('refreshInsights');
const totalTreatsEl = document.getElementById('totalTreats');
const kidTreatBreakdownEl = document.getElementById('kidTreatBreakdown');
const zipBreakdownBody = document.getElementById('zipBreakdown');
const familySummaryEl = document.getElementById('familySummary');
const priceEstimateEl = document.getElementById('priceEstimate');
const candyLimitNoticeEl = document.getElementById('candyLimitNotice');
const kidLeaderboardEl = document.getElementById('kidLeaderboard');
const achievementBoardEl = document.getElementById('achievementBoard');
const learningPromptsEl = document.getElementById('learningPrompts');
const familyQuestEl = document.getElementById('familyQuest');
const newQuestBtn = document.getElementById('newQuest');
const candyMoodboardEl = document.getElementById('candyMoodboard');

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
const candyYearInput = document.getElementById('candyYear');
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
  if (candyYearInput) {
    candyYearInput.value = String(new Date().getFullYear());
  }
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

function deriveCandyYear(candy) {
  if (!candy) return new Date().getFullYear();
  if (candy.collectedYear) {
    const year = Number(candy.collectedYear);
    if (Number.isFinite(year)) return year;
  }
  const source = candy.createdAt ?? candy.updatedAt;
  if (source instanceof Timestamp) {
    return source.toDate().getFullYear();
  }
  if (source) {
    const date = new Date(source);
    if (!Number.isNaN(date.getTime())) {
      return date.getFullYear();
    }
  }
  return new Date().getFullYear();
}

function getCandyIdentifier(candy) {
  return candy?.catalogId ?? candy?.type ?? candy?.displayName ?? '';
}

function getCandyDisplayName(candy) {
  return candy?.displayName ?? candy?.type ?? 'Candy';
}

function applyCandyFilters(candies) {
  return candies.filter((candy) => {
    const year = deriveCandyYear(candy);
    const ratingValue = Number(candy.rating ?? 0);
    const identifier = getCandyIdentifier(candy);
    if (state.filters.year !== 'all' && String(year) !== state.filters.year) {
      return false;
    }
    if (state.filters.rating !== 'all') {
      const desired = Number(state.filters.rating);
      if (desired === 0) {
        if (ratingValue > 0) return false;
      } else if (ratingValue !== desired) {
        return false;
      }
    }
    if (state.filters.type !== 'all' && identifier !== state.filters.type) {
      return false;
    }
    if (state.filters.search) {
      const query = state.filters.search.toLowerCase();
      const haystack = `${getCandyDisplayName(candy)} ${candy.notes ?? ''}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    return true;
  });
}

function updateFilterOptions(kid) {
  if (!candyFiltersBar || !ratingFilterEl || !yearFilterEl || !typeFilterEl) {
    return;
  }
  if (!kid || (kid.candies ?? []).length === 0) {
    hideElement(candyFiltersBar);
    hideElement(candyFilterSummaryEl);
    return;
  }
  showElement(candyFiltersBar);
  const years = new Set();
  const types = new Map();
  kid.candies.forEach((candy) => {
    years.add(deriveCandyYear(candy));
    const identifier = getCandyIdentifier(candy);
    if (identifier) {
      const display = `${candy.emoji ?? '🍬'} ${getCandyDisplayName(candy)}`;
      types.set(identifier, display);
    }
  });

  const previousYear = state.filters.year;
  yearFilterEl.innerHTML = '';
  const allYearsOption = document.createElement('option');
  allYearsOption.value = 'all';
  allYearsOption.textContent = 'All';
  yearFilterEl.appendChild(allYearsOption);
  Array.from(years)
    .sort((a, b) => b - a)
    .forEach((year) => {
      const option = document.createElement('option');
      option.value = String(year);
      option.textContent = String(year);
      yearFilterEl.appendChild(option);
    });
  if (previousYear !== 'all' && !years.has(Number(previousYear))) {
    state.filters.year = 'all';
  }
  yearFilterEl.value = state.filters.year;

  const previousType = state.filters.type;
  typeFilterEl.innerHTML = '';
  const allTypesOption = document.createElement('option');
  allTypesOption.value = 'all';
  allTypesOption.textContent = 'All';
  typeFilterEl.appendChild(allTypesOption);
  Array.from(types.entries())
    .sort((a, b) => a[1].localeCompare(b[1]))
    .forEach(([value, label]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      typeFilterEl.appendChild(option);
    });
  if (previousType !== 'all' && !types.has(previousType)) {
    state.filters.type = 'all';
  }
  typeFilterEl.value = state.filters.type;
}

function updateFilterSummary(totalCount, visibleCount) {
  if (!candyFilterSummaryEl) {
    return;
  }
  if (totalCount === 0) {
    hideElement(candyFilterSummaryEl);
    return;
  }
  const activeFilters = Object.entries(state.filters).filter(([, value]) => value !== 'all' && value !== '');
  const filterNote = activeFilters.length > 0 ? 'Filters active · ' : '';
  candyFilterSummaryEl.textContent = `${filterNote}Showing ${visibleCount} of ${totalCount} candy entries.`;
  showElement(candyFilterSummaryEl);
}

function countTotalCandyEntries() {
  let total = 0;
  state.kids.forEach((kid) => {
    total += kid.candies?.length ?? 0;
  });
  return total;
}

function selectBadge(totalPieces) {
  let badge = BADGE_LEVELS[0];
  BADGE_LEVELS.forEach((level) => {
    if (totalPieces >= level.min) {
      badge = level;
    }
  });
  return badge;
}

function computeFamilyStats() {
  const stats = {
    kidCount: state.kids.size,
    totalPieces: 0,
    totalEntries: 0,
    averageRating: 0,
    leaderboard: [],
    moodboard: [],
  };
  const ratingTotals = { total: 0, count: 0 };
  const candyTotals = new Map();

  state.kids.forEach((kid) => {
    const candies = kid.candies ?? [];
    const pieces = candies.reduce((sum, candy) => sum + (Number(candy.count) || 0), 0);
    const entry = {
      name: kid.data?.name ?? 'Kid',
      pieces,
      entries: candies.length,
      favoriteCandy: null,
      averageRating: 0,
      badge: selectBadge(pieces),
    };
    const perCandy = new Map();
    let kidRatingTotal = 0;
    let kidRatingCount = 0;
    candies.forEach((candy) => {
      const count = Number(candy.count) || 0;
      stats.totalPieces += count;
      stats.totalEntries += 1;
      const ratingValue = Number(candy.rating) || 0;
      if (ratingValue > 0) {
        ratingTotals.total += ratingValue;
        ratingTotals.count += 1;
        kidRatingTotal += ratingValue;
        kidRatingCount += 1;
      }
      const displayName = getCandyDisplayName(candy);
      const candyKey = getCandyIdentifier(candy) || displayName;
      const existingKid = perCandy.get(displayName) ?? 0;
      perCandy.set(displayName, existingKid + count);

      const existing = candyTotals.get(candyKey) ?? {
        name: displayName,
        total: 0,
        ratingTotal: 0,
        ratingCount: 0,
        emoji: candy.emoji ?? '🍬',
        latestYear: deriveCandyYear(candy),
      };
      existing.total += count;
      if (ratingValue > 0) {
        existing.ratingTotal += ratingValue;
        existing.ratingCount += 1;
      }
      existing.latestYear = Math.max(existing.latestYear, deriveCandyYear(candy));
      candyTotals.set(candyKey, existing);
    });
    if (kidRatingCount > 0) {
      entry.averageRating = Number((kidRatingTotal / kidRatingCount).toFixed(2));
    }
    const favorite = Array.from(perCandy.entries()).sort((a, b) => b[1] - a[1])[0];
    entry.favoriteCandy = favorite ? favorite[0] : null;
    stats.leaderboard.push(entry);
  });

  stats.leaderboard.sort((a, b) => b.pieces - a.pieces);
  stats.averageRating = ratingTotals.count > 0 ? Number((ratingTotals.total / ratingTotals.count).toFixed(2)) : 0;
  stats.moodboard = Array.from(candyTotals.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)
    .map((item) => ({
      ...item,
      averageRating: item.ratingCount > 0 ? Number((item.ratingTotal / item.ratingCount).toFixed(1)) : 0,
    }));

  state.familyStats = stats;
  return stats;
}

function generateLearningPrompts(stats) {
  if (stats.kidCount === 0) {
    return ['Add your first kid to unlock personalized learning prompts.'];
  }
  const prompts = [];
  const topKid = stats.leaderboard[0];
  if (stats.totalPieces > 0) {
    prompts.push(`Count by tens to reach your family total of ${stats.totalPieces} pieces.`);
  }
  if (topKid && topKid.pieces > 0) {
    const shareCount = Math.max(1, stats.kidCount);
    prompts.push(`Ask ${topKid.name} how to split ${topKid.pieces} pieces among ${shareCount} friends.`);
  }
  if (topKid?.favoriteCandy) {
    prompts.push(`Write three tasting notes for ${topKid.favoriteCandy} together.`);
  }
  if (stats.averageRating > 0) {
    prompts.push(`Graph every candy rated above ${stats.averageRating.toFixed(1)} stars and compare flavors.`);
  }
  return prompts.slice(0, 3);
}

function buildDynamicQuests(stats) {
  const topKid = stats.leaderboard[0];
  const topCandy = stats.moodboard[0];
  const quests = [];
  if (topKid && topCandy) {
    quests.push(`Let ${topKid.name} host a taste test for ${topCandy.name} and record new star ratings.`);
  }
  if (stats.totalEntries > 0) {
    quests.push(`Create a candy timeline showing how your collection grew this year.`);
  }
  if (stats.kidCount > 1) {
    quests.push('Form candy trading posts in each room and practice friendly negotiations.');
  }
  return quests;
}

function ensureQuest(stats, forceNew = false) {
  if (!familyQuestEl) {
    return;
  }
  const options = [...buildDynamicQuests(stats), ...QUESTS];
  if (options.length === 0) {
    familyQuestEl.textContent = 'Add candy to unlock nightly quests.';
    return;
  }
  if (!forceNew && state.currentQuest) {
    familyQuestEl.textContent = state.currentQuest;
    return;
  }
  const index = Math.floor(Math.random() * options.length);
  const quest = options[index];
  state.currentQuest = quest;
  familyQuestEl.textContent = quest;
}

function renderMoodboard(items) {
  if (!candyMoodboardEl) {
    return;
  }
  candyMoodboardEl.innerHTML = '';
  if (!items || items.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'Log candy to see your family moodboard glow.';
    candyMoodboardEl.appendChild(empty);
    return;
  }
  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'mood-card';
    const emoji = document.createElement('div');
    emoji.className = 'emoji';
    emoji.textContent = item.emoji ?? '🍬';
    const title = document.createElement('h4');
    title.textContent = item.name;
    const rating = document.createElement('p');
    rating.className = 'mood-rating';
    rating.textContent = item.averageRating > 0 ? `Avg ${item.averageRating}★` : 'Awaiting ratings';
    const total = document.createElement('p');
    total.textContent = `${item.total} pieces · since ${item.latestYear ?? new Date().getFullYear()}`;
    card.append(emoji, title, rating, total);
    fragment.appendChild(card);
  });
  candyMoodboardEl.appendChild(fragment);
}

function renderFamilyHub() {
  if (!state.user) {
    hideElement(familyHubSection);
    return;
  }
  showElement(familyHubSection);
  const stats = computeFamilyStats();
  const kidWord = stats.kidCount === 1 ? 'adventurer' : 'adventurers';
  if (stats.kidCount === 0) {
    familySummaryEl.textContent = 'Add your first kid to begin.';
    priceEstimateEl.textContent = '$0 family pass estimate';
    kidLeaderboardEl.innerHTML = '';
    achievementBoardEl.innerHTML = '';
    learningPromptsEl.innerHTML = '';
    const promptItem = document.createElement('li');
    promptItem.textContent = 'Add a kid to unlock personalized learning prompts.';
    learningPromptsEl.appendChild(promptItem);
    renderMoodboard([]);
    familyQuestEl.textContent = 'Add a kid to conjure a family quest.';
    state.currentQuest = null;
    return;
  }
  familySummaryEl.textContent = `Tracking ${stats.kidCount} candy ${kidWord} with ${stats.totalPieces} pieces logged.`;
  priceEstimateEl.textContent = `Stripe family pass preview: $${(stats.kidCount * 2).toFixed(2)} for your crew.`;

  kidLeaderboardEl.innerHTML = '';
  const leaderboardFrag = document.createDocumentFragment();
  stats.leaderboard.forEach((entry, index) => {
    const item = document.createElement('li');
    const name = document.createElement('span');
    name.textContent = `${index + 1}. ${entry.name}`;
    const detail = document.createElement('span');
    const avgText = entry.averageRating ? `${entry.averageRating}★ avg` : 'No ratings yet';
    detail.textContent = `${entry.pieces} pcs · ${avgText}`;
    item.append(name, detail);
    leaderboardFrag.appendChild(item);
  });
  kidLeaderboardEl.appendChild(leaderboardFrag);

  achievementBoardEl.innerHTML = '';
  const badgeFrag = document.createDocumentFragment();
  stats.leaderboard.forEach((entry) => {
    const item = document.createElement('li');
    const badgeLabel = document.createElement('span');
    badgeLabel.textContent = `${entry.badge.emoji} ${entry.badge.label}`;
    const description = document.createElement('span');
    description.textContent = `${entry.name} logged ${entry.pieces} pieces`;
    item.append(badgeLabel, description);
    badgeFrag.appendChild(item);
  });
  achievementBoardEl.appendChild(badgeFrag);

  const prompts = generateLearningPrompts(stats);
  learningPromptsEl.innerHTML = '';
  const promptFrag = document.createDocumentFragment();
  prompts.forEach((prompt) => {
    const item = document.createElement('li');
    item.textContent = prompt;
    promptFrag.appendChild(item);
  });
  learningPromptsEl.appendChild(promptFrag);

  renderMoodboard(stats.moodboard);
  ensureQuest(stats, false);
}

function updateCandyLimitUI() {
  if (!candyLimitNoticeEl) {
    return;
  }
  if (!state.user) {
    hideElement(candyLimitNoticeEl);
    if (addCandyBtn) {
      addCandyBtn.disabled = true;
      addCandyBtn.title = '';
    }
    return;
  }
  const totalEntries = countTotalCandyEntries();
  const active = isSubscriptionActive(state.profile);
  let message = '';
  if (active) {
    addCandyBtn.disabled = false;
    addCandyBtn.title = '';
    if (totalEntries > 0) {
      message = 'Family pass unlocked! Keep logging every candy discovery.';
    } else {
      message = 'Family pass unlocked—start logging candy whenever you are ready.';
    }
  } else {
    const remaining = Math.max(0, FREE_CANDY_LIMIT - totalEntries);
    if (remaining <= 0) {
      message = `Free plan limit reached (${FREE_CANDY_LIMIT} candy types). Activate your Stripe family pass to keep adding treats.`;
      addCandyBtn.disabled = true;
      addCandyBtn.title = 'Activate your family pass to add more candy types.';
    } else {
      const noun = remaining === 1 ? 'type' : 'types';
      message = `Free plan: ${remaining} candy ${noun} left before the Stripe paywall unlocks unlimited logging.`;
      addCandyBtn.disabled = false;
      addCandyBtn.title = '';
    }
  }
  if (message) {
    candyLimitNoticeEl.textContent = message;
    showElement(candyLimitNoticeEl);
  } else {
    hideElement(candyLimitNoticeEl);
  }
}

function toggleAuthUI(isSignedIn) {
  if (isSignedIn) {
    hideElement(signInButton);
    showElement(userBadge);
  } else {
    showElement(signInButton);
    hideElement(userBadge);
    hideElement(familyHubSection);
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
  updateCandyLimitUI();
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
    const favorite = kid.candies
      .map((candy) => ({ name: getCandyDisplayName(candy), total: candy.count ?? 0 }))
      .sort((a, b) => b.total - a.total)[0];
    const rated = kid.candies.filter((candy) => (candy.rating ?? 0) > 0);
    const avgRating = rated.length
      ? Number(
          (
            rated.reduce((sum, candy) => sum + (candy.rating ?? 0), 0) /
            rated.length
          ).toFixed(1),
        )
      : null;
    const parts = [`${totalCandy} pieces logged`];
    if (favorite?.name) {
      parts.push(`loves ${favorite.name}`);
    }
    if (avgRating && avgRating > 0) {
      parts.push(`${avgRating}★ avg`);
    }
    instance.querySelector('.kid-summary').textContent = parts.join(' · ');
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
    hideElement(candyFiltersBar);
    hideElement(candyFilterSummaryEl);
    return;
  }
  const kid = state.kids.get(state.currentKidId);
  if (!kid) {
    showElement(candyEmptyState);
    hideElement(candyTableWrapper);
    hideElement(candyFiltersBar);
    hideElement(candyFilterSummaryEl);
    return;
  }
  if (kid.candies.length === 0) {
    showElement(candyEmptyState);
    hideElement(candyTableWrapper);
    hideElement(candyFiltersBar);
    hideElement(candyFilterSummaryEl);
    return;
  }
  hideElement(candyEmptyState);
  showElement(candyTableWrapper);
  updateFilterOptions(kid);
  const filtered = applyCandyFilters(kid.candies);
  updateFilterSummary(kid.candies.length, filtered.length);
  const fragment = document.createDocumentFragment();
  if (filtered.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 7;
    cell.textContent = 'No candy matches the selected filters yet.';
    row.appendChild(cell);
    fragment.appendChild(row);
    candyTableBody.appendChild(fragment);
    return;
  }
  filtered.forEach((candy) => {
    const row = candyRowTemplate.content.firstElementChild.cloneNode(true);
    row.dataset.id = candy.id;
    row.querySelector('.candy-type').textContent = candy.displayName ?? candy.type;
    row.querySelector('.candy-count').textContent = candy.count ?? 0;
    row.querySelector('.candy-year').textContent = deriveCandyYear(candy);
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
            renderFamilyHub();
            updateCandyLimitUI();
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
    renderFamilyHub();
    updateCandyLimitUI();
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
    if (candyYearInput) {
      candyYearInput.value = candy.collectedYear ?? deriveCandyYear(candy);
    }
    candyNotesInput.value = candy.notes ?? '';
    selectedRating = candy.rating ?? 0;
  } else {
    candyFormTitle.textContent = 'Add candy';
    candyForm.reset();
    candyNotesInput.value = '';
    if (candyYearInput) {
      candyYearInput.value = String(new Date().getFullYear());
    }
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
  const yearValue = candyYearInput?.value ? Number(candyYearInput.value) : new Date().getFullYear();
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
    collectedYear: Number.isFinite(yearValue) ? yearValue : new Date().getFullYear(),
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
  state.familyStats = null;
  state.currentQuest = null;
  if (familyQuestEl) {
    familyQuestEl.textContent = 'Sign in to conjure a family quest.';
  }
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
    renderFamilyHub();
    updateCandyLimitUI();
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

if (ratingFilterEl) {
  ratingFilterEl.addEventListener('change', (event) => {
    state.filters.rating = event.target.value;
    renderCandyTable();
  });
}

if (yearFilterEl) {
  yearFilterEl.addEventListener('change', (event) => {
    state.filters.year = event.target.value;
    renderCandyTable();
  });
}

if (typeFilterEl) {
  typeFilterEl.addEventListener('change', (event) => {
    state.filters.type = event.target.value;
    renderCandyTable();
  });
}

if (searchFilterInput) {
  searchFilterInput.addEventListener('input', (event) => {
    state.filters.search = event.target.value.trim();
    renderCandyTable();
  });
}

if (clearFiltersBtn) {
  clearFiltersBtn.addEventListener('click', () => {
    state.filters = { rating: 'all', year: 'all', type: 'all', search: '' };
    if (ratingFilterEl) ratingFilterEl.value = 'all';
    if (yearFilterEl) yearFilterEl.value = 'all';
    if (typeFilterEl) typeFilterEl.value = 'all';
    if (searchFilterInput) searchFilterInput.value = '';
    renderCandyTable();
  });
}

if (newQuestBtn) {
  newQuestBtn.addEventListener('click', () => {
    const stats = state.familyStats ?? computeFamilyStats();
    ensureQuest(stats, true);
  });
}

document.querySelectorAll('[data-close]').forEach((button) => {
  const dialog = button.closest('dialog');
  button.addEventListener('click', () => closeDialog(dialog));
});

kidForm.addEventListener('submit', handleKidSubmit);
candyForm.addEventListener('submit', handleCandySubmit);

renderRatingButtons();
