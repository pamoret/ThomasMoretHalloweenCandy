const FREE_KID_LIMIT = 2;
const FREE_CANDY_TYPE_LIMIT = 12;
const FREE_CANDY_LIMIT = 25;
const STORAGE_KEY = 'spooky-candy-cloud-state-v3';

const DEMO_USER = {
  uid: 'demo-parent',
  displayName: 'Demo Parent',
  photoURL: 'https://avatars.dicebear.com/api/bottts/candy-demo.svg',
};

const QUESTS = [
  'Build a candy rainbow by lining up treats from darkest to lightest.',
  'Trade two candies with a sibling and note how the collection changes.',
  'Make a five-sentence spooky story featuring your top-rated candy.',
  'Sort tonight\'s haul into three flavor piles: chocolate, fruity, and mystery.',
  'Create a secret handshake before sharing your sweetest treat.',
  'Design a candy crown using wrappers from your favorites.',
  'Sketch the ultimate haunted candy store and label each shelf.',
  'Invent a new candy flavor and pitch it to the family.',
];

const LEARNING_PROMPTS = [
  'If you shared half your favorite candy, how many pieces would you keep?',
  'Describe the texture of your top treat using three adjectives.',
  'Graph how many candies you collected this year versus last year.',
  'Write a thank-you note to the neighbor who gave the best sweets.',
  'Sort your candies by color and predict which hue will win next year.',
  'Plan a candy taste-test and record the family\'s ratings.',
  'Compare a crunchy candy and a chewy candy using a Venn diagram.',
  'Rename a classic candy with a spooky twist and justify the choice.',
];

const ACHIEVEMENT_RULES = [
  {
    id: 'starter-pack',
    label: 'Starter Pack',
    description: 'Log candy for two different kids.',
    check: (stats) => stats.kidCount >= 2,
  },
  {
    id: 'taste-tester',
    label: 'Taste Tester',
    description: 'Record five tasting notes.',
    check: (stats) => stats.totalNotes >= 5,
  },
  {
    id: 'variety-voyager',
    label: 'Variety Voyager',
    description: 'Discover ten unique candy types.',
    check: (stats) => stats.uniqueTypeCount >= 10,
  },
  {
    id: 'star-savant',
    label: 'Star Savant',
    description: 'Give out ten 5-star ratings.',
    check: (stats) => stats.fiveStarCount >= 10,
  },
  {
    id: 'word-wizard',
    label: 'Word Wizard',
    description: 'Write one hundred words of tasting notes.',
    check: (stats) => stats.totalNoteWords >= 100,
  },
];

const BADGE_LEVELS = [
  { min: 0, label: 'Candy Rookie', emoji: '🍼' },
  { min: 25, label: 'Sugar Sprinter', emoji: '🏃' },
  { min: 75, label: 'Treat Tactician', emoji: '🧠' },
  { min: 150, label: 'Legend of Lollies', emoji: '👑' },
];

const ratingEmojis = ['💀', '🎃', '🍬', '🧙', '🌟'];
const RATING_MAX = ratingEmojis.length;

const state = {
  user: null,
  profile: {
    subscriptionStatus: 'trial',
    subscriptionExpiry: null,
    freeKidSlots: FREE_KID_LIMIT,
    paidKidSlots: 0,
    freeCandyTypes: FREE_CANDY_TYPE_LIMIT,
    candyVaultUnlocked: false,
    zipCode: '',
  },
  parentWins: 0,
  kids: new Map(),
  candyCatalog: [],
  currentKidId: null,
  filters: { rating: 'all', year: 'all', type: 'all', search: '' },
  quest: null,
  familyStats: null,
  spotlightKidId: null,
};

const chartRefs = {
  favorites: null,
  colors: null,
};

let editingKidId = null;
let editingCandyId = null;
let selectedRating = 0;

// DOM references
const signInButton = document.getElementById('googleSignIn');
const signOutButton = document.getElementById('signOut');
const userBadge = document.getElementById('userBadge');
const userNameEl = document.getElementById('userName');
const userAvatarEl = document.getElementById('userAvatar');
const subscriptionStatusEl = document.getElementById('subscriptionStatus');
const activateSubscriptionBtn = document.getElementById('activateSubscription');
const paywallSection = document.getElementById('paywall');
const familyHubSection = document.getElementById('familyHub');
const kidManagerSection = document.getElementById('kidManager');
const candyManagerSection = document.getElementById('candyManager');
const insightsSection = document.getElementById('insights');
const familyNav = document.getElementById('familyNav');
const panelButtons = familyNav ? Array.from(familyNav.querySelectorAll('[data-panel-target]')) : [];

const kidListEl = document.getElementById('kidList');
const kidSelectEl = document.getElementById('kidSelect');
const addKidBtn = document.getElementById('addKid');
const addCandyBtn = document.getElementById('addCandy');
const familyRosterEl = document.getElementById('familyRoster');
const kidSlotsUsageEl = document.getElementById('kidSlotsUsage');
const openKidUpgradeBtn = document.getElementById('openKidUpgrade');
const kidLimitBanner = document.getElementById('kidLimitBanner');
const logParentWinBtn = document.getElementById('logParentWin');
const parentWinCountEl = document.getElementById('parentWinCount');
const familySummaryEl = document.getElementById('familySummary');
const priceEstimateEl = document.getElementById('priceEstimate');
const candyLimitNoticeEl = document.getElementById('candyLimitNotice');
const kidLeaderboardEl = document.getElementById('kidLeaderboard');
const achievementBoardEl = document.getElementById('achievementBoard');
const learningPromptsEl = document.getElementById('learningPrompts');
const familyStarMeterEl = document.getElementById('familyStarMeter');
const familyTimelineEl = document.getElementById('familyTimeline');
const familyClassroomEl = document.getElementById('familyClassroom');
const familyQuestEl = document.getElementById('familyQuest');
const familyGoalsEl = document.getElementById('familyGoals');
const newQuestBtn = document.getElementById('newQuest');
const familyKidCountEl = document.getElementById('familyKidCount');
const familyUniqueCandyEl = document.getElementById('familyUniqueCandy');
const familyAverageRatingEl = document.getElementById('familyAverageRating');
const familySparkleScoreEl = document.getElementById('familySparkleScore');
const familyKidHighlightsEl = document.getElementById('familyKidHighlights');
const questListEl = document.getElementById('questList');
const spotlightKidEl = document.getElementById('spotlightKid');
const cycleSpotlightBtn = document.getElementById('cycleSpotlight');
const candyMoodboardEl = document.getElementById('candyMoodboard');

const kidCardTemplate = document.getElementById('kidCardTemplate');
const candyRowTemplate = document.getElementById('candyRowTemplate');

const candyTableWrapper = document.getElementById('candyTableWrapper');
const candyEmptyState = document.getElementById('candyEmptyState');
const candyTableBody = document.getElementById('candyTableBody');
const candySummaryBadges = document.getElementById('candySummaryBadges');
const ratingFilterEl = document.getElementById('ratingFilter');
const yearFilterEl = document.getElementById('yearFilter');
const typeFilterEl = document.getElementById('typeFilter');
const candySearchInput = document.getElementById('candySearch');
const clearCandyFiltersBtn = document.getElementById('clearCandyFilters');
const candyLimitBanner = document.getElementById('candyLimitBanner');
const openCandyUpgradeBtn = document.getElementById('openCandyUpgrade');

const totalTreatsEl = document.getElementById('totalTreats');
const kidTreatBreakdownEl = document.getElementById('kidTreatBreakdown');
const zipDisplayEl = document.getElementById('zipDisplay');
const topZipCandyEl = document.getElementById('topZipCandy');
const refreshInsightsBtn = document.getElementById('refreshInsights');
const zipBreakdownBody = document.getElementById('zipBreakdown');

const favoriteChartCanvas = document.getElementById('favoriteChart');
const colorChartCanvas = document.getElementById('colorChart');

const zipDialog = document.getElementById('zipDialog');
const zipInput = document.getElementById('zipInput');
const zipSubmitBtn = document.getElementById('zipSubmit');
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
const kidUpgradeDialog = document.getElementById('kidUpgradeDialog');
const kidUpgradeConfirm = document.getElementById('kidUpgradeConfirm');
const candyUpgradeDialog = document.getElementById('candyUpgradeDialog');
const candyUpgradeConfirm = document.getElementById('candyUpgradeConfirm');

function showElement(element) {
  element?.classList.remove('hidden');
}

function hideElement(element) {
  element?.classList.add('hidden');
}

function formatAverage(value) {
  if (!Number.isFinite(value) || value <= 0) return '—';
  return value.toFixed(1);
}

function formatTimestamp(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
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
  const age = currentYear - year;
  return age >= 0 && age <= 120 ? age : null;
}

function generateId(prefix) {
  const suffix = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  return `${prefix}-${suffix}`;
}

function getCandyById(id) {
  return state.candyCatalog.find((item) => item.id === id) ?? null;
}
async function loadCandyCatalog() {
  try {
    const response = await fetch('data/defaultCandyTypes.json');
    if (!response.ok) throw new Error('Unable to load candy catalog');
    const data = await response.json();
    state.candyCatalog = data.map((item) => ({
      id: item.id,
      name: item.name,
      emoji: item.emoji,
      color: item.color,
      category: item.category,
    }));
  } catch (error) {
    console.warn('Falling back to built-in candy catalog', error);
    state.candyCatalog = [
      { id: 'candy-chocolate', name: 'Chocolate Bar', emoji: '🍫', color: '#5D3A1A', category: 'Chocolate' },
      { id: 'candy-lollipop', name: 'Spiral Lollipop', emoji: '🍭', color: '#FF6EC7', category: 'Sugar' },
      { id: 'candy-gummy', name: 'Gummy Worms', emoji: '🐛', color: '#FF9A3C', category: 'Gummy' },
      { id: 'candy-caramel', name: 'Salted Caramel', emoji: '🍯', color: '#F4A259', category: 'Caramel' },
    ];
  }
  populateCandySelect();
}

function createSampleState() {
  const [a, b, c, d] = state.candyCatalog;
  const now = Date.now();
  const createCandy = (catalog, overrides = {}) => ({
    id: generateId('candy'),
    catalogId: catalog?.id ?? null,
    displayName: catalog ? `${catalog.emoji ?? '🍬'} ${catalog.name}` : 'Mystery Treat',
    count: overrides.count ?? 8,
    rating: overrides.rating ?? 4,
    notes: overrides.notes ?? '',
    color: catalog?.color ?? '#FF6EC7',
    collectedYear: overrides.collectedYear ?? new Date().getFullYear(),
    createdAt: overrides.createdAt ?? new Date(now - 1000 * 60 * 60 * 6).toISOString(),
    updatedAt: overrides.updatedAt ?? new Date(now - 1000 * 60 * 45).toISOString(),
  });

  const kidAId = generateId('kid');
  const kidBId = generateId('kid');

  const kids = [
    {
      id: kidAId,
      name: 'Avery',
      favoriteCostume: 'Potion Master',
      birthYear: 2014,
      candies: [
        createCandy(a, {
          count: 18,
          rating: 5,
          notes: 'Shared 3 with a new friend.',
          collectedYear: new Date().getFullYear(),
          updatedAt: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
        }),
        createCandy(b, {
          count: 9,
          rating: 3,
          notes: 'Loved the neon colors!',
          collectedYear: new Date().getFullYear() - 1,
          updatedAt: new Date(now - 1000 * 60 * 90).toISOString(),
        }),
      ],
    },
    {
      id: kidBId,
      name: 'Nova',
      favoriteCostume: 'Galaxy Explorer',
      birthYear: 2011,
      candies: [
        createCandy(c, {
          count: 12,
          rating: 4,
          notes: 'Perfect for trading at the swap table.',
          collectedYear: new Date().getFullYear(),
          updatedAt: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
        }),
        createCandy(d, {
          count: 5,
          rating: 0,
          notes: '',
          collectedYear: new Date().getFullYear() - 2,
          updatedAt: new Date(now - 1000 * 60 * 60 * 30).toISOString(),
        }),
      ],
    },
  ];

  return {
    user: { ...DEMO_USER },
    profile: {
      subscriptionStatus: 'trial',
      subscriptionExpiry: null,
      freeKidSlots: FREE_KID_LIMIT,
      paidKidSlots: 0,
      freeCandyTypes: FREE_CANDY_TYPE_LIMIT,
      candyVaultUnlocked: false,
      zipCode: '94105',
    },
    parentWins: 1,
    kids,
  };
}

function loadStateFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Unable to load stored state', error);
    return null;
  }
}

function persistState() {
  try {
    const payload = {
      user: state.user,
      profile: state.profile,
      parentWins: state.parentWins,
      kids: Array.from(state.kids.values()),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('Unable to persist state', error);
  }
}

function clearStateStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Unable to clear storage', error);
  }
}

function applySnapshot(snapshot) {
  state.user = snapshot.user ?? null;
  state.profile = {
    subscriptionStatus: snapshot.profile?.subscriptionStatus ?? 'trial',
    subscriptionExpiry: snapshot.profile?.subscriptionExpiry ?? null,
    freeKidSlots: snapshot.profile?.freeKidSlots ?? FREE_KID_LIMIT,
    paidKidSlots: snapshot.profile?.paidKidSlots ?? 0,
    freeCandyTypes: snapshot.profile?.freeCandyTypes ?? FREE_CANDY_TYPE_LIMIT,
    candyVaultUnlocked: Boolean(snapshot.profile?.candyVaultUnlocked),
    zipCode: snapshot.profile?.zipCode ?? '',
  };
  state.parentWins = Number(snapshot.parentWins ?? 0);
  state.kids.clear();
  (snapshot.kids ?? []).forEach((kid) => {
    state.kids.set(kid.id, {
      ...kid,
      candies: (kid.candies ?? []).map((candy) => ({ ...candy })),
    });
  });
  state.currentKidId = state.kids.size > 0 ? state.kids.keys().next().value : null;
}

function toggleAuthUI(isSignedIn) {
  if (isSignedIn) {
    hideElement(signInButton);
    showElement(userBadge);
    showElement(familyNav);
  } else {
    showElement(signInButton);
    hideElement(userBadge);
    hideElement(familyNav);
    hideElement(familyHubSection);
    hideElement(kidManagerSection);
    hideElement(candyManagerSection);
    hideElement(insightsSection);
    hideElement(paywallSection);
  }
}

function updateUserBadge() {
  if (!state.user) return;
  userNameEl.textContent = state.user.displayName ?? 'Candy Parent';
  if (state.user.photoURL) {
    userAvatarEl.src = state.user.photoURL;
    userAvatarEl.alt = `${state.user.displayName ?? 'User'} avatar`;
  }
}

function isSubscriptionActive() {
  if (state.profile.subscriptionStatus !== 'active') return false;
  if (!state.profile.subscriptionExpiry) return false;
  const expiry = new Date(state.profile.subscriptionExpiry);
  return expiry.getTime() > Date.now();
}

function updateSubscriptionUI() {
  const active = isSubscriptionActive();
  subscriptionStatusEl.textContent = active ? 'Active pass' : 'Trial mode';
  subscriptionStatusEl.classList.toggle('active', active);
  if (active) {
    hideElement(paywallSection);
  } else {
    showElement(paywallSection);
  }
}

function planHasUnlimitedKids() {
  return isSubscriptionActive();
}

function getAllowedKidSlots() {
  if (planHasUnlimitedKids()) return Infinity;
  const base = Number(state.profile.freeKidSlots ?? FREE_KID_LIMIT);
  const paid = Number(state.profile.paidKidSlots ?? 0);
  return base + paid;
}

function getCandyTypeLimit() {
  if (isSubscriptionActive() || state.profile.candyVaultUnlocked) return Infinity;
  return Number(state.profile.freeCandyTypes ?? FREE_CANDY_TYPE_LIMIT);
}

function collectAllCandies() {
  const candies = [];
  state.kids.forEach((kid) => {
    kid.candies.forEach((candy) => {
      candies.push({ ...candy, kidId: kid.id, kidName: kid.name });
    });
  });
  return candies;
}

function renderRatingButtons(value = 0) {
  if (!ratingSelector) return;
  ratingSelector.innerHTML = '';
  for (let i = 1; i <= RATING_MAX; i += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = ratingEmojis[i - 1];
    button.dataset.value = String(i);
    if (i === value) button.classList.add('active');
    button.addEventListener('click', () => {
      selectedRating = i;
      renderRatingButtons(selectedRating);
    });
    ratingSelector.appendChild(button);
  }
}

function resetKidForm() {
  editingKidId = null;
  kidForm.reset();
}

function resetCandyForm() {
  editingCandyId = null;
  candyForm.reset();
  const currentYear = new Date().getFullYear();
  candyYearInput.value = String(currentYear);
  selectedRating = 0;
  renderRatingButtons(selectedRating);
}

function openKidDialog(kidId = null) {
  resetKidForm();
  if (kidId && state.kids.has(kidId)) {
    const kid = state.kids.get(kidId);
    editingKidId = kidId;
    kidFormTitle.textContent = 'Edit kid';
    kidNameInput.value = kid.name ?? '';
    kidCostumeInput.value = kid.favoriteCostume ?? '';
    kidBirthYearInput.value = kid.birthYear ? String(kid.birthYear) : '';
  } else {
    kidFormTitle.textContent = 'Add kid';
  }
  kidDialog.showModal();
}

function closeKidDialog() {
  if (kidDialog.open) kidDialog.close();
}

function openCandyDialog(kidId = state.currentKidId, candyId = null) {
  if (!kidId) return;
  resetCandyForm();
  if (!state.kids.has(kidId)) return;
  state.currentKidId = kidId;
  const kid = state.kids.get(kidId);
  if (candyId) {
    const candy = kid.candies.find((item) => item.id === candyId);
    if (candy) {
      editingCandyId = candyId;
      candyFormTitle.textContent = `Edit candy for ${kid.name}`;
      if (candy.catalogId && candyTypeSelect.querySelector(`[value="${candy.catalogId}"]`)) {
        candyTypeSelect.value = candy.catalogId;
      }
      candyCountInput.value = String(candy.count ?? 0);
      candyYearInput.value = candy.collectedYear ? String(candy.collectedYear) : '';
      candyNotesInput.value = candy.notes ?? '';
      selectedRating = Number(candy.rating ?? 0);
      renderRatingButtons(selectedRating);
    }
  } else {
    candyFormTitle.textContent = `Add candy for ${kid.name}`;
  }
  candyDialog.showModal();
}

function closeCandyDialog() {
  if (candyDialog.open) candyDialog.close();
}

function canAddKid() {
  const allowed = getAllowedKidSlots();
  if (!Number.isFinite(allowed)) return true;
  return state.kids.size < allowed;
}

function countUniqueCandyTypes() {
  const unique = new Set();
  state.kids.forEach((kid) => {
    kid.candies.forEach((candy) => {
      const key = candy.catalogId ?? `custom:${candy.displayName ?? candy.type ?? 'Candy'}`;
      unique.add(key);
    });
  });
  return unique.size;
}

function canAddCandyType(newCatalogId) {
  const limit = getCandyTypeLimit();
  if (!Number.isFinite(limit)) return true;
  const unique = new Set();
  state.kids.forEach((kid) => {
    kid.candies.forEach((candy) => {
      const key = candy.catalogId ?? `custom:${candy.displayName ?? candy.type ?? 'Candy'}`;
      unique.add(key);
    });
  });
  if (newCatalogId && unique.has(newCatalogId)) return true;
  return unique.size < limit;
}
function handleKidSubmit(event) {
  event.preventDefault();
  const name = kidNameInput.value.trim();
  if (!name) return;
  const favoriteCostume = kidCostumeInput.value.trim();
  const birthYear = kidBirthYearInput.value ? Number(kidBirthYearInput.value) : null;
  if (editingKidId) {
    const existing = state.kids.get(editingKidId);
    if (!existing) return;
    existing.name = name;
    existing.favoriteCostume = favoriteCostume;
    existing.birthYear = birthYear;
  } else {
    if (!canAddKid()) {
      kidLimitBanner?.classList.remove('hidden');
      closeKidDialog();
      return;
    }
    const id = generateId('kid');
    state.kids.set(id, {
      id,
      name,
      favoriteCostume,
      birthYear,
      candies: [],
    });
    state.currentKidId = id;
  }
  persistState();
  closeKidDialog();
  renderAll();
}

function handleCandySubmit(event) {
  event.preventDefault();
  if (!state.currentKidId || !state.kids.has(state.currentKidId)) return;
  const kid = state.kids.get(state.currentKidId);
  const catalogId = candyTypeSelect.value || null;
  const count = Number(candyCountInput.value ?? 0);
  const collectedYear = candyYearInput.value ? Number(candyYearInput.value) : null;
  const notes = candyNotesInput.value.trim();
  const rating = selectedRating;
  if (!canAddCandyType(catalogId)) {
    candyLimitBanner?.classList.remove('hidden');
    closeCandyDialog();
    return;
  }
  const base = catalogId ? getCandyById(catalogId) : null;
  const payload = {
    catalogId,
    displayName: base ? `${base.emoji ?? '🍬'} ${base.name}` : candyTypeSelect.options[candyTypeSelect.selectedIndex]?.textContent ?? 'Candy',
    count,
    rating,
    notes,
    color: base?.color ?? '#FF6EC7',
    collectedYear,
    updatedAt: new Date().toISOString(),
  };
  if (editingCandyId) {
    const index = kid.candies.findIndex((item) => item.id === editingCandyId);
    if (index >= 0) {
      kid.candies[index] = { ...kid.candies[index], ...payload };
    }
  } else {
    kid.candies.push({
      id: generateId('candy'),
      createdAt: new Date().toISOString(),
      ...payload,
    });
  }
  persistState();
  closeCandyDialog();
  renderAll();
}

function handleParentWin() {
  state.parentWins += 1;
  parentWinCountEl.textContent = `${state.parentWins} kudos logged`;
  persistState();
}

function populateCandySelect() {
  if (!candyTypeSelect) return;
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
  if (!kidSelectEl) return;
  kidSelectEl.innerHTML = '';
  const fragment = document.createDocumentFragment();
  state.kids.forEach((kid, id) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = kid.name;
    fragment.appendChild(option);
  });
  kidSelectEl.appendChild(fragment);
  if (state.kids.size === 0) {
    state.currentKidId = null;
    kidSelectEl.disabled = true;
    showElement(candyEmptyState);
    hideElement(candyTableWrapper);
  } else {
    kidSelectEl.disabled = false;
    if (!state.currentKidId || !state.kids.has(state.currentKidId)) {
      state.currentKidId = state.kids.keys().next().value;
    }
    kidSelectEl.value = state.currentKidId;
    hideElement(candyEmptyState);
    showElement(candyTableWrapper);
  }
}

function renderKidCards() {
  if (!kidListEl) return;
  kidListEl.innerHTML = '';
  const fragment = document.createDocumentFragment();
  state.kids.forEach((kid) => {
    const instance = kidCardTemplate.content.firstElementChild.cloneNode(true);
    instance.dataset.id = kid.id;
    instance.querySelector('.kid-name').textContent = kid.name;
    instance.querySelector('.kid-costume').textContent = kid.favoriteCostume
      ? `Favorite costume: ${kid.favoriteCostume}`
      : 'Favorite costume TBD';
    const age = computeAge(kid.birthYear);
    instance.querySelector('.kid-age').textContent = age ? `${age} years old` : 'Age unknown';
    const totalCandy = kid.candies.reduce((sum, candy) => sum + Number(candy.count ?? 0), 0);
    const uniqueTypes = new Set(
      kid.candies.map((candy) => candy.catalogId ?? `custom:${candy.displayName ?? candy.type ?? 'Candy'}`),
    ).size;
    const ratedCandies = kid.candies.filter((candy) => Number(candy.rating ?? 0) > 0);
    const averageRating = ratedCandies.length
      ? ratedCandies.reduce((sum, candy) => sum + Number(candy.rating ?? 0), 0) / ratedCandies.length
      : 0;
    const summaryBits = [`${totalCandy} total pieces`, `${uniqueTypes} candy types`];
    if (averageRating > 0) summaryBits.push(`${formatAverage(averageRating)}⭐ avg`);
    instance.querySelector('.kid-summary').textContent = summaryBits.join(' · ');
    instance.querySelector('.edit-kid').addEventListener('click', () => openKidDialog(kid.id));
    fragment.appendChild(instance);
  });
  kidListEl.appendChild(fragment);
}

function deriveCandyYear(candy) {
  if (candy.collectedYear) {
    const year = Number(candy.collectedYear);
    if (Number.isFinite(year)) return year;
  }
  const fallback = candy.updatedAt ?? candy.createdAt;
  const date = fallback ? new Date(fallback) : null;
  if (date && !Number.isNaN(date.getTime())) return date.getFullYear();
  return new Date().getFullYear();
}

function applyCandyFilters(candies) {
  return candies.filter((candy) => {
    if (state.filters.rating !== 'all') {
      const ratingValue = Number(candy.rating ?? 0);
      const desired = Number(state.filters.rating);
      if (desired === 0) {
        if (ratingValue > 0) return false;
      } else if (ratingValue !== desired) {
        return false;
      }
    }
    if (state.filters.year !== 'all') {
      const year = deriveCandyYear(candy);
      if (String(year) !== state.filters.year) return false;
    }
    if (state.filters.type !== 'all') {
      const identifier = candy.catalogId ?? `custom:${candy.displayName ?? candy.type ?? 'Candy'}`;
      if (identifier !== state.filters.type) return false;
    }
    if (state.filters.search) {
      const haystack = `${candy.displayName ?? ''} ${candy.notes ?? ''}`.toLowerCase();
      if (!haystack.includes(state.filters.search)) return false;
    }
    return true;
  });
}

function populateFilterOptions(kid) {
  const years = new Set(['all']);
  const types = new Map([['all', 'All candy']]);
  kid.candies.forEach((candy) => {
    years.add(String(deriveCandyYear(candy)));
    const identifier = candy.catalogId ?? `custom:${candy.displayName ?? candy.type ?? 'Candy'}`;
    if (!types.has(identifier)) {
      types.set(identifier, candy.displayName ?? candy.type ?? 'Candy');
    }
  });
  if (yearFilterEl) {
    yearFilterEl.innerHTML = '';
    Array.from(years)
      .sort((a, b) => (a === 'all' ? -1 : b === 'all' ? 1 : Number(b) - Number(a)))
      .forEach((value) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value === 'all' ? 'All years' : value;
        yearFilterEl.appendChild(option);
      });
    yearFilterEl.value = state.filters.year;
  }
  if (typeFilterEl) {
    typeFilterEl.innerHTML = '';
    types.forEach((label, value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value === 'all' ? 'All candy' : label;
      typeFilterEl.appendChild(option);
    });
    typeFilterEl.value = state.filters.type;
  }
}

function renderCandySummary(kid, candies) {
  if (!candySummaryBadges) return;
  candySummaryBadges.innerHTML = '';
  if (!kid) return;
  const totalPieces = candies.reduce((sum, candy) => sum + Number(candy.count ?? 0), 0);
  const rated = candies.filter((candy) => Number(candy.rating ?? 0) > 0);
  const averageRating = rated.length
    ? rated.reduce((sum, candy) => sum + Number(candy.rating ?? 0), 0) / rated.length
    : 0;
  const uniqueTypes = new Set(
    kid.candies.map((candy) => candy.catalogId ?? `custom:${candy.displayName ?? candy.type ?? 'Candy'}`),
  ).size;
  const notesWords = candies.reduce((sum, candy) => {
    if (!candy.notes) return sum;
    return sum + candy.notes.trim().split(/\s+/).filter(Boolean).length;
  }, 0);
  const summaryData = [
    { title: 'Pieces (filtered)', value: totalPieces, detail: `${candies.length} entries` },
    { title: 'Average rating', value: formatAverage(averageRating), detail: `${rated.length} rated` },
    { title: 'Unique types', value: uniqueTypes, detail: 'Keep exploring new treats!' },
    { title: 'Story words', value: notesWords, detail: 'Words written in tasting notes' },
  ];
  const fragment = document.createDocumentFragment();
  summaryData.forEach((item) => {
    const badge = document.createElement('article');
    badge.className = 'summary-badge';
    const heading = document.createElement('h4');
    heading.textContent = item.title;
    const value = document.createElement('p');
    value.textContent = item.value;
    const detail = document.createElement('small');
    detail.textContent = item.detail;
    badge.append(heading, value, detail);
    fragment.appendChild(badge);
  });
  candySummaryBadges.appendChild(fragment);
}

function renderCandyTable() {
  if (!state.currentKidId || !state.kids.has(state.currentKidId)) {
    showElement(candyEmptyState);
    hideElement(candyTableWrapper);
    return;
  }
  const kid = state.kids.get(state.currentKidId);
  populateFilterOptions(kid);
  const filtered = applyCandyFilters(kid.candies);
  candyTableBody.innerHTML = '';
  const fragment = document.createDocumentFragment();
  filtered.forEach((candy) => {
    const row = candyRowTemplate.content.firstElementChild.cloneNode(true);
    row.querySelector('.candy-type').textContent = candy.displayName ?? 'Candy';
    row.querySelector('.candy-count').textContent = Number(candy.count ?? 0);
    row.querySelector('.candy-year').textContent = deriveCandyYear(candy);
    row.querySelector('.candy-rating').textContent = candy.rating
      ? '⭐'.repeat(Math.max(1, Number(candy.rating)))
      : '—';
    row.querySelector('.candy-notes').textContent = candy.notes ?? '—';
    row.querySelector('.candy-updated').textContent = formatTimestamp(candy.updatedAt ?? candy.createdAt);
    row.querySelector('.edit-candy').addEventListener('click', () => openCandyDialog(kid.id, candy.id));
    fragment.appendChild(row);
  });
  candyTableBody.appendChild(fragment);
  renderCandySummary(kid, filtered);
  if (filtered.length === 0) {
    showElement(candyEmptyState);
  } else {
    hideElement(candyEmptyState);
  }
  showElement(candyTableWrapper);
}
function renderRoster() {
  if (!familyRosterEl) return;
  familyRosterEl.innerHTML = '';
  const fragment = document.createDocumentFragment();
  state.kids.forEach((kid) => {
    const item = document.createElement('li');
    item.innerHTML = `
      <div>
        <strong>${kid.name}</strong>
        <span>${kid.candies.length} candy logs</span>
      </div>
      <button class="btn ghost small">View</button>
    `;
    item.querySelector('button').addEventListener('click', () => {
      state.currentKidId = kid.id;
      renderAll();
      setActivePanel('candy');
    });
    fragment.appendChild(item);
  });
  familyRosterEl.appendChild(fragment);
  const allowed = getAllowedKidSlots();
  kidSlotsUsageEl.textContent = `${state.kids.size}${Number.isFinite(allowed) ? ` / ${allowed}` : ''}`;
}

function buildFamilyStats() {
  const allCandies = collectAllCandies();
  const kidSummaries = Array.from(state.kids.values()).map((kid) => {
    const totalPieces = kid.candies.reduce((sum, candy) => sum + Number(candy.count ?? 0), 0);
    const uniqueTypes = new Set(
      kid.candies.map((candy) => candy.catalogId ?? `custom:${candy.displayName ?? candy.type ?? 'Candy'}`),
    ).size;
    const ratedCandies = kid.candies.filter((candy) => Number(candy.rating ?? 0) > 0);
    const averageRating = ratedCandies.length
      ? ratedCandies.reduce((sum, candy) => sum + Number(candy.rating ?? 0), 0) / ratedCandies.length
      : 0;
    const topRated = ratedCandies
      .slice()
      .sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0))[0];
    const latest = kid.candies
      .slice()
      .sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime())[0];
    return {
      id: kid.id,
      name: kid.name,
      totalPieces,
      uniqueTypes,
      averageRating,
      topRated,
      latest,
      age: computeAge(kid.birthYear),
    };
  });

  const kidCount = state.kids.size;
  const totalPieces = kidSummaries.reduce((sum, kid) => sum + kid.totalPieces, 0);
  const uniqueTypeCount = countUniqueCandyTypes();
  const ratedCandies = allCandies.filter((candy) => Number(candy.rating ?? 0) > 0);
  const familyAverageRating = ratedCandies.length
    ? ratedCandies.reduce((sum, candy) => sum + Number(candy.rating ?? 0), 0) / ratedCandies.length
    : 0;
  const totalNotes = allCandies.filter((candy) => (candy.notes ?? '').trim().length > 0).length;
  const totalNoteWords = allCandies.reduce((sum, candy) => {
    if (!candy.notes) return sum;
    return sum + candy.notes.trim().split(/\s+/).filter(Boolean).length;
  }, 0);
  const fiveStarCount = allCandies.filter((candy) => Number(candy.rating ?? 0) === 5).length;

  const leaderboard = kidSummaries
    .slice()
    .sort((a, b) => b.totalPieces - a.totalPieces || b.uniqueTypes - a.uniqueTypes);

  const badge = BADGE_LEVELS
    .slice()
    .reverse()
    .find((entry) => totalPieces >= entry.min) ?? BADGE_LEVELS[0];

  const timelineMap = new Map();
  allCandies.forEach((candy) => {
    const year = deriveCandyYear(candy);
    const entry = timelineMap.get(year) ?? { total: 0, uniqueTypes: new Set() };
    entry.total += Number(candy.count ?? 0);
    entry.uniqueTypes.add(candy.catalogId ?? candy.displayName ?? 'Candy');
    timelineMap.set(year, entry);
  });
  const timeline = Array.from(timelineMap.entries())
    .map(([year, data]) => ({
      year: Number(year),
      total: data.total,
      uniqueTypes: data.uniqueTypes.size,
    }))
    .sort((a, b) => b.year - a.year);

  const colorPalette = {};
  allCandies.forEach((candy) => {
    const color = (candy.color ?? '#FF6EC7').toLowerCase();
    if (!colorPalette[color]) {
      colorPalette[color] = {
        color,
        name: candy.displayName ?? 'Candy',
        total: 0,
      };
    }
    colorPalette[color].total += Number(candy.count ?? 0);
  });

  const moodboard = Object.values(colorPalette)
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  return {
    kidCount,
    totalPieces,
    uniqueTypeCount,
    familyAverageRating,
    totalNotes,
    totalNoteWords,
    fiveStarCount,
    badge,
    leaderboard,
    timeline,
    moodboard,
    allCandies,
    kidSummaries,
  };
}

function renderFamilySummary(stats) {
  if (!stats) {
    familySummaryEl.textContent = 'Add your first kid to begin.';
    priceEstimateEl.textContent = '$0 family pass estimate';
    hideElement(candyLimitNoticeEl);
    return;
  }
  const kidCount = stats.kidCount;
  const totalPieces = stats.totalPieces;
  const uniqueTypes = stats.uniqueTypeCount;
  familySummaryEl.textContent = `${kidCount} kid${kidCount === 1 ? '' : 's'} · ${totalPieces} pieces logged · ${uniqueTypes} unique treats`;
  const paidKids = Math.max(0, kidCount - FREE_KID_LIMIT);
  const estimate = paidKids * 2;
  priceEstimateEl.textContent = estimate === 0
    ? '$0 family pass estimate'
    : `$${estimate} family pass estimate`;
  const typeLimit = getCandyTypeLimit();
  if (Number.isFinite(typeLimit) && uniqueTypes >= typeLimit) {
    candyLimitNoticeEl.textContent = 'Candy catalog maxed! Unlock the Candy Vault for unlimited treats.';
    showElement(candyLimitNoticeEl);
  } else {
    hideElement(candyLimitNoticeEl);
  }
}

function renderLeaderboard(stats) {
  if (!kidLeaderboardEl) return;
  kidLeaderboardEl.innerHTML = '';
  if (!stats || stats.leaderboard.length === 0) {
    const item = document.createElement('li');
    item.textContent = 'Add candy to build the leaderboard.';
    kidLeaderboardEl.appendChild(item);
    return;
  }
  stats.leaderboard.slice(0, 5).forEach((entry, index) => {
    const item = document.createElement('li');
    item.innerHTML = `
      <span>${index + 1}. ${entry.name}</span>
      <span>${entry.totalPieces} pcs · ${entry.uniqueTypes} types</span>
    `;
    kidLeaderboardEl.appendChild(item);
  });
}

function renderAchievements(stats) {
  if (!achievementBoardEl) return;
  achievementBoardEl.innerHTML = '';
  const fragment = document.createDocumentFragment();
  ACHIEVEMENT_RULES.forEach((rule) => {
    const achieved = rule.check(stats);
    const item = document.createElement('li');
    item.className = achieved ? 'unlocked' : 'locked';
    item.innerHTML = `
      <strong>${rule.label}</strong>
      <span>${rule.description}</span>
    `;
    fragment.appendChild(item);
  });
  achievementBoardEl.appendChild(fragment);
}

function renderLearningPrompts(stats) {
  if (!learningPromptsEl) return;
  learningPromptsEl.innerHTML = '';
  const pool = LEARNING_PROMPTS.slice();
  const prompts = [];
  while (prompts.length < 4 && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    prompts.push(pool.splice(index, 1)[0]);
  }
  prompts.forEach((prompt) => {
    const item = document.createElement('li');
    item.textContent = prompt;
    learningPromptsEl.appendChild(item);
  });
}

function renderStarMeter(stats) {
  if (!familyStarMeterEl) return;
  familyStarMeterEl.innerHTML = '';
  const maxPieces = BADGE_LEVELS[BADGE_LEVELS.length - 1].min;
  const progress = Math.min(1, stats.totalPieces / Math.max(1, maxPieces));
  const filledStars = Math.round(progress * 5);
  for (let i = 1; i <= 5; i += 1) {
    const star = document.createElement('span');
    star.textContent = i <= filledStars ? '⭐' : '☆';
    familyStarMeterEl.appendChild(star);
  }
  const label = document.createElement('p');
  label.className = 'star-meter-label';
  label.textContent = `${stats.badge.emoji} ${stats.badge.label}`;
  familyStarMeterEl.appendChild(label);
}

function renderTimeline(stats) {
  if (!familyTimelineEl) return;
  familyTimelineEl.innerHTML = '';
  if (!stats.timeline || stats.timeline.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'Log candy across years to build your timeline.';
    familyTimelineEl.appendChild(empty);
    return;
  }
  stats.timeline.slice(0, 5).forEach((entry) => {
    const card = document.createElement('div');
    card.className = 'timeline-card-item';
    card.innerHTML = `
      <strong>${entry.year}</strong>
      <span>${entry.total} pieces</span>
      <small>${entry.uniqueTypes} unique types</small>
    `;
    familyTimelineEl.appendChild(card);
  });
}

function renderClassroom(stats) {
  if (!familyClassroomEl) return;
  familyClassroomEl.innerHTML = '';
  const lessons = [];
  if (stats.timeline.length >= 2) {
    lessons.push('Compare this year\'s haul with last year and predict next year\'s total.');
  }
  if (stats.uniqueTypeCount >= 8) {
    lessons.push('Sort your candies into flavor families and explain each category.');
  }
  if (stats.totalNotes >= 3) {
    lessons.push('Turn your tasting notes into a short spooky poem.');
  }
  if (lessons.length === 0) {
    lessons.push('Add more candy logs to unlock classroom activities.');
  }
  lessons.forEach((lesson) => {
    const item = document.createElement('li');
    item.textContent = lesson;
    familyClassroomEl.appendChild(item);
  });
}

function renderFamilyMetrics(stats) {
  familyKidCountEl.textContent = stats.kidCount;
  familyUniqueCandyEl.textContent = stats.uniqueTypeCount;
  familyAverageRatingEl.textContent = formatAverage(stats.familyAverageRating);
  familySparkleScoreEl.textContent = stats.totalPieces;
  parentWinCountEl.textContent = `${state.parentWins} kudos logged`;
}

function renderSpotlight(stats) {
  if (!spotlightKidEl) return;
  spotlightKidEl.innerHTML = '';
  if (!stats.leaderboard || stats.leaderboard.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'Add a kid to highlight nightly victories.';
    spotlightKidEl.appendChild(empty);
    return;
  }
  if (!state.spotlightKidId || !stats.leaderboard.some((entry) => entry.id === state.spotlightKidId)) {
    state.spotlightKidId = stats.leaderboard[0].id;
  }
  const current = stats.leaderboard.find((entry) => entry.id === state.spotlightKidId) ?? stats.leaderboard[0];
  const heading = document.createElement('h4');
  heading.textContent = `${stats.badge.emoji} ${current.name}`;
  const details = document.createElement('p');
  const typeNoun = current.uniqueTypes === 1 ? 'type' : 'types';
  details.textContent = `${current.totalPieces} pieces · ${current.uniqueTypes} candy ${typeNoun}`;
  const recent = current.latest
    ? `${current.latest.displayName ?? 'Candy'} · ${formatTimestamp(current.latest.updatedAt)}`
    : 'Log a candy to start';
  const latest = document.createElement('p');
  latest.className = 'spotlight-latest';
  latest.textContent = `Latest log: ${recent}`;
  spotlightKidEl.append(heading, details, latest);
}

function rotateSpotlight() {
  if (!state.familyStats || !state.familyStats.leaderboard) return;
  const ids = state.familyStats.leaderboard.map((entry) => entry.id);
  if (ids.length === 0) return;
  const currentIndex = state.spotlightKidId ? ids.indexOf(state.spotlightKidId) : -1;
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % ids.length : 0;
  state.spotlightKidId = ids[nextIndex];
  renderSpotlight(state.familyStats);
}

function renderFamilyHighlights(stats) {
  if (!familyKidHighlightsEl) return;
  familyKidHighlightsEl.innerHTML = '';
  if (!stats || stats.kidSummaries.length === 0) {
    familyKidHighlightsEl.innerHTML = '<p>Add candy to unlock highlight reels.</p>';
    return;
  }
  const highlight = stats.kidSummaries
    .slice()
    .sort((a, b) => b.uniqueTypes - a.uniqueTypes || b.totalPieces - a.totalPieces)[0];
  const card = document.createElement('article');
  card.className = 'highlight-card';
  const title = document.createElement('h3');
  title.textContent = `${highlight.name} leads the pack!`;
  const body = document.createElement('p');
  body.textContent = `${highlight.totalPieces} pieces · ${highlight.uniqueTypes} unique types`;
  const rating = document.createElement('p');
  rating.className = 'highlight-rating';
  rating.textContent = highlight.averageRating > 0
    ? `${formatAverage(highlight.averageRating)}⭐ average`
    : 'No ratings yet';
  card.append(title, body, rating);
  familyKidHighlightsEl.appendChild(card);
}
function ensureQuest(stats, forceNew = false) {
  if (!stats) {
    state.quest = null;
    return;
  }
  if (state.quest && !forceNew) return;
  const index = Math.floor(Math.random() * QUESTS.length);
  state.quest = {
    summary: QUESTS[index],
    createdAt: Date.now(),
  };
}

function renderQuest(stats) {
  if (!familyQuestEl) return;
  ensureQuest(stats);
  if (!state.quest) {
    familyQuestEl.textContent = 'Sign in to conjure a family quest.';
  } else {
    familyQuestEl.textContent = state.quest.summary;
  }
}

function buildGoals(stats) {
  const goals = [];
  const remainingTypes = Math.max(0, Math.min(FREE_CANDY_LIMIT, stats.uniqueTypeCount + 3) - stats.uniqueTypeCount);
  if (remainingTypes > 0) {
    goals.push({
      title: 'Discovery goal',
      text: `Log ${remainingTypes} new candy ${remainingTypes === 1 ? 'type' : 'types'} to reach the free plan limit.`,
    });
  } else {
    goals.push({
      title: 'Upgrade goal',
      text: 'You\'re at the limit! Unlock the Candy Vault for unlimited candy types.',
    });
  }
  if (stats.timeline.length >= 2) {
    const [latest, previous] = stats.timeline;
    goals.push({
      title: 'Time traveler',
      text: `Compare ${previous.year} (${previous.total} pcs) to ${latest.year} (${latest.total} pcs) and predict next year.`,
    });
  }
  if (stats.kidSummaries.length >= 2) {
    const [lead, runner] = stats.kidSummaries
      .slice()
      .sort((a, b) => b.totalPieces - a.totalPieces);
    const diff = Math.max(0, lead.totalPieces - runner.totalPieces) + 1;
    goals.push({
      title: 'Sibling challenge',
      text: `${runner.name} can catch ${lead.name} by logging ${diff} more pieces.`,
    });
  }
  return goals.slice(0, 3);
}

function renderGoals(stats) {
  if (!familyGoalsEl) return;
  familyGoalsEl.innerHTML = '';
  const goals = buildGoals(stats);
  if (!goals || goals.length === 0) {
    const item = document.createElement('li');
    item.textContent = 'Add candy entries to generate family goals.';
    familyGoalsEl.appendChild(item);
    return;
  }
  goals.forEach((goal) => {
    const item = document.createElement('li');
    const title = document.createElement('strong');
    title.textContent = goal.title;
    const text = document.createElement('span');
    text.textContent = goal.text;
    item.append(title, text);
    familyGoalsEl.appendChild(item);
  });
}

function renderQuestBoard(stats) {
  if (!questListEl) return;
  questListEl.innerHTML = '';
  if (!stats || stats.kidSummaries.length === 0) {
    const item = document.createElement('p');
    item.textContent = 'Add candy entries to unlock quests.';
    questListEl.appendChild(item);
    return;
  }
  const tasks = [
    'Interview a kid about their top-rated candy and record a quote.',
    'Sort candies by texture and pick a winner in each category.',
    'Design a new wrapper for the most traded candy.',
  ];
  tasks.forEach((task) => {
    const card = document.createElement('article');
    card.className = 'quest-item';
    card.innerHTML = `
      <h4>${task}</h4>
      <button class="btn ghost small">Complete</button>
    `;
    card.querySelector('button').addEventListener('click', () => {
      card.classList.add('completed');
    });
    questListEl.appendChild(card);
  });
}

function renderMoodboard(stats) {
  if (!candyMoodboardEl) return;
  candyMoodboardEl.innerHTML = '';
  if (!stats || stats.moodboard.length === 0) {
    candyMoodboardEl.textContent = 'Add candy to build a color moodboard.';
    return;
  }
  stats.moodboard.forEach((entry) => {
    const swatch = document.createElement('div');
    swatch.className = 'mood-swatch';
    swatch.style.setProperty('--swatch-color', entry.color);
    swatch.innerHTML = `
      <span class="mood-color"></span>
      <strong>${entry.name}</strong>
      <small>${entry.total} pieces</small>
    `;
    candyMoodboardEl.appendChild(swatch);
  });
}

function renderFamilyHub() {
  const stats = buildFamilyStats();
  state.familyStats = stats;
  renderFamilySummary(stats);
  renderRoster();
  renderFamilyMetrics(stats);
  renderLeaderboard(stats);
  renderAchievements(stats);
  renderLearningPrompts(stats);
  renderStarMeter(stats);
  renderTimeline(stats);
  renderClassroom(stats);
  renderSpotlight(stats);
  renderFamilyHighlights(stats);
  renderQuest(stats);
  renderGoals(stats);
  renderQuestBoard(stats);
  renderMoodboard(stats);
}

function updateLimitBanners() {
  if (!canAddKid()) {
    kidLimitBanner?.classList.remove('hidden');
  } else {
    kidLimitBanner?.classList.add('hidden');
  }
  if (!canAddCandyType('__placeholder__')) {
    candyLimitBanner?.classList.remove('hidden');
  } else {
    candyLimitBanner?.classList.add('hidden');
  }
}
function buildFavoriteChartData(stats) {
  const counts = new Map();
  stats.allCandies.forEach((candy) => {
    const key = candy.displayName ?? 'Candy';
    const previous = counts.get(key) ?? { pieces: 0, ratings: [] };
    previous.pieces += Number(candy.count ?? 0);
    if (Number(candy.rating ?? 0) > 0) {
      previous.ratings.push(Number(candy.rating));
    }
    counts.set(key, previous);
  });
  const entries = Array.from(counts.entries())
    .map(([name, data]) => ({
      name,
      pieces: data.pieces,
      averageRating: data.ratings.length
        ? data.ratings.reduce((sum, value) => sum + value, 0) / data.ratings.length
        : 0,
    }))
    .sort((a, b) => b.averageRating - a.averageRating || b.pieces - a.pieces)
    .slice(0, 6);
  return entries;
}

function buildColorChartData(stats) {
  const totals = {};
  stats.allCandies.forEach((candy) => {
    const color = (candy.color ?? '#FF6EC7').toLowerCase();
    if (!totals[color]) {
      totals[color] = {
        color,
        label: candy.displayName ?? 'Candy',
        total: 0,
      };
    }
    totals[color].total += Number(candy.count ?? 0);
  });
  return Object.values(totals)
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);
}

function destroyChart(chart) {
  if (chart) {
    chart.destroy();
  }
}

function renderFavoriteChart(stats) {
  if (!favoriteChartCanvas) return;
  const data = buildFavoriteChartData(stats);
  destroyChart(chartRefs.favorites);
  if (data.length === 0) {
    favoriteChartCanvas.replaceWith(favoriteChartCanvas.cloneNode(true));
    return;
  }
  chartRefs.favorites = new Chart(favoriteChartCanvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: data.map((item) => item.name),
      datasets: [
        {
          label: 'Average rating',
          data: data.map((item) => Number(item.averageRating.toFixed(2))),
          backgroundColor: '#ff7ad9',
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, max: 5 },
      },
    },
  });
}

function renderColorChart(stats) {
  if (!colorChartCanvas) return;
  const data = buildColorChartData(stats);
  destroyChart(chartRefs.colors);
  if (data.length === 0) {
    colorChartCanvas.replaceWith(colorChartCanvas.cloneNode(true));
    return;
  }
  chartRefs.colors = new Chart(colorChartCanvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: data.map((item) => item.label),
      datasets: [
        {
          data: data.map((item) => item.total),
          backgroundColor: data.map((item) => item.color),
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    },
  });
}

function renderZipBreakdown(stats) {
  if (!zipBreakdownBody) return;
  zipBreakdownBody.innerHTML = '';
  const favorites = buildFavoriteChartData(stats);
  if (favorites.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 2;
    cell.textContent = 'Add candy to unlock neighborhood favorites.';
    row.appendChild(cell);
    zipBreakdownBody.appendChild(row);
    return;
  }
  favorites.forEach((entry) => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.textContent = entry.name;
    const countCell = document.createElement('td');
    countCell.textContent = Math.round(entry.pieces);
    row.append(nameCell, countCell);
    zipBreakdownBody.appendChild(row);
  });
}

function renderInsights() {
  const stats = state.familyStats ?? buildFamilyStats();
  if (!stats) return;
  const totalPieces = stats.totalPieces;
  totalTreatsEl.textContent = totalPieces;
  if (stats.kidSummaries.length > 0) {
    const breakdown = stats.kidSummaries
      .map((kid) => `${kid.name}: ${kid.totalPieces}`)
      .join(' · ');
    kidTreatBreakdownEl.textContent = breakdown;
  } else {
    kidTreatBreakdownEl.textContent = 'Add candy to build insights.';
  }
  zipDisplayEl.textContent = state.profile.zipCode || '—';
  const favorites = buildFavoriteChartData(stats);
  topZipCandyEl.textContent = favorites[0]?.name ?? 'more data';
  renderFavoriteChart(stats);
  renderColorChart(stats);
  renderZipBreakdown(stats);
}
function setActivePanel(key) {
  const registry = {
    family: familyHubSection,
    kids: kidManagerSection,
    candy: candyManagerSection,
    insights: insightsSection,
  };
  Object.entries(registry).forEach(([panel, element]) => {
    if (!element) return;
    if (panel === key) {
      showElement(element);
    } else {
      hideElement(element);
    }
  });
  panelButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.panelTarget === key);
  });
}

function renderAll() {
  renderKidSelect();
  renderKidCards();
  renderCandyTable();
  renderFamilyHub();
  renderInsights();
  updateLimitBanners();
  updateSubscriptionUI();
}

function handleActivateSubscription() {
  state.profile.subscriptionStatus = 'active';
  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 1);
  state.profile.subscriptionExpiry = expiry.toISOString();
  state.profile.candyVaultUnlocked = true;
  persistState();
  updateSubscriptionUI();
  updateLimitBanners();
}

function handleKidUpgradeConfirm() {
  state.profile.paidKidSlots += 1;
  persistState();
  updateLimitBanners();
  kidUpgradeDialog.close('confirm');
}

function handleCandyUpgradeConfirm() {
  state.profile.candyVaultUnlocked = true;
  persistState();
  updateLimitBanners();
  candyUpgradeDialog.close('confirm');
}

function promptForZip() {
  if (!zipDialog.open) {
    zipInput.value = state.profile.zipCode ?? '';
    zipDialog.showModal();
  }
}

function handleZipSave(event) {
  event.preventDefault();
  const value = zipInput.value.trim();
  if (!value) return;
  state.profile.zipCode = value;
  persistState();
  zipDialog.close('confirm');
  renderInsights();
}

function bootstrapFromStorage() {
  const snapshot = loadStateFromStorage();
  if (snapshot) {
    applySnapshot(snapshot);
    if (snapshot.user) {
      state.user = snapshot.user;
      toggleAuthUI(true);
      updateUserBadge();
    }
  }
}

function startDemoIfNeeded() {
  if (state.user || state.kids.size > 0) return;
  const demo = createSampleState();
  applySnapshot(demo);
  state.user = DEMO_USER;
  toggleAuthUI(true);
  updateUserBadge();
  persistState();
}

function handleSignIn() {
  if (!state.user) {
    state.user = DEMO_USER;
    const snapshot = loadStateFromStorage();
    if (!snapshot || (snapshot && (!snapshot.kids || snapshot.kids.length === 0))) {
      const demo = createSampleState();
      applySnapshot(demo);
    }
  }
  toggleAuthUI(true);
  updateUserBadge();
  renderAll();
  setActivePanel('family');
  persistState();
  if (!state.profile.zipCode) {
    promptForZip();
  }
}

function handleSignOut() {
  state.user = null;
  state.profile = {
    subscriptionStatus: 'trial',
    subscriptionExpiry: null,
    freeKidSlots: FREE_KID_LIMIT,
    paidKidSlots: 0,
    freeCandyTypes: FREE_CANDY_TYPE_LIMIT,
    candyVaultUnlocked: false,
    zipCode: '',
  };
  state.parentWins = 0;
  state.kids.clear();
  state.currentKidId = null;
  state.familyStats = null;
  state.quest = null;
  state.spotlightKidId = null;
  toggleAuthUI(false);
  clearStateStorage();
}

function handleNavClick(event) {
  const target = event.currentTarget.dataset.panelTarget;
  if (target) {
    setActivePanel(target);
  }
}
function setupFilterListeners() {
  ratingFilterEl?.addEventListener('change', (event) => {
    state.filters.rating = event.target.value;
    renderCandyTable();
  });
  yearFilterEl?.addEventListener('change', (event) => {
    state.filters.year = event.target.value;
    renderCandyTable();
  });
  typeFilterEl?.addEventListener('change', (event) => {
    state.filters.type = event.target.value;
    renderCandyTable();
  });
  candySearchInput?.addEventListener('input', (event) => {
    state.filters.search = event.target.value.trim().toLowerCase();
    renderCandyTable();
  });
  clearCandyFiltersBtn?.addEventListener('click', () => {
    state.filters = { rating: 'all', year: 'all', type: 'all', search: '' };
    if (ratingFilterEl) ratingFilterEl.value = 'all';
    if (yearFilterEl) yearFilterEl.value = 'all';
    if (typeFilterEl) typeFilterEl.value = 'all';
    if (candySearchInput) candySearchInput.value = '';
    renderCandyTable();
  });
}

function setupGlobalListeners() {
  signInButton?.addEventListener('click', handleSignIn);
  signOutButton?.addEventListener('click', handleSignOut);
  activateSubscriptionBtn?.addEventListener('click', handleActivateSubscription);
  addKidBtn?.addEventListener('click', () => openKidDialog());
  addCandyBtn?.addEventListener('click', () => openCandyDialog());
  openKidUpgradeBtn?.addEventListener('click', () => kidUpgradeDialog.showModal());
  openCandyUpgradeBtn?.addEventListener('click', () => candyUpgradeDialog.showModal());
  kidUpgradeConfirm?.addEventListener('click', handleKidUpgradeConfirm);
  candyUpgradeConfirm?.addEventListener('click', handleCandyUpgradeConfirm);
  kidForm?.addEventListener('submit', handleKidSubmit);
  candyForm?.addEventListener('submit', handleCandySubmit);
  logParentWinBtn?.addEventListener('click', handleParentWin);
  kidDialog?.addEventListener('close', resetKidForm);
  candyDialog?.addEventListener('close', resetCandyForm);
  kidSelectEl?.addEventListener('change', (event) => {
    state.currentKidId = event.target.value;
    renderCandyTable();
    renderFamilyHub();
    renderInsights();
  });
  newQuestBtn?.addEventListener('click', () => {
    ensureQuest(state.familyStats ?? buildFamilyStats(), true);
    renderQuest(state.familyStats ?? buildFamilyStats());
  });
  cycleSpotlightBtn?.addEventListener('click', rotateSpotlight);
  refreshInsightsBtn?.addEventListener('click', renderInsights);
  zipSubmitBtn?.addEventListener('click', handleZipSave);
  panelButtons.forEach((button) => button.addEventListener('click', handleNavClick));
  document.querySelectorAll('[data-close]').forEach((element) => {
    element.addEventListener('click', (event) => {
      const dialog = element.closest('dialog');
      dialog?.close('dismiss');
    });
  });
}

async function init() {
  await loadCandyCatalog();
  bootstrapFromStorage();
  renderRatingButtons(selectedRating);
  setupFilterListeners();
  setupGlobalListeners();
  if (state.user) {
    toggleAuthUI(true);
    updateUserBadge();
    renderAll();
    setActivePanel('family');
    if (!state.profile.zipCode) {
      promptForZip();
    }
  } else {
    toggleAuthUI(false);
    startDemoIfNeeded();
    renderAll();
    setActivePanel('family');
  }
}

init();
