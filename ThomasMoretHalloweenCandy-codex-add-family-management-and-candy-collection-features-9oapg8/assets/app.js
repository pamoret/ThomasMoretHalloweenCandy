const FREE_KID_LIMIT = 2;
const FREE_CANDY_TYPE_LIMIT = 12;
const STORAGE_KEY = 'spooky-candy-cloud-state-v2';
const DEMO_USER = {
  uid: 'demo-parent',
  displayName: 'Demo Parent',
  photoURL: 'https://avatars.dicebear.com/api/bottts/candy-demo.svg',
};

const state = {
  user: null,
  profile: {
    subscriptionStatus: 'trial',
    subscriptionExpiry: null,
    freeKidSlots: FREE_KID_LIMIT,
    paidKidSlots: 0,
    freeCandyTypes: FREE_CANDY_TYPE_LIMIT,
    candyVaultUnlocked: false,
  },
  kids: new Map(),
  parentWins: 0,
  candyCatalog: [],
  currentKidId: null,
  favoriteChart: null,
  colorChart: null,
  candyFilters: {
  filters: {
    rating: 'all',
    year: 'all',
    type: 'all',
    search: '',
  },
  activePanel: 'family',
  currentQuest: null,
  familyStats: null,
  spotlightKidId: null,
  unsubscribers: {
    kids: null,
    catalog: null,
  },
};

let editingKidId = null;
let editingCandyId = null;
let selectedRating = 0;
const ratingMax = 5;
const ratingEmojis = ['💀', '🎃', '🍬', '🧙', '🌟'];
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
const activateSubscriptionBtn = document.getElementById('activateSubscription');
const paywallSection = document.getElementById('paywall');
const familyHubSection = document.getElementById('familyHub');
const kidManagerSection = document.getElementById('kidManager');
const candyManagerSection = document.getElementById('candyManager');
const insightsSection = document.getElementById('insights');
const kidListEl = document.getElementById('kidList');
const kidSelectEl = document.getElementById('kidSelect');
const addKidBtn = document.getElementById('addKid');
const addCandyBtn = document.getElementById('addCandy');
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
const familyRosterEl = document.getElementById('familyRoster');
const kidSlotsUsageEl = document.getElementById('kidSlotsUsage');
const openKidUpgradeBtn = document.getElementById('openKidUpgrade');
const kidLimitBanner = document.getElementById('kidLimitBanner');
const logParentWinBtn = document.getElementById('logParentWin');
const parentWinCountEl = document.getElementById('parentWinCount');
const familyKidCountEl = document.getElementById('familyKidCount');
const familyUniqueCandyEl = document.getElementById('familyUniqueCandy');
const familyAverageRatingEl = document.getElementById('familyAverageRating');
const familySparkleScoreEl = document.getElementById('familySparkleScore');
const familyKidHighlightsEl = document.getElementById('familyKidHighlights');
const questListEl = document.getElementById('questList');
const learningPromptsEl = document.getElementById('learningPrompts');
const candyFiltersBar = document.getElementById('candyFilters');
const ratingFilterEl = document.getElementById('ratingFilter');
const yearFilterEl = document.getElementById('yearFilter');
const typeFilterEl = document.getElementById('typeFilter');
const searchFilterInput = document.getElementById('searchFilter');
const clearFiltersBtn = document.getElementById('clearFilters');
const candyFilterSummaryEl = document.getElementById('candyFilterSummary');
const zipDisplayEl = document.getElementById('zipDisplay');
const topZipCandyEl = document.getElementById('topZipCandy');
const totalTreatsEl = document.getElementById('totalTreats');
const kidTreatBreakdownEl = document.getElementById('kidTreatBreakdown');
const refreshInsightsBtn = document.getElementById('refreshInsights');
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
const familyNav = document.getElementById('familyNav');
const panelButtons = familyNav ? familyNav.querySelectorAll('[data-panel-target]') : [];
const spotlightKidEl = document.getElementById('spotlightKid');
const cycleSpotlightBtn = document.getElementById('cycleSpotlight');
const familyStarMeterEl = document.getElementById('familyStarMeter');
const familyTimelineEl = document.getElementById('familyTimeline');
const familyClassroomEl = document.getElementById('familyClassroom');
const familyGoalsEl = document.getElementById('familyGoals');
const panelRegistry = {
  family: familyHubSection,
  kids: kidManagerSection,
  candy: candyManagerSection,
  insights: insightsSection,
};

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
const kidUpgradeDialog = document.getElementById('kidUpgradeDialog');
const kidUpgradeConfirm = document.getElementById('kidUpgradeConfirm');
const candyUpgradeDialog = document.getElementById('candyUpgradeDialog');
const candyUpgradeConfirm = document.getElementById('candyUpgradeConfirm');
const candyLimitMessage = candyLimitBanner?.querySelector('p');

const kidCardTemplate = document.getElementById('kidCardTemplate');
const candyRowTemplate = document.getElementById('candyRowTemplate');

function $(selector, base = document) {
  return base.querySelector(selector);
}

function hasStoredState() {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEY));
  } catch (error) {
    console.warn('Unable to access localStorage', error);
    return false;
  }
}

function generateId(prefix) {
  const suffix = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  return `${prefix}-${suffix}`;
}

async function loadCandyCatalog() {
  try {
    const response = await fetch('data/defaultCandyTypes.json');
    if (!response.ok) throw new Error('Failed to load candy list');
    const data = await response.json();
    state.candyCatalog = data.map((item) => ({
      id: item.id,
      name: item.name,
      emoji: item.emoji,
      color: item.color,
      category: item.category,
    }));
  } catch (error) {
    console.error('Unable to load candy catalog', error);
    state.candyCatalog = [
      { id: 'candy-chocolate', name: 'Chocolate Bar', emoji: '🍫', color: '#5D3A1A', category: 'Chocolate' },
      { id: 'candy-lollipop', name: 'Spiral Lollipop', emoji: '🍭', color: '#FF6EC7', category: 'Sugar' },
      { id: 'candy-gummy', name: 'Gummy Worms', emoji: '🐛', color: '#FF9A3C', category: 'Gummy' },
    ];
  }
  populateCandySelect();
}

function createSampleState() {
  const now = Date.now();
  const kidAId = generateId('kid');
  const kidBId = generateId('kid');
  const caramel = state.candyCatalog[0] ?? { id: 'candy-chocolate', name: 'Chocolate Bar', emoji: '🍫' };
  const lollipop = state.candyCatalog[1] ?? { id: 'candy-lollipop', name: 'Spiral Lollipop', emoji: '🍭' };
  const gummy = state.candyCatalog[2] ?? { id: 'candy-gummy', name: 'Gummy Worms', emoji: '🐛' };
  return {
    user: { ...DEMO_USER },
    profile: {
      subscriptionStatus: 'trial',
      subscriptionExpiry: new Date(now + 1000 * 60 * 60 * 24 * 30).toISOString(),
      freeKidSlots: FREE_KID_LIMIT,
      paidKidSlots: 0,
      freeCandyTypes: FREE_CANDY_TYPE_LIMIT,
      candyVaultUnlocked: false,
      zipCode: '94105',
    },
    parentWins: 1,
    kids: [
      {
        id: kidAId,
        name: 'Avery',
        favoriteCostume: 'Potion Master',
        birthYear: 2014,
        candies: [
          {
            id: generateId('candy'),
            catalogId: caramel.id,
            displayName: `${caramel.emoji ?? '🍬'} ${caramel.name}`,
            count: 18,
            rating: 5,
            notes: 'Shared 3 with a new friend.',
            updatedAt: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
            createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
          },
          {
            id: generateId('candy'),
            catalogId: gummy.id,
            displayName: `${gummy.emoji ?? '🍬'} ${gummy.name}`,
            count: 9,
            rating: 3,
            notes: 'Loved the neon colors!',
            updatedAt: new Date(now - 1000 * 60 * 90).toISOString(),
            createdAt: new Date(now - 1000 * 60 * 100).toISOString(),
          },
        ],
      },
      {
        id: kidBId,
        name: 'Nova',
        favoriteCostume: 'Galaxy Explorer',
        birthYear: 2011,
        candies: [
          {
            id: generateId('candy'),
            catalogId: lollipop.id,
            displayName: `${lollipop.emoji ?? '🍬'} ${lollipop.name}`,
            count: 12,
            rating: 4,
            notes: 'Perfect for trading at the swap table.',
            updatedAt: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
            createdAt: new Date(now - 1000 * 60 * 60 * 27).toISOString(),
          },
        ],
      },
    ],
  };
}

function loadStateFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.warn('Unable to read saved state', error);
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

function restoreState(snapshot) {
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
  if (state.kids.size > 0) {
    state.currentKidId = state.kids.keys().next().value;
  }
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
  return currentYear - year;
}

function renderRating(rating) {
  if (!rating || rating <= 0) return '—';
  return '⭐'.repeat(Math.max(1, Math.min(5, Number(rating))));
}

function renderRatingButtons(value = 0) {
  if (!ratingSelector) return;
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

function closeDialog(dialog) {
  if (dialog?.open) {
    dialog.close();
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
  if (dialog?.open) {
    dialog.close();
  }
}

function showElement(element) {
  element?.classList.remove('hidden');
}

function hideElement(element) {
  element?.classList.add('hidden');
}

function toggleAuthUI(isSignedIn) {
  if (isSignedIn) {
    hideElement(signInButton);
    showElement(userBadge);
    showElement(familyHubSection);
    showElement(kidManagerSection);
    showElement(candyManagerSection);
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

function isSubscriptionActive() {
  if (state.profile.subscriptionStatus !== 'active') return false;
  if (!state.profile.subscriptionExpiry) return false;
  const expiryDate = new Date(state.profile.subscriptionExpiry);
  return expiryDate.getTime() > Date.now();
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
  if (isSubscriptionActive() || state.profile.candyVaultUnlocked) {
    return Infinity;
  }
  return Number(state.profile.freeCandyTypes ?? FREE_CANDY_TYPE_LIMIT);
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

function canAddKid() {
  const allowed = getAllowedKidSlots();
  if (!Number.isFinite(allowed)) return true;
  return state.kids.size < allowed;
}

function getCandyYear(candy) {
  const date = new Date(candy.updatedAt ?? candy.createdAt ?? Date.now());
  if (Number.isNaN(date.getTime())) return null;
  return date.getFullYear();
}

function applyCandyFilters(candies) {
  return candies.filter((candy) => {
    const ratingFilter = state.candyFilters.rating;
    const rating = Number(candy.rating ?? 0);
    if (ratingFilter !== 'all') {
      if (ratingFilter === '0') {
        if (rating !== 0) return false;
      } else if (rating !== Number(ratingFilter)) {
        return false;
      }
    }
    if (state.candyFilters.year !== 'all') {
      const year = getCandyYear(candy);
      if (String(year) !== state.candyFilters.year) {
        return false;
      }
    }
    if (state.candyFilters.type !== 'all') {
      const key = candy.catalogId ?? `custom:${candy.displayName ?? candy.type ?? 'Candy'}`;
      if (key !== state.candyFilters.type) {
        return false;
      }
    }
    if (state.candyFilters.search) {
      const haystack = `${candy.displayName ?? ''} ${candy.notes ?? ''}`.toLowerCase();
      if (!haystack.includes(state.candyFilters.search)) {
        return false;
      }
    }
    return true;
  });
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
    hideElement(candyTableWrapper);
    showElement(candyEmptyState);
  } else {
    kidSelectEl.disabled = false;
    if (!state.currentKidId || !state.kids.has(state.currentKidId)) {
      state.currentKidId = state.kids.keys().next().value;
    }
    kidSelectEl.value = state.currentKidId;
    showElement(candyTableWrapper);
    hideElement(candyEmptyState);
  }
}

function renderKidCards() {
  if (!kidListEl) return;
  kidListEl.innerHTML = '';
  const fragment = document.createDocumentFragment();
  state.kids.forEach((kid, id) => {
    const instance = kidCardTemplate.content.firstElementChild.cloneNode(true);
    instance.dataset.id = id;
    $('.kid-name', instance).textContent = kid.name;
    $('.kid-costume', instance).textContent = kid.favoriteCostume
      ? `Favorite costume: ${kid.favoriteCostume}`
      : 'Favorite costume TBD';
    const age = computeAge(kid.birthYear);
    $('.kid-age', instance).textContent = age ? `${age} years old` : 'Age unknown';
    const totalCandy = kid.candies.reduce((sum, candy) => sum + Number(candy.count ?? 0), 0);
    const uniqueTypes = new Set(
      kid.candies.map((candy) => candy.catalogId ?? `custom:${candy.displayName ?? candy.type ?? 'Candy'}`),
    ).size;
    const ratedCandies = kid.candies.filter((candy) => Number(candy.rating ?? 0) > 0);
    const averageRating = ratedCandies.length
      ? ratedCandies.reduce((sum, candy) => sum + Number(candy.rating ?? 0), 0) / ratedCandies.length
      : 0;
    const favoriteCandy = ratedCandies.sort(
      (a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0),
    )[0];
    const summaryBits = [`${totalCandy} total pieces`, `${uniqueTypes} candy types`];
    if (averageRating > 0) {
      summaryBits.push(`${formatAverage(averageRating)}⭐ avg`);
    }
    if (favoriteCandy) {
      summaryBits.push(`Top: ${favoriteCandy.displayName ?? favoriteCandy.type}`);
    }
    $('.kid-summary', instance).textContent = summaryBits.join(' · ');
    $('.edit-kid', instance).addEventListener('click', () => openKidDialog(id));
    fragment.appendChild(instance);
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
    candies.map((candy) => candy.catalogId ?? `custom:${candy.displayName ?? candy.type ?? 'Candy'}`),
  ).size;
  const notesWords = candies.reduce((sum, candy) => {
    if (!candy.notes) return sum;
    const count = candy.notes.trim().split(/\s+/).filter(Boolean).length;
    return sum + count;
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
  candyTableBody.innerHTML = '';
  if (!state.currentKidId) {
    showElement(candyEmptyState);
    hideElement(candyTableWrapper);
    candySummaryBadges.innerHTML = '';
    return;
  }
  const kid = state.kids.get(state.currentKidId);
  if (!kid || kid.candies.length === 0) {
    showElement(candyEmptyState);
    hideElement(candyTableWrapper);
    candySummaryBadges.innerHTML = '';
    return;
  }
  hideElement(candyEmptyState);
  showElement(candyTableWrapper);
  const filtered = applyCandyFilters(kid.candies);
  renderCandySummary(kid, filtered);
  const fragment = document.createDocumentFragment();
  if (filtered.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.textContent = 'No candy matches the filters. Try clearing them for more treats!';
    row.appendChild(cell);
    fragment.appendChild(row);
  }
  filtered.forEach((candy) => {
    const row = candyRowTemplate.content.firstElementChild.cloneNode(true);
    row.dataset.id = candy.id;
    $('.candy-type', row).textContent = candy.displayName ?? candy.type ?? 'Candy';
    $('.candy-count', row).textContent = candy.count ?? 0;
    $('.candy-rating', row).textContent = renderRating(candy.rating);
    $('.candy-notes', row).textContent = candy.notes || '—';
    $('.candy-updated', row).textContent = formatTimestamp(candy.updatedAt);
    $('.edit-candy', row).addEventListener('click', () => openCandyDialog(candy.id));
    fragment.appendChild(row);
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

function setSelectOptions(selectEl, options, placeholder) {
  if (!selectEl) return;
  const previous = selectEl.value;
  selectEl.innerHTML = '';
  const fragment = document.createDocumentFragment();
  const base = document.createElement('option');
  base.value = 'all';
  base.textContent = placeholder;
  fragment.appendChild(base);
  options.forEach((option) => {
    const opt = document.createElement('option');
    opt.value = option.value;
    opt.textContent = option.label;
    fragment.appendChild(opt);
  });
  selectEl.appendChild(fragment);
  const hasPrevious = options.some((option) => option.value === previous);
  selectEl.value = hasPrevious ? previous : 'all';
  const key = selectEl === yearFilterEl ? 'year' : 'type';
  state.candyFilters[key] = selectEl.value;
}

function updateCandyFilterOptions() {
  const kid = state.kids.get(state.currentKidId);
  const yearOptions = [];
  const typeMap = new Map();
  if (kid) {
    const years = new Set();
    kid.candies.forEach((candy) => {
      const year = getCandyYear(candy);
      if (year) years.add(String(year));
      const key = candy.catalogId ?? `custom:${candy.displayName ?? candy.type ?? 'Candy'}`;
      const label = candy.displayName ?? candy.type ?? 'Candy';
      if (!typeMap.has(key)) {
        typeMap.set(key, label);
      }
    });
    Array.from(years)
      .sort((a, b) => Number(b) - Number(a))
      .forEach((year) => yearOptions.push({ value: year, label: year }));
  }
  const typeOptions = Array.from(typeMap.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
  setSelectOptions(yearFilterEl, yearOptions, 'All years');
  setSelectOptions(typeFilterEl, typeOptions, 'All candy');
}

function computeFamilySnapshot() {
  const roster = [];
  const uniqueCandy = new Map();
  let totalPieces = 0;
  let ratingSum = 0;
  let ratingCount = 0;
  let ratedCandyCount = 0;
  let notesWordCount = 0;
  const years = new Set();
  state.kids.forEach((kid, kidId) => {
    const kidName = kid.name ?? 'Mystery Kid';
    let kidPieces = 0;
    let kidRatingSum = 0;
    let kidRatingCount = 0;
    const kidUnique = new Set();
    let favoriteCandy = null;
    kid.candies.forEach((candy) => {
      const count = Number(candy.count ?? 0);
      kidPieces += count;
      totalPieces += count;
      const key = candy.catalogId ?? `custom:${candy.displayName ?? candy.type ?? 'Candy'}`;
      kidUnique.add(key);
      const rating = Number(candy.rating ?? 0);
      if (rating > 0) {
        kidRatingSum += rating;
        kidRatingCount += 1;
        ratingSum += rating;
        ratingCount += 1;
        ratedCandyCount += 1;
      }
      if (!favoriteCandy || rating > Number(favoriteCandy.rating ?? 0)) {
        favoriteCandy = candy;
      }
      const displayName = candy.displayName ?? candy.type ?? 'Candy';
      const entry = uniqueCandy.get(key) ?? { name: displayName, total: 0, ratingSum: 0, ratingCount: 0 };
      entry.total += count;
      if (rating > 0) {
        entry.ratingSum += rating;
        entry.ratingCount += 1;
      }
      uniqueCandy.set(key, entry);
      if (candy.notes) {
        notesWordCount += candy.notes.trim().split(/\s+/).filter(Boolean).length;
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

function collectUniqueCandyIdentifiers({ excludeCandyId = null } = {}) {
  const identifiers = new Set();
  state.kids.forEach((kid) => {
    (kid.candies ?? []).forEach((candy) => {
      if (excludeCandyId && candy.id === excludeCandyId) {
        return;
      }
      const identifier = getCandyIdentifier(candy);
      if (identifier) {
        identifiers.add(identifier);
      }
      const year = getCandyYear(candy);
      if (year) years.add(String(year));
    });
    const averageRating = kidRatingCount ? kidRatingSum / kidRatingCount : 0;
    roster.push({
      kidId,
      kidName,
      pieces: kidPieces,
      averageRating,
      uniqueCandy: kidUnique.size,
      favoriteCandy,
      notesLogged: kid.candies.length,
      birthYear: kid.birthYear ?? null,
    });
  });
  const uniqueCandyCount = uniqueCandy.size;
  const topKidByPieces = roster.reduce(
    (best, current) => (current.pieces > (best?.pieces ?? 0) ? current : best),
    null,
  );
  const topKidByRating = roster.reduce(
    (best, current) => (current.averageRating > (best?.averageRating ?? 0) ? current : best),
    null,
  );
  const topCandyOverall = Array.from(uniqueCandy.values()).reduce((best, current) => {
    const avg = current.ratingCount ? current.ratingSum / current.ratingCount : 0;
    if (!best || avg > (best.averageRating ?? 0)) {
      return { ...current, averageRating: avg };
    }
    return best;
  }, null);
  const sparkleScore = Math.round(
    totalPieces + uniqueCandyCount * 4 + (ratingCount ? (ratingSum / ratingCount) * 15 : 0) + state.parentWins * 6,
  );
  const averageRating = ratingCount ? ratingSum / ratingCount : 0;
  return {
    roster,
    uniqueCandyCount,
    totalPieces,
    averageRating,
    sparkleScore,
    ratedCandyCount,
    notesWordCount,
    topKidByPieces,
    topKidByRating,
    topCandyOverall,
    years: Array.from(years).sort((a, b) => Number(b) - Number(a)),
    uniqueCandyMap: uniqueCandy,
  return identifiers;
}

function countUniqueCandyTypes() {
  if (state.familyStats?.uniqueTypeCount != null) {
    return state.familyStats.uniqueTypeCount;
  }
  return collectUniqueCandyIdentifiers().size;
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
    ratingBands: [],
    timeline: [],
    uniqueTypeCount: 0,
    totalRatedEntries: 0,
    maxPieces: 0,
    timelineMaxTotal: 0,
  };
  const ratingTotals = { total: 0, count: 0 };
  const candyTotals = new Map();
  const ratingBandMap = new Map([
    [5, 0],
    [4, 0],
    [3, 0],
    [2, 0],
    [1, 0],
    [0, 0],
  ]);
  const timelineMap = new Map();
  const uniqueTypes = new Set();

  state.kids.forEach((kid, id) => {
    const candies = kid.candies ?? [];
    const pieces = candies.reduce((sum, candy) => sum + (Number(candy.count) || 0), 0);
    const entry = {
      id,
      name: kid.data?.name ?? 'Kid',
      pieces,
      entries: candies.length,
      favoriteCandy: null,
      averageRating: 0,
      badge: selectBadge(pieces),
      age: computeAge(kid.data?.birthYear) ?? null,
      uniqueTypes: 0,
      topRatedCandy: null,
      lastCandy: null,
    };
    const perCandy = new Map();
    const kidTypes = new Set();
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
      const identifier = getCandyIdentifier(candy) || displayName;
      kidTypes.add(identifier);
      uniqueTypes.add(identifier);
      const bandKey = ratingValue > 0 ? ratingValue : 0;
      ratingBandMap.set(bandKey, (ratingBandMap.get(bandKey) ?? 0) + 1);

      const year = deriveCandyYear(candy);
      const timelineEntry =
        timelineMap.get(year) ?? { total: 0, ratedCount: 0, favorites: new Map(), uniqueTypes: new Set() };
      timelineEntry.total += count;
      if (ratingValue > 0) {
        timelineEntry.ratedCount += 1;
        const existingScore = timelineEntry.favorites.get(displayName) ?? 0;
        timelineEntry.favorites.set(displayName, existingScore + ratingValue);
      }
      timelineEntry.uniqueTypes.add(identifier);
      timelineMap.set(year, timelineEntry);

      const existingKid = perCandy.get(displayName) ?? 0;
      perCandy.set(displayName, existingKid + count);

      const existing = candyTotals.get(identifier) ?? {
        name: displayName,
        total: 0,
        ratingTotal: 0,
        ratingCount: 0,
        emoji: candy.emoji ?? '🍬',
        latestYear: year,
      };
      existing.total += count;
      if (ratingValue > 0) {
        existing.ratingTotal += ratingValue;
        existing.ratingCount += 1;
      }
      existing.latestYear = Math.max(existing.latestYear, year);
      candyTotals.set(identifier, existing);
    });
    if (kidRatingCount > 0) {
      entry.averageRating = Number((kidRatingTotal / kidRatingCount).toFixed(2));
    }
    const favorite = Array.from(perCandy.entries()).sort((a, b) => b[1] - a[1])[0];
    entry.favoriteCandy = favorite ? favorite[0] : null;
    entry.uniqueTypes = kidTypes.size;
    const topRated = candies
      .filter((candy) => (candy.rating ?? 0) > 0)
      .sort((a, b) => {
        const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
        if (ratingDiff !== 0) return ratingDiff;
        return (b.count ?? 0) - (a.count ?? 0);
      })[0];
    if (topRated) {
      entry.topRatedCandy = {
        name: getCandyDisplayName(topRated),
        rating: topRated.rating ?? 0,
        emoji: topRated.emoji ?? '🍬',
      };
    }
    const recent = candies[0];
    if (recent) {
      entry.lastCandy = {
        name: getCandyDisplayName(recent),
        when: formatTimestamp(recent.updatedAt ?? recent.createdAt),
      };
    }
    stats.leaderboard.push(entry);
  });

  stats.leaderboard.sort((a, b) => b.pieces - a.pieces);
  stats.maxPieces = stats.leaderboard.length > 0 ? stats.leaderboard[0].pieces : 0;
  stats.averageRating = ratingTotals.count > 0 ? Number((ratingTotals.total / ratingTotals.count).toFixed(2)) : 0;
  stats.ratingBands = [5, 4, 3, 2, 1, 0].map((stars) => ({
    stars,
    count: ratingBandMap.get(stars) ?? 0,
  }));
  stats.totalRatedEntries = stats.ratingBands.reduce(
    (sum, item) => (item.stars > 0 ? sum + item.count : sum),
    0,
  );
  stats.uniqueTypeCount = uniqueTypes.size;
  stats.timeline = Array.from(timelineMap.entries())
    .map(([year, data]) => {
      const topCandyEntry = Array.from(data.favorites.entries()).sort((a, b) => b[1] - a[1])[0];
      return {
        year: Number(year),
        total: data.total,
        ratedCount: data.ratedCount,
        topCandy: topCandyEntry ? topCandyEntry[0] : null,
        uniqueTypes: data.uniqueTypes.size,
      };
    })
    .sort((a, b) => b.year - a.year)
    .slice(0, 6);
  stats.timelineMaxTotal = stats.timeline.reduce((max, entry) => Math.max(max, entry.total), 0);

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
  const fiveStarBand = stats.ratingBands?.find((band) => band.stars === 5);
  if (fiveStarBand && fiveStarBand.count > 0) {
    prompts.push(`Taste-test your ${fiveStarBand.count} five-star treats and rank them from smoothest to crunchiest.`);
  }
  if (stats.timeline.length > 1) {
    const newest = stats.timeline[0];
    const previous = stats.timeline[1];
    prompts.push(`Calculate how many more pieces you collected in ${newest.year} (${newest.total}) than ${previous.year} (${previous.total}).`);
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

function renderStarMeter(bands, totalEntries) {
  if (!familyStarMeterEl) {
    return;
  }
  familyStarMeterEl.innerHTML = '';
  if (!bands || bands.length === 0 || bands.every((band) => band.count === 0)) {
    const empty = document.createElement('p');
    empty.textContent = 'Log candy ratings to unlock the star meter.';
    familyStarMeterEl.appendChild(empty);
    return;
  }
  const total = totalEntries > 0 ? totalEntries : bands.reduce((sum, item) => sum + item.count, 0);
  bands.forEach((band) => {
    const row = document.createElement('div');
    row.className = 'star-row';
    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = band.stars === 0 ? 'Unrated' : `${band.stars}★`;
    const bar = document.createElement('div');
    bar.className = 'star-bar';
    const fill = document.createElement('span');
    const percentRaw = total > 0 ? (band.count / total) * 100 : 0;
    const width = percentRaw > 0 && percentRaw < 10 ? 10 : percentRaw;
    fill.style.width = `${Math.min(100, width)}%`;
    fill.style.opacity = percentRaw > 0 ? '1' : '0.2';
    fill.title = `${band.count} entries`;
    bar.appendChild(fill);
    const value = document.createElement('span');
    value.className = 'value';
    const percentDisplay = percentRaw > 0 ? Math.round(percentRaw) : 0;
    value.textContent = `${band.count} · ${percentDisplay}%`;
    row.append(label, bar, value);
    familyStarMeterEl.appendChild(row);
  });
}

function renderTimeline(timeline, maxTotal = 0) {
  if (!familyTimelineEl) {
    return;
  }
  familyTimelineEl.innerHTML = '';
  if (!timeline || timeline.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'Add candy to trace your yearly trail.';
    familyTimelineEl.appendChild(empty);
    return;
  }
  const effectiveMax = Math.max(maxTotal, ...timeline.map((entry) => entry.total), 1);
  timeline.forEach((entry) => {
    const row = document.createElement('div');
    row.className = 'timeline-row';
    const year = document.createElement('span');
    year.textContent = entry.year;
    const bar = document.createElement('div');
    bar.className = 'bar';
    const fill = document.createElement('span');
    fill.className = 'fill';
    const percentRaw = (entry.total / effectiveMax) * 100;
    const width = percentRaw > 0 && percentRaw < 12 ? 12 : percentRaw;
    fill.style.width = `${Math.min(100, width)}%`;
    fill.style.opacity = percentRaw > 0 ? '1' : '0.2';
    bar.appendChild(fill);
    const note = document.createElement('span');
    note.className = 'note';
    const favoriteText = entry.topCandy ? ` · ⭐ ${entry.topCandy}` : '';
    note.textContent = `${entry.total} pcs${favoriteText}`;
    bar.appendChild(note);
    bar.title = entry.topCandy ? `Top candy: ${entry.topCandy}` : `${entry.total} pieces logged`;
    row.append(year, bar);
    familyTimelineEl.appendChild(row);
  });
}

function buildClassroomLessons(stats) {
  const lessons = [];
  if (stats.totalPieces > 0) {
    const tens = Math.max(1, Math.floor(stats.totalPieces / 10));
    lessons.push({
      title: 'Math mission',
      text: `Bundle your ${stats.totalPieces} pieces into ${tens} groups of ten and count the leftovers together.`,
    });
  }
  const fiveStarBand = stats.ratingBands?.find((band) => band.stars === 5);
  if (fiveStarBand && fiveStarBand.count > 0) {
    lessons.push({
      title: 'Taste test lab',
      text: `Design a taste test for your ${fiveStarBand.count} five-star treats and describe each flavor.`,
    });
  }
  if (stats.timeline.length > 0) {
    const latest = stats.timeline[0];
    lessons.push({
      title: 'History compare',
      text: `Chart how ${latest.year}'s haul of ${latest.total} pieces compares to earlier years.`,
    });
  }
  if (stats.moodboard.length > 0) {
    const spotlight = stats.moodboard[0];
    lessons.push({
      title: 'Flavor vocabulary',
      text: `Brainstorm adjectives that match ${spotlight.name} — texture, color, and taste all count!`,
    });
  }
  const fallbacks = [
    {
      title: 'Imagination sketch',
      text: 'Draw the wrapper of your dream candy creation and label its secret ingredients.',
    },
    {
      title: 'Kindness challenge',
      text: 'Pick one candy to gift a neighbor and practice what you will say when you share it.',
    },
  ];
  while (lessons.length < 3 && fallbacks.length > 0) {
    lessons.push(fallbacks.shift());
  }
  return lessons.slice(0, 3);
}

function renderClassroom(lessons) {
  if (!familyClassroomEl) {
    return;
  }
  familyClassroomEl.innerHTML = '';
  if (!lessons || lessons.length === 0) {
    const empty = document.createElement('li');
    empty.textContent = 'Add candy to receive guided learning activities.';
    familyClassroomEl.appendChild(empty);
    return;
  }
  lessons.forEach((lesson) => {
    const item = document.createElement('li');
    const title = document.createElement('strong');
    title.textContent = lesson.title;
    const body = document.createElement('span');
    body.textContent = lesson.text;
    item.append(title, body);
    familyClassroomEl.appendChild(item);
  });
}

function buildFamilyGoals(stats) {
  const goals = [];
  const remaining = Math.max(0, FREE_CANDY_LIMIT - stats.uniqueTypeCount);
  if (remaining > 0) {
    const noun = remaining === 1 ? 'type' : 'types';
    goals.push({
      title: 'Discovery goal',
      text: `Log ${remaining} new candy ${noun} before the free plan limit unlocks the Stripe paywall.`,
    });
  } else {
    goals.push({
      title: 'Upgrade goal',
      text: 'You reached the free plan ceiling! Activate your Stripe family pass to keep adding new treats.',
    });
  }
  if (stats.leaderboard.length > 1) {
    const top = stats.leaderboard[0];
    const runner = stats.leaderboard[1];
    const diff = Math.max(0, top.pieces - runner.pieces) + 1;
    goals.push({
      title: 'Team challenge',
      text: `${runner.name} can catch ${top.name} by logging ${diff} more pieces together.`,
    });
  } else if (stats.leaderboard.length === 1) {
    const solo = stats.leaderboard[0];
    goals.push({
      title: 'Sharing mission',
      text: `Plan how ${solo.name} would split ${solo.pieces} pieces fairly with a friend or sibling.`,
    });
  }
  if (stats.timeline.length >= 2) {
    const newest = stats.timeline[0];
    const previous = stats.timeline[1];
    goals.push({
      title: 'Time traveler',
      text: `Compare ${previous.year} (${previous.total} pcs) to ${newest.year} (${newest.total} pcs) and predict next year.`,
    });
  }
  return goals.slice(0, 3);
}

function renderFamilyGoals(goals) {
  if (!familyGoalsEl) {
    return;
  }
  familyGoalsEl.innerHTML = '';
  if (!goals || goals.length === 0) {
    const empty = document.createElement('li');
    empty.textContent = 'Add candy entries to generate a family goal list.';
    familyGoalsEl.appendChild(empty);
    return;
  }
  goals.forEach((goal) => {
    const item = document.createElement('li');
    const title = document.createElement('strong');
    title.textContent = goal.title;
    const body = document.createElement('span');
    body.textContent = goal.text;
    item.append(title, body);
    familyGoalsEl.appendChild(item);
  });
}

function getSpotlightEntry(stats, advance = false) {
  if (!stats || stats.leaderboard.length === 0) {
    state.spotlightKidId = null;
    return null;
  }
  const ids = stats.leaderboard.map((entry) => entry.id);
  if (advance && state.spotlightKidId && ids.includes(state.spotlightKidId)) {
    const currentIndex = ids.indexOf(state.spotlightKidId);
    const nextIndex = (currentIndex + 1) % ids.length;
    state.spotlightKidId = ids[nextIndex];
  }
  if (!state.spotlightKidId || !ids.includes(state.spotlightKidId)) {
    state.spotlightKidId = ids[0];
  }
  return stats.leaderboard.find((entry) => entry.id === state.spotlightKidId) ?? null;
}

function renderSpotlight(stats) {
  if (!spotlightKidEl) {
    return;
  }
  spotlightKidEl.innerHTML = '';
  if (!stats || stats.leaderboard.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'Add a kid to highlight nightly victories.';
    spotlightKidEl.appendChild(empty);
    return;
  }
  const entry = getSpotlightEntry(stats);
  if (!entry) {
    const empty = document.createElement('p');
    empty.textContent = 'Add a kid to highlight nightly victories.';
    spotlightKidEl.appendChild(empty);
    return;
  }
  const heading = document.createElement('h4');
  heading.textContent = `${entry.badge.emoji} ${entry.name}`;
  const summary = document.createElement('p');
  const typeNoun = entry.uniqueTypes === 1 ? 'candy type' : 'candy types';
  if (entry.age) {
    summary.textContent = `${entry.age} yrs · ${entry.uniqueTypes} ${typeNoun}`;
  } else {
    summary.textContent = `${entry.uniqueTypes} ${typeNoun}`;
  }
  const meter = document.createElement('div');
  meter.className = 'spotlight-meter';
  const fill = document.createElement('span');
  const maxPieces = stats.maxPieces > 0 ? (entry.pieces / stats.maxPieces) * 100 : 0;
  const width = maxPieces > 0 && maxPieces < 12 ? 12 : maxPieces;
  fill.style.width = `${Math.min(100, width)}%`;
  fill.style.opacity = maxPieces > 0 ? '1' : '0.2';
  meter.title = `${entry.pieces} pieces logged`;
  meter.appendChild(fill);
  const progress = document.createElement('p');
  progress.className = 'spotlight-progress-label';
  progress.textContent = `${entry.pieces} pieces logged this season`;
  const statsList = document.createElement('ul');
  statsList.className = 'spotlight-stats';
  const addStat = (label, value) => {
    const item = document.createElement('li');
    const left = document.createElement('span');
    left.textContent = label;
    const right = document.createElement('span');
    right.textContent = value;
    item.append(left, right);
    statsList.appendChild(item);
  };
  addStat('Favorite treat', entry.favoriteCandy ?? 'Tasting in progress');
  const topRatingText = entry.topRatedCandy
    ? `${entry.topRatedCandy.rating}★ ${entry.topRatedCandy.name}`
    : 'No ratings yet';
  addStat('Top rating', topRatingText);
  const lastWhen = entry.lastCandy?.when && entry.lastCandy.when !== '—' ? entry.lastCandy.when : null;
  const lastCandyText = entry.lastCandy
    ? `${entry.lastCandy.name}${lastWhen ? ` · ${lastWhen}` : ''}`
    : 'Log a candy to start';
  addStat('Latest log', lastCandyText);
  addStat('Badge', `${entry.badge.emoji} ${entry.badge.label}`);
  spotlightKidEl.append(heading, summary, meter, progress, statsList);
}

function rotateSpotlightKid() {
  if (!state.familyStats) {
    return;
  }
  const entry = getSpotlightEntry(state.familyStats, true);
  if (entry) {
    renderSpotlight(state.familyStats);
  }
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
    renderStarMeter([], 0);
    renderTimeline([], 0);
    renderClassroom([]);
    renderFamilyGoals([]);
    renderSpotlight(stats);
    if (cycleSpotlightBtn) {
      cycleSpotlightBtn.classList.add('hidden');
      cycleSpotlightBtn.disabled = true;
    }
    familyQuestEl.textContent = 'Add a kid to conjure a family quest.';
    state.currentQuest = null;
    state.spotlightKidId = null;
    return;
  }
  const typeNoun = stats.uniqueTypeCount === 1 ? 'unique candy type' : 'unique candy types';
  familySummaryEl.textContent = `Tracking ${stats.kidCount} candy ${kidWord} with ${stats.totalPieces} pieces across ${stats.uniqueTypeCount}/${FREE_CANDY_LIMIT} ${typeNoun}.`;
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

  renderSpotlight(stats);
  renderStarMeter(stats.ratingBands, stats.totalEntries);
  renderTimeline(stats.timeline, stats.timelineMaxTotal);
  renderClassroom(buildClassroomLessons(stats));
  renderFamilyGoals(buildFamilyGoals(stats));
  if (cycleSpotlightBtn) {
    const hasRotation = stats.leaderboard.length > 1;
    cycleSpotlightBtn.classList.toggle('hidden', !hasRotation);
    cycleSpotlightBtn.disabled = !hasRotation;
  }
  renderMoodboard(stats.moodboard);
  ensureQuest(stats, false);
}

function showElement(element) {
  element?.classList.remove('hidden');
}

function hideElement(element) {
  element?.classList.add('hidden');
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
  const totalEntries = countUniqueCandyTypes();
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
      message = `Free plan limit reached (${FREE_CANDY_LIMIT} unique candy types). Activate your Stripe family pass to keep adding treats.`;
      addCandyBtn.disabled = true;
      addCandyBtn.title = 'Activate your family pass to add more unique candy types.';
    } else {
      const noun = remaining === 1 ? 'type' : 'types';
      message = `Free plan: ${remaining} unique candy ${noun} left before the Stripe paywall unlocks unlimited logging.`;
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

function setActivePanel(panelName) {
  const target = panelRegistry[panelName] ? panelName : 'family';
  state.activePanel = target;
  panelButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.panelTarget === target);
  });
  Object.entries(panelRegistry).forEach(([key, section]) => {
    if (!section) return;
    if (key === target) {
      showElement(section);
    } else {
      hideElement(section);
    }
  });
  if (target === 'insights') {
    const active = isSubscriptionActive(state.profile);
    if (active) {
      hideElement(paywallSection);
      showElement(insightsSection);
    } else {
      showElement(paywallSection);
      hideElement(insightsSection);
    }
  } else {
    hideElement(paywallSection);
  }
}

function toggleAuthUI(isSignedIn) {
  if (isSignedIn) {
    hideElement(signInButton);
    showElement(userBadge);
    showElement(familyHubSection);
    showElement(kidManagerSection);
    showElement(candyManagerSection);
    if (familyNav) {
      showElement(familyNav);
    }
  } else {
    showElement(signInButton);
    hideElement(userBadge);
    hideElement(familyHubSection);
    hideElement(kidManagerSection);
    hideElement(candyManagerSection);
    hideElement(insightsSection);
    hideElement(paywallSection);
    if (familyNav) {
      hideElement(familyNav);
    }
    panelButtons.forEach((button) => button.classList.remove('active'));
    state.activePanel = 'family';
  }
}

function isSubscriptionActive() {
  if (state.profile.subscriptionStatus !== 'active') return false;
  if (!state.profile.subscriptionExpiry) return false;
  const expiryDate = new Date(state.profile.subscriptionExpiry);
  return expiryDate.getTime() > Date.now();
}

function planHasUnlimitedKids() {
  return isSubscriptionActive();
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
  } else {
    const expiryText = profile.subscriptionExpiry
      ? formatTimestamp(profile.subscriptionExpiry)
      : '—';
    subscriptionStatusEl.textContent = `Renew to unlock · expired ${expiryText}`;
  }
  updateCandyLimitUI();
  setActivePanel(state.activePanel);
}

function getAllowedKidSlots() {
  if (planHasUnlimitedKids()) return Infinity;
  const base = Number(state.profile.freeKidSlots ?? FREE_KID_LIMIT);
  const paid = Number(state.profile.paidKidSlots ?? 0);
  return base + paid;
}

function getCandyTypeLimit() {
  if (isSubscriptionActive() || state.profile.candyVaultUnlocked) {
    return Infinity;
  }
  return Number(state.profile.freeCandyTypes ?? FREE_CANDY_TYPE_LIMIT);
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

function canAddKid() {
  const allowed = getAllowedKidSlots();
  if (!Number.isFinite(allowed)) return true;
  return state.kids.size < allowed;
}

function getCandyYear(candy) {
  const date = new Date(candy.updatedAt ?? candy.createdAt ?? Date.now());
  if (Number.isNaN(date.getTime())) return null;
  return date.getFullYear();
}

function applyCandyFilters(candies) {
  return candies.filter((candy) => {
    const ratingFilter = state.candyFilters.rating;
    const rating = Number(candy.rating ?? 0);
    if (ratingFilter !== 'all') {
      if (ratingFilter === '0') {
        if (rating !== 0) return false;
      } else if (rating !== Number(ratingFilter)) {
        return false;
      }
    }
    if (state.candyFilters.year !== 'all') {
      const year = getCandyYear(candy);
      if (String(year) !== state.candyFilters.year) {
        return false;
      }
    }
    if (state.candyFilters.type !== 'all') {
      const key = candy.catalogId ?? `custom:${candy.displayName ?? candy.type ?? 'Candy'}`;
      if (key !== state.candyFilters.type) {
        return false;
      }
    }
    if (state.candyFilters.search) {
      const haystack = `${candy.displayName ?? ''} ${candy.notes ?? ''}`.toLowerCase();
      if (!haystack.includes(state.candyFilters.search)) {
        return false;
      }
    }
    return true;
  });
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
    hideElement(candyTableWrapper);
    showElement(candyEmptyState);
  } else {
    kidSelectEl.disabled = false;
    if (!state.currentKidId || !state.kids.has(state.currentKidId)) {
      state.currentKidId = state.kids.keys().next().value;
    }
    kidSelectEl.value = state.currentKidId;
    showElement(candyTableWrapper);
    hideElement(candyEmptyState);
  }
}

function renderKidCards() {
  if (!kidListEl) return;
  kidListEl.innerHTML = '';
  const fragment = document.createDocumentFragment();
  state.kids.forEach((kid, id) => {
    const instance = kidCardTemplate.content.firstElementChild.cloneNode(true);
    instance.dataset.id = id;
    $('.kid-name', instance).textContent = kid.name;
    $('.kid-costume', instance).textContent = kid.favoriteCostume
      ? `Favorite costume: ${kid.favoriteCostume}`
      : 'Favorite costume TBD';
    const age = computeAge(kid.birthYear);
    $('.kid-age', instance).textContent = age ? `${age} years old` : 'Age unknown';
    const totalCandy = kid.candies.reduce((sum, candy) => sum + Number(candy.count ?? 0), 0);
    const uniqueTypes = new Set(
      kid.candies.map((candy) => candy.catalogId ?? `custom:${candy.displayName ?? candy.type ?? 'Candy'}`),
    ).size;
    const ratedCandies = kid.candies.filter((candy) => Number(candy.rating ?? 0) > 0);
    const averageRating = ratedCandies.length
      ? ratedCandies.reduce((sum, candy) => sum + Number(candy.rating ?? 0), 0) / ratedCandies.length
      : 0;
    const favoriteCandy = ratedCandies.sort(
      (a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0),
    )[0];
    const summaryBits = [`${totalCandy} total pieces`, `${uniqueTypes} candy types`];
    if (averageRating > 0) {
      summaryBits.push(`${formatAverage(averageRating)}⭐ avg`);
    }
    if (favoriteCandy) {
      summaryBits.push(`Top: ${favoriteCandy.displayName ?? favoriteCandy.type}`);
    }
    $('.kid-summary', instance).textContent = summaryBits.join(' · ');
    $('.edit-kid', instance).addEventListener('click', () => openKidDialog(id));
    const age = computeAge(kid.data.birthYear);
    instance.querySelector('.kid-age').textContent = age
      ? `${age} years old`
      : 'Age unknown';
    const totalCandy = kid.candies.reduce((sum, candy) => sum + (Number(candy.count) || 0), 0);
    const favorite = kid.candies
      .map((candy) => ({ name: getCandyDisplayName(candy), total: Number(candy.count) || 0 }))
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
    candies.map((candy) => candy.catalogId ?? `custom:${candy.displayName ?? candy.type ?? 'Candy'}`),
  ).size;
  const notesWords = candies.reduce((sum, candy) => {
    if (!candy.notes) return sum;
    const count = candy.notes.trim().split(/\s+/).filter(Boolean).length;
    return sum + count;
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
  candyTableBody.innerHTML = '';
  if (!state.currentKidId) {
    showElement(candyEmptyState);
    hideElement(candyTableWrapper);
    candySummaryBadges.innerHTML = '';
    return;
  }
  const kid = state.kids.get(state.currentKidId);
  if (!kid || kid.candies.length === 0) {
    showElement(candyEmptyState);
    hideElement(candyTableWrapper);
    candySummaryBadges.innerHTML = '';
    return;
  }
  const kid = state.kids.get(state.currentKidId);
  if (!kid || kid.candies.length === 0) {
    showElement(candyEmptyState);
    hideElement(candyTableWrapper);
    candySummaryBadges.innerHTML = '';
    return;
  }
  const kid = state.kids.get(state.currentKidId);
  if (!kid || kid.candies.length === 0) {
    showElement(candyEmptyState);
    hideElement(candyTableWrapper);
    candySummaryBadges.innerHTML = '';
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
  const filtered = applyCandyFilters(kid.candies);
  renderCandySummary(kid, filtered);
  updateFilterOptions(kid);
  const filtered = applyCandyFilters(kid.candies);
  updateFilterSummary(kid.candies.length, filtered.length);
  const fragment = document.createDocumentFragment();
  if (filtered.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.textContent = 'No candy matches the filters. Try clearing them for more treats!';
    row.appendChild(cell);
    fragment.appendChild(row);
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
    $('.candy-type', row).textContent = candy.displayName ?? candy.type ?? 'Candy';
    $('.candy-count', row).textContent = candy.count ?? 0;
    $('.candy-rating', row).textContent = renderRating(candy.rating);
    $('.candy-notes', row).textContent = candy.notes || '—';
    $('.candy-updated', row).textContent = formatTimestamp(candy.updatedAt);
    $('.edit-candy', row).addEventListener('click', () => openCandyDialog(candy.id));
    row.querySelector('.candy-type').textContent = candy.displayName ?? candy.type;
    row.querySelector('.candy-count').textContent = Number(candy.count ?? 0);
    row.querySelector('.candy-year').textContent = deriveCandyYear(candy);
    row.querySelector('.candy-rating').textContent = renderRating(candy.rating);
    row.querySelector('.candy-notes').textContent = candy.notes || '—';
    row.querySelector('.candy-updated').textContent = formatTimestamp(candy.updatedAt);
    row.querySelector('.edit-candy').addEventListener('click', () => openCandyDialog(candy.id));
    fragment.appendChild(row);
  });
  candyTableBody.appendChild(fragment);
}

function setSelectOptions(selectEl, options, placeholder) {
  if (!selectEl) return;
  const previous = selectEl.value;
  selectEl.innerHTML = '';
  const fragment = document.createDocumentFragment();
  const base = document.createElement('option');
  base.value = 'all';
  base.textContent = placeholder;
  fragment.appendChild(base);
  options.forEach((option) => {
    const opt = document.createElement('option');
    opt.value = option.value;
    opt.textContent = option.label;
    fragment.appendChild(opt);
  });
  selectEl.appendChild(fragment);
  const hasPrevious = options.some((option) => option.value === previous);
  selectEl.value = hasPrevious ? previous : 'all';
  const key = selectEl === yearFilterEl ? 'year' : 'type';
  state.candyFilters[key] = selectEl.value;
}

function updateCandyFilterOptions() {
  const kid = state.kids.get(state.currentKidId);
  const yearOptions = [];
  const typeMap = new Map();
  if (kid) {
    const years = new Set();
    kid.candies.forEach((candy) => {
      const year = getCandyYear(candy);
      if (year) years.add(String(year));
      const key = candy.catalogId ?? `custom:${candy.displayName ?? candy.type ?? 'Candy'}`;
      const label = candy.displayName ?? candy.type ?? 'Candy';
      if (!typeMap.has(key)) {
        typeMap.set(key, label);
      }
    });
    Array.from(years)
      .sort((a, b) => Number(b) - Number(a))
      .forEach((year) => yearOptions.push({ value: year, label: year }));
  }
  const typeOptions = Array.from(typeMap.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
  setSelectOptions(yearFilterEl, yearOptions, 'All years');
  setSelectOptions(typeFilterEl, typeOptions, 'All candy');
}

function computeFamilySnapshot() {
  const roster = [];
  const uniqueCandy = new Map();
  let totalPieces = 0;
  let ratingSum = 0;
  let ratingCount = 0;
  let ratedCandyCount = 0;
  let notesWordCount = 0;
  const years = new Set();
  state.kids.forEach((kid, kidId) => {
    const kidName = kid.name ?? 'Mystery Kid';
    let kidPieces = 0;
    let kidRatingSum = 0;
    let kidRatingCount = 0;
    const kidUnique = new Set();
    let favoriteCandy = null;
    kid.candies.forEach((candy) => {
      const count = Number(candy.count ?? 0);
      kidPieces += count;
      totalPieces += count;
      const key = candy.catalogId ?? `custom:${candy.displayName ?? candy.type ?? 'Candy'}`;
      kidUnique.add(key);
      const rating = Number(candy.rating ?? 0);
      if (rating > 0) {
        kidRatingSum += rating;
        kidRatingCount += 1;
        ratingSum += rating;
        ratingCount += 1;
        ratedCandyCount += 1;
      }
      if (!favoriteCandy || rating > Number(favoriteCandy.rating ?? 0)) {
        favoriteCandy = candy;
      }
      const displayName = candy.displayName ?? candy.type ?? 'Candy';
      const entry = uniqueCandy.get(key) ?? { name: displayName, total: 0, ratingSum: 0, ratingCount: 0 };
      entry.total += count;
      if (rating > 0) {
        entry.ratingSum += rating;
        entry.ratingCount += 1;
      }
      uniqueCandy.set(key, entry);
      if (candy.notes) {
        notesWordCount += candy.notes.trim().split(/\s+/).filter(Boolean).length;
      }
      const year = getCandyYear(candy);
      if (year) years.add(String(year));
    });
    const averageRating = kidRatingCount ? kidRatingSum / kidRatingCount : 0;
    roster.push({
      kidId,
      kidName,
      pieces: kidPieces,
      averageRating,
      uniqueCandy: kidUnique.size,
      favoriteCandy,
      notesLogged: kid.candies.length,
      birthYear: kid.birthYear ?? null,
    });
  });
  const uniqueCandyCount = uniqueCandy.size;
  const topKidByPieces = roster.reduce(
    (best, current) => (current.pieces > (best?.pieces ?? 0) ? current : best),
    null,
  );
  const topKidByRating = roster.reduce(
    (best, current) => (current.averageRating > (best?.averageRating ?? 0) ? current : best),
    null,
  );
  const topCandyOverall = Array.from(uniqueCandy.values()).reduce((best, current) => {
    const avg = current.ratingCount ? current.ratingSum / current.ratingCount : 0;
    if (!best || avg > (best.averageRating ?? 0)) {
      return { ...current, averageRating: avg };
    }
    return best;
  }, null);
  const sparkleScore = Math.round(
    totalPieces + uniqueCandyCount * 4 + (ratingCount ? (ratingSum / ratingCount) * 15 : 0) + state.parentWins * 6,
  );
  const averageRating = ratingCount ? ratingSum / ratingCount : 0;
  return {
    roster,
    uniqueCandyCount,
    totalPieces,
    averageRating,
    sparkleScore,
    ratedCandyCount,
    notesWordCount,
    topKidByPieces,
    topKidByRating,
    topCandyOverall,
    years: Array.from(years).sort((a, b) => Number(b) - Number(a)),
    uniqueCandyMap: uniqueCandy,
  };
}

function createHighlightCard({ title, text, subtext }) {
  const card = document.createElement('article');
  card.className = 'highlight-card';
  const heading = document.createElement('h4');
  heading.textContent = title;
  const primary = document.createElement('p');
  primary.textContent = text;
  card.append(heading, primary);
  if (subtext) {
    const detail = document.createElement('p');
    detail.className = 'roster-meta';
    detail.textContent = subtext;
    card.appendChild(detail);
  }
  return card;
}

function renderFamilyRoster(snapshot) {
  if (!familyRosterEl) return;
  familyRosterEl.innerHTML = '';
  if (snapshot.roster.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'roster-item';
    emptyItem.textContent = 'Add your first kid to start the candy adventure!';
    familyRosterEl.appendChild(emptyItem);
    return;
  }
  const sorted = [...snapshot.roster].sort((a, b) => a.kidName.localeCompare(b.kidName));
  const fragment = document.createDocumentFragment();
  sorted.forEach((entry) => {
    const item = document.createElement('li');
    item.className = 'roster-item';
    if (entry.kidId === state.currentKidId) {
      item.classList.add('active');
    }
    const button = document.createElement('button');
    button.type = 'button';
    if (entry.kidId === state.currentKidId) {
      button.setAttribute('aria-current', 'true');
    }
    const nameSpan = document.createElement('span');
    nameSpan.textContent = entry.kidName;
    const metaSpan = document.createElement('span');
    metaSpan.className = 'roster-meta';
    const ratingText = entry.averageRating > 0 ? `${formatAverage(entry.averageRating)}⭐` : 'No ratings yet';
    metaSpan.textContent = `${entry.pieces} pcs · ${ratingText}`;
    button.append(nameSpan, metaSpan);
    button.addEventListener('click', () => {
      state.currentKidId = entry.kidId;
      renderKidSelect();
      renderCandyTable();
      renderFamilyHub();
      renderInsights();
    });
    item.appendChild(button);
    fragment.appendChild(item);
  });
  familyRosterEl.appendChild(fragment);
}

function renderFamilyHighlights(snapshot) {
  if (!familyKidHighlightsEl) return;
  familyKidHighlightsEl.innerHTML = '';
  const highlights = [];
  const selectedKid = snapshot.roster.find((entry) => entry.kidId === state.currentKidId);
  if (selectedKid) {
    const fav = selectedKid.favoriteCandy;
    highlights.push({
      title: `${selectedKid.kidName}'s spotlight`,
      text: `${selectedKid.pieces} treats · ${selectedKid.uniqueCandy} types explored`,
      subtext: fav
        ? `Favorite rating: ${fav.displayName ?? fav.type} (${renderRating(fav.rating)}).`
        : 'Log ratings to reveal favorites!',
    });
  }
  if (snapshot.topKidByPieces) {
    highlights.push({
      title: 'Candy Captain',
      text: `${snapshot.topKidByPieces.kidName} collected ${snapshot.topKidByPieces.pieces} pieces!`,
      subtext: 'Invite them to share strategy tips with siblings.',
    });
  }
  if (snapshot.topKidByRating && snapshot.topKidByRating.averageRating > 0) {
    highlights.push({
      title: 'Flavor Critic',
      text: `${snapshot.topKidByRating.kidName} averages ${formatAverage(snapshot.topKidByRating.averageRating)}⭐`,
      subtext: 'Try comparing notes on what makes a five-star treat.',
    });
  }
  if (snapshot.topCandyOverall) {
    highlights.push({
      title: 'Top Treat of the Night',
      text: `${snapshot.topCandyOverall.name} (${formatAverage(snapshot.topCandyOverall.averageRating)}⭐)`,
      subtext: `Total pieces logged: ${snapshot.topCandyOverall.total}`,
    });
  }
  if (state.parentWins > 0) {
    highlights.push({
      title: 'Kudos Tracker',
      text: `${state.parentWins} moments celebrated`,
      subtext: 'Keep cheering brave trick-or-treating!',
    });
  }
  if (highlights.length === 0) {
    highlights.push({
      title: 'Ready to explore',
      text: 'Add candy logs to unlock family highlights.',
    });
  }
  const fragment = document.createDocumentFragment();
  highlights.slice(0, 4).forEach((item) => fragment.appendChild(createHighlightCard(item)));
  familyKidHighlightsEl.appendChild(fragment);
}

function renderQuestBoard(snapshot) {
  if (!questListEl) return;
  questListEl.innerHTML = '';
  const quests = [
    {
      title: 'Candy Critic',
      description: 'Rate 10 candies with stars to earn your tasting badge.',
      progress: snapshot.ratedCandyCount / 10,
      label: `${snapshot.ratedCandyCount}/10 rated treats`,
    },
    {
      title: 'Rainbow Hunter',
      description: 'Collect 8 unique candy types across the neighborhood.',
      progress: snapshot.uniqueCandyCount / 8,
      label: `${snapshot.uniqueCandyCount} of 8 colors found`,
    },
    {
      title: 'Storyteller Supreme',
      description: 'Write 50 words of tasting notes across your family.',
      progress: snapshot.notesWordCount / 50,
      label: `${snapshot.notesWordCount} of 50 story words`,
    },
    {
      title: 'High-Five Hive',
      description: 'Log 5 kudos moments when kids show kindness or bravery.',
      progress: state.parentWins / 5,
      label: `${state.parentWins}/5 kudos shared`,
    },
  ];
  const fragment = document.createDocumentFragment();
  quests.forEach((quest) => {
    const card = document.createElement('div');
    card.className = 'quest-card';
    const heading = document.createElement('h4');
    heading.textContent = quest.title;
    const description = document.createElement('p');
    description.textContent = quest.description;
    const progress = document.createElement('div');
    progress.className = 'quest-progress';
    const bar = document.createElement('span');
    bar.style.width = `${Math.min(100, Math.round(Math.max(0, quest.progress) * 100))}%`;
    progress.appendChild(bar);
    const label = document.createElement('p');
    label.className = 'roster-meta';
    label.textContent = quest.label;
    card.append(heading, description, progress, label);
    fragment.appendChild(card);
  });
  questListEl.appendChild(fragment);
}

function renderLearningPrompts(snapshot) {
  if (!learningPromptsEl) return;
  learningPromptsEl.innerHTML = '';
  const prompts = [];
  if (snapshot.topKidByPieces) {
    prompts.push(
      `Ask ${snapshot.topKidByPieces.kidName} to sort their ${snapshot.topKidByPieces.pieces} treats by type and count them by tens.`,
    );
  }
  if (snapshot.topKidByRating && snapshot.topKidByRating.averageRating > 0) {
    prompts.push(
      `Compare two top-rated candies. Why did ${snapshot.topKidByRating.kidName} give them ${formatAverage(snapshot.topKidByRating.averageRating)} stars?`,
    );
  }
  if (snapshot.topCandyOverall) {
    prompts.push(
      `Describe the taste of ${snapshot.topCandyOverall.name} using all five senses. What made it a ${formatAverage(snapshot.topCandyOverall.averageRating)} star hit?`,
    );
  }
  const selectedKid = snapshot.roster.find((entry) => entry.kidId === state.currentKidId);
  if (selectedKid) {
    prompts.push(
      `Plan next year's costume together. How could ${selectedKid.kidName} trade candy to fund their dream outfit?`,
    );
  }
  if (state.parentWins === 0) {
    prompts.push('Start a gratitude chain: each kid shares one kind moment from trick-or-treating.');
  }
  if (prompts.length === 0) {
    prompts.push('Log candy adventures to unlock custom conversation starters!');
  }
  }
  const sorted = [...snapshot.roster].sort((a, b) => a.kidName.localeCompare(b.kidName));
  const fragment = document.createDocumentFragment();
  sorted.forEach((entry) => {
    const item = document.createElement('li');
    item.className = 'roster-item';
    if (entry.kidId === state.currentKidId) {
      item.classList.add('active');
    }
    const button = document.createElement('button');
    button.type = 'button';
    if (entry.kidId === state.currentKidId) {
      button.setAttribute('aria-current', 'true');
    }
    const nameSpan = document.createElement('span');
    nameSpan.textContent = entry.kidName;
    const metaSpan = document.createElement('span');
    metaSpan.className = 'roster-meta';
    const ratingText = entry.averageRating > 0 ? `${formatAverage(entry.averageRating)}⭐` : 'No ratings yet';
    metaSpan.textContent = `${entry.pieces} pcs · ${ratingText}`;
    button.append(nameSpan, metaSpan);
    button.addEventListener('click', () => {
      state.currentKidId = entry.kidId;
      renderKidSelect();
      renderCandyTable();
      renderFamilyHub();
      renderInsights();
    });
    item.appendChild(button);
    fragment.appendChild(item);
  });
  familyRosterEl.appendChild(fragment);
}

function renderFamilyHighlights(snapshot) {
  if (!familyKidHighlightsEl) return;
  familyKidHighlightsEl.innerHTML = '';
  const highlights = [];
  const selectedKid = snapshot.roster.find((entry) => entry.kidId === state.currentKidId);
  if (selectedKid) {
    const fav = selectedKid.favoriteCandy;
    highlights.push({
      title: `${selectedKid.kidName}'s spotlight`,
      text: `${selectedKid.pieces} treats · ${selectedKid.uniqueCandy} types explored`,
      subtext: fav
        ? `Favorite rating: ${fav.displayName ?? fav.type} (${renderRating(fav.rating)}).`
        : 'Log ratings to reveal favorites!',
    });
  }
  if (snapshot.topKidByPieces) {
    highlights.push({
      title: 'Candy Captain',
      text: `${snapshot.topKidByPieces.kidName} collected ${snapshot.topKidByPieces.pieces} pieces!`,
      subtext: 'Invite them to share strategy tips with siblings.',
    });
  }
  if (snapshot.topKidByRating && snapshot.topKidByRating.averageRating > 0) {
    highlights.push({
      title: 'Flavor Critic',
      text: `${snapshot.topKidByRating.kidName} averages ${formatAverage(snapshot.topKidByRating.averageRating)}⭐`,
      subtext: 'Try comparing notes on what makes a five-star treat.',
    });
  }
  if (snapshot.topCandyOverall) {
    highlights.push({
      title: 'Top Treat of the Night',
      text: `${snapshot.topCandyOverall.name} (${formatAverage(snapshot.topCandyOverall.averageRating)}⭐)`,
      subtext: `Total pieces logged: ${snapshot.topCandyOverall.total}`,
    });
  }
  if (state.parentWins > 0) {
    highlights.push({
      title: 'Kudos Tracker',
      text: `${state.parentWins} moments celebrated`,
      subtext: 'Keep cheering brave trick-or-treating!',
    });
  }
  if (highlights.length === 0) {
    highlights.push({
      title: 'Ready to explore',
      text: 'Add candy logs to unlock family highlights.',
    });
  }
  const fragment = document.createDocumentFragment();
  highlights.slice(0, 4).forEach((item) => fragment.appendChild(createHighlightCard(item)));
  familyKidHighlightsEl.appendChild(fragment);
}

function renderQuestBoard(snapshot) {
  if (!questListEl) return;
  questListEl.innerHTML = '';
  const quests = [
    {
      title: 'Candy Critic',
      description: 'Rate 10 candies with stars to earn your tasting badge.',
      progress: snapshot.ratedCandyCount / 10,
      label: `${snapshot.ratedCandyCount}/10 rated treats`,
    },
    {
      title: 'Rainbow Hunter',
      description: 'Collect 8 unique candy types across the neighborhood.',
      progress: snapshot.uniqueCandyCount / 8,
      label: `${snapshot.uniqueCandyCount} of 8 colors found`,
    },
    {
      title: 'Storyteller Supreme',
      description: 'Write 50 words of tasting notes across your family.',
      progress: snapshot.notesWordCount / 50,
      label: `${snapshot.notesWordCount} of 50 story words`,
    },
    {
      title: 'High-Five Hive',
      description: 'Log 5 kudos moments when kids show kindness or bravery.',
      progress: state.parentWins / 5,
      label: `${state.parentWins}/5 kudos shared`,
    },
  ];
  const fragment = document.createDocumentFragment();
  quests.forEach((quest) => {
    const card = document.createElement('div');
    card.className = 'quest-card';
    const heading = document.createElement('h4');
    heading.textContent = quest.title;
    const description = document.createElement('p');
    description.textContent = quest.description;
    const progress = document.createElement('div');
    progress.className = 'quest-progress';
    const bar = document.createElement('span');
    bar.style.width = `${Math.min(100, Math.round(Math.max(0, quest.progress) * 100))}%`;
    progress.appendChild(bar);
    const label = document.createElement('p');
    label.className = 'roster-meta';
    label.textContent = quest.label;
    card.append(heading, description, progress, label);
    fragment.appendChild(card);
  });
  questListEl.appendChild(fragment);
}

function renderLearningPrompts(snapshot) {
  if (!learningPromptsEl) return;
  learningPromptsEl.innerHTML = '';
  const prompts = [];
  if (snapshot.topKidByPieces) {
    prompts.push(
      `Ask ${snapshot.topKidByPieces.kidName} to sort their ${snapshot.topKidByPieces.pieces} treats by type and count them by tens.`,
    );
  }
  if (snapshot.topKidByRating && snapshot.topKidByRating.averageRating > 0) {
    prompts.push(
      `Compare two top-rated candies. Why did ${snapshot.topKidByRating.kidName} give them ${formatAverage(snapshot.topKidByRating.averageRating)} stars?`,
    );
  }
  if (snapshot.topCandyOverall) {
    prompts.push(
      `Describe the taste of ${snapshot.topCandyOverall.name} using all five senses. What made it a ${formatAverage(snapshot.topCandyOverall.averageRating)} star hit?`,
    );
  }
  const selectedKid = snapshot.roster.find((entry) => entry.kidId === state.currentKidId);
  if (selectedKid) {
    prompts.push(
      `Plan next year's costume together. How could ${selectedKid.kidName} trade candy to fund their dream outfit?`,
    );
  }
  if (state.parentWins === 0) {
    prompts.push('Start a gratitude chain: each kid shares one kind moment from trick-or-treating.');
  }
  if (prompts.length === 0) {
    prompts.push('Log candy adventures to unlock custom conversation starters!');
  }
}

function updateCandyFilterOptions() {
  const kid = state.kids.get(state.currentKidId);
  const yearOptions = [];
  const typeMap = new Map();
  if (kid) {
    const years = new Set();
    kid.candies.forEach((candy) => {
      const year = getCandyYear(candy);
      if (year) years.add(String(year));
      const key = candy.catalogId ?? `custom:${candy.displayName ?? candy.type ?? 'Candy'}`;
      const label = candy.displayName ?? candy.type ?? 'Candy';
      if (!typeMap.has(key)) {
        typeMap.set(key, label);
      }
    });
    Array.from(years)
      .sort((a, b) => Number(b) - Number(a))
      .forEach((year) => yearOptions.push({ value: year, label: year }));
  }
  const typeOptions = Array.from(typeMap.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
  setSelectOptions(yearFilterEl, yearOptions, 'All years');
  setSelectOptions(typeFilterEl, typeOptions, 'All candy');
}

function computeFamilySnapshot() {
  const roster = [];
  const uniqueCandy = new Map();
  let totalPieces = 0;
  let ratingSum = 0;
  let ratingCount = 0;
  let ratedCandyCount = 0;
  let notesWordCount = 0;
  const years = new Set();
  state.kids.forEach((kid, kidId) => {
    const kidName = kid.name ?? 'Mystery Kid';
    let kidPieces = 0;
    let kidRatingSum = 0;
    let kidRatingCount = 0;
    const kidUnique = new Set();
    let favoriteCandy = null;
    kid.candies.forEach((candy) => {
      const count = Number(candy.count ?? 0);
      kidPieces += count;
      totalPieces += count;
      const key = candy.catalogId ?? `custom:${candy.displayName ?? candy.type ?? 'Candy'}`;
      kidUnique.add(key);
      const rating = Number(candy.rating ?? 0);
      if (rating > 0) {
        kidRatingSum += rating;
        kidRatingCount += 1;
        ratingSum += rating;
        ratingCount += 1;
        ratedCandyCount += 1;
      }
      if (!favoriteCandy || rating > Number(favoriteCandy.rating ?? 0)) {
        favoriteCandy = candy;
      }
      const displayName = candy.displayName ?? candy.type ?? 'Candy';
      const entry = uniqueCandy.get(key) ?? { name: displayName, total: 0, ratingSum: 0, ratingCount: 0 };
      entry.total += count;
      if (rating > 0) {
        entry.ratingSum += rating;
        entry.ratingCount += 1;
      }
      uniqueCandy.set(key, entry);
      if (candy.notes) {
        notesWordCount += candy.notes.trim().split(/\s+/).filter(Boolean).length;
function computeAggregates() {
  const totals = new Map();
  const ratings = new Map();
  const byKid = new Map();
  const colors = new Map();

  state.kids.forEach((kid) => {
    const kidTotal = kid.candies.reduce((sum, candy) => sum + (Number(candy.count) || 0), 0);
    byKid.set(kid.data.name, kidTotal);
    kid.candies.forEach((candy) => {
      const previous = totals.get(candy.displayName) ?? 0;
      totals.set(candy.displayName, previous + (Number(candy.count) || 0));
      const ratingEntry = ratings.get(candy.displayName) ?? { total: 0, count: 0 };
      if (candy.rating) {
        ratingEntry.total += candy.rating;
        ratingEntry.count += 1;
      }
      ratings.set(candy.displayName, ratingEntry);
      if (candy.colorHex) {
        const colorEntry = colors.get(candy.colorHex) ?? { total: 0, name: candy.colorName ?? 'Candy' };
        colorEntry.total += Number(candy.count) || 0;
        colors.set(candy.colorHex, colorEntry);
      }
      const year = getCandyYear(candy);
      if (year) years.add(String(year));
    });
    const averageRating = kidRatingCount ? kidRatingSum / kidRatingCount : 0;
    roster.push({
      kidId,
      kidName,
      pieces: kidPieces,
      averageRating,
      uniqueCandy: kidUnique.size,
      favoriteCandy,
      notesLogged: kid.candies.length,
      birthYear: kid.birthYear ?? null,
    });
  });
  const uniqueCandyCount = uniqueCandy.size;
  const topKidByPieces = roster.reduce(
    (best, current) => (current.pieces > (best?.pieces ?? 0) ? current : best),
    null,
  );
  const topKidByRating = roster.reduce(
    (best, current) => (current.averageRating > (best?.averageRating ?? 0) ? current : best),
    null,
  );
  const topCandyOverall = Array.from(uniqueCandy.values()).reduce((best, current) => {
    const avg = current.ratingCount ? current.ratingSum / current.ratingCount : 0;
    if (!best || avg > (best.averageRating ?? 0)) {
      return { ...current, averageRating: avg };
    }
    return best;
  }, null);
  const sparkleScore = Math.round(
    totalPieces + uniqueCandyCount * 4 + (ratingCount ? (ratingSum / ratingCount) * 15 : 0) + state.parentWins * 6,
  );
  const averageRating = ratingCount ? ratingSum / ratingCount : 0;
  return {
    roster,
    uniqueCandyCount,
    totalPieces,
    averageRating,
    sparkleScore,
    ratedCandyCount,
    notesWordCount,
    topKidByPieces,
    topKidByRating,
    topCandyOverall,
    years: Array.from(years).sort((a, b) => Number(b) - Number(a)),
    uniqueCandyMap: uniqueCandy,
  };
}

function createHighlightCard({ title, text, subtext }) {
  const card = document.createElement('article');
  card.className = 'highlight-card';
  const heading = document.createElement('h4');
  heading.textContent = title;
  const primary = document.createElement('p');
  primary.textContent = text;
  card.append(heading, primary);
  if (subtext) {
    const detail = document.createElement('p');
    detail.className = 'roster-meta';
    detail.textContent = subtext;
    card.appendChild(detail);
  }
  return card;
}

function renderFamilyRoster(snapshot) {
  if (!familyRosterEl) return;
  familyRosterEl.innerHTML = '';
  if (snapshot.roster.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'roster-item';
    emptyItem.textContent = 'Add your first kid to start the candy adventure!';
    familyRosterEl.appendChild(emptyItem);
    return;
  }
  const sorted = [...snapshot.roster].sort((a, b) => a.kidName.localeCompare(b.kidName));
  const fragment = document.createDocumentFragment();
  sorted.forEach((entry) => {
    const item = document.createElement('li');
    item.className = 'roster-item';
    if (entry.kidId === state.currentKidId) {
      item.classList.add('active');
    }
    const button = document.createElement('button');
    button.type = 'button';
    if (entry.kidId === state.currentKidId) {
      button.setAttribute('aria-current', 'true');
    }
    const nameSpan = document.createElement('span');
    nameSpan.textContent = entry.kidName;
    const metaSpan = document.createElement('span');
    metaSpan.className = 'roster-meta';
    const ratingText = entry.averageRating > 0 ? `${formatAverage(entry.averageRating)}⭐` : 'No ratings yet';
    metaSpan.textContent = `${entry.pieces} pcs · ${ratingText}`;
    button.append(nameSpan, metaSpan);
    button.addEventListener('click', () => {
      state.currentKidId = entry.kidId;
      renderKidSelect();
      renderCandyTable();
      renderFamilyHub();
      renderInsights();
    });
    item.appendChild(button);
    fragment.appendChild(item);
  });
  familyRosterEl.appendChild(fragment);
}

function renderFamilyHighlights(snapshot) {
  if (!familyKidHighlightsEl) return;
  familyKidHighlightsEl.innerHTML = '';
  const highlights = [];
  const selectedKid = snapshot.roster.find((entry) => entry.kidId === state.currentKidId);
  if (selectedKid) {
    const fav = selectedKid.favoriteCandy;
    highlights.push({
      title: `${selectedKid.kidName}'s spotlight`,
      text: `${selectedKid.pieces} treats · ${selectedKid.uniqueCandy} types explored`,
      subtext: fav
        ? `Favorite rating: ${fav.displayName ?? fav.type} (${renderRating(fav.rating)}).`
        : 'Log ratings to reveal favorites!',
    });
  }
  if (snapshot.topKidByPieces) {
    highlights.push({
      title: 'Candy Captain',
      text: `${snapshot.topKidByPieces.kidName} collected ${snapshot.topKidByPieces.pieces} pieces!`,
      subtext: 'Invite them to share strategy tips with siblings.',
    });
  }
  if (snapshot.topKidByRating && snapshot.topKidByRating.averageRating > 0) {
    highlights.push({
      title: 'Flavor Critic',
      text: `${snapshot.topKidByRating.kidName} averages ${formatAverage(snapshot.topKidByRating.averageRating)}⭐`,
      subtext: 'Try comparing notes on what makes a five-star treat.',
    });
  }
  if (snapshot.topCandyOverall) {
    highlights.push({
      title: 'Top Treat of the Night',
      text: `${snapshot.topCandyOverall.name} (${formatAverage(snapshot.topCandyOverall.averageRating)}⭐)`,
      subtext: `Total pieces logged: ${snapshot.topCandyOverall.total}`,
    });
  }
  if (state.parentWins > 0) {
    highlights.push({
      title: 'Kudos Tracker',
      text: `${state.parentWins} moments celebrated`,
      subtext: 'Keep cheering brave trick-or-treating!',
    });
  }
  if (highlights.length === 0) {
    highlights.push({
      title: 'Ready to explore',
      text: 'Add candy logs to unlock family highlights.',
    });
  }
  const fragment = document.createDocumentFragment();
  highlights.slice(0, 4).forEach((item) => fragment.appendChild(createHighlightCard(item)));
  familyKidHighlightsEl.appendChild(fragment);
}

function renderQuestBoard(snapshot) {
  if (!questListEl) return;
  questListEl.innerHTML = '';
  const quests = [
    {
      title: 'Candy Critic',
      description: 'Rate 10 candies with stars to earn your tasting badge.',
      progress: snapshot.ratedCandyCount / 10,
      label: `${snapshot.ratedCandyCount}/10 rated treats`,
    },
    {
      title: 'Rainbow Hunter',
      description: 'Collect 8 unique candy types across the neighborhood.',
      progress: snapshot.uniqueCandyCount / 8,
      label: `${snapshot.uniqueCandyCount} of 8 colors found`,
    },
    {
      title: 'Storyteller Supreme',
      description: 'Write 50 words of tasting notes across your family.',
      progress: snapshot.notesWordCount / 50,
      label: `${snapshot.notesWordCount} of 50 story words`,
    },
    {
      title: 'High-Five Hive',
      description: 'Log 5 kudos moments when kids show kindness or bravery.',
      progress: state.parentWins / 5,
      label: `${state.parentWins}/5 kudos shared`,
    },
  ];
  const fragment = document.createDocumentFragment();
  quests.forEach((quest) => {
    const card = document.createElement('div');
    card.className = 'quest-card';
    const heading = document.createElement('h4');
    heading.textContent = quest.title;
    const description = document.createElement('p');
    description.textContent = quest.description;
    const progress = document.createElement('div');
    progress.className = 'quest-progress';
    const bar = document.createElement('span');
    bar.style.width = `${Math.min(100, Math.round(Math.max(0, quest.progress) * 100))}%`;
    progress.appendChild(bar);
    const label = document.createElement('p');
    label.className = 'roster-meta';
    label.textContent = quest.label;
    card.append(heading, description, progress, label);
    fragment.appendChild(card);
  });
  questListEl.appendChild(fragment);
}

function renderLearningPrompts(snapshot) {
  if (!learningPromptsEl) return;
  learningPromptsEl.innerHTML = '';
  const prompts = [];
  if (snapshot.topKidByPieces) {
    prompts.push(
      `Ask ${snapshot.topKidByPieces.kidName} to sort their ${snapshot.topKidByPieces.pieces} treats by type and count them by tens.`,
    );
  }
  if (snapshot.topKidByRating && snapshot.topKidByRating.averageRating > 0) {
    prompts.push(
      `Compare two top-rated candies. Why did ${snapshot.topKidByRating.kidName} give them ${formatAverage(snapshot.topKidByRating.averageRating)} stars?`,
    );
  }
  if (snapshot.topCandyOverall) {
    prompts.push(
      `Describe the taste of ${snapshot.topCandyOverall.name} using all five senses. What made it a ${formatAverage(snapshot.topCandyOverall.averageRating)} star hit?`,
    );
  }
  const selectedKid = snapshot.roster.find((entry) => entry.kidId === state.currentKidId);
  if (selectedKid) {
    prompts.push(
      `Plan next year's costume together. How could ${selectedKid.kidName} trade candy to fund their dream outfit?`,
    );
  }
  if (state.parentWins === 0) {
    prompts.push('Start a gratitude chain: each kid shares one kind moment from trick-or-treating.');
  }
  if (prompts.length === 0) {
    prompts.push('Log candy adventures to unlock custom conversation starters!');
  }
  const fragment = document.createDocumentFragment();
  prompts.slice(0, 5).forEach((prompt) => {
    const li = document.createElement('li');
    li.textContent = prompt;
    fragment.appendChild(li);
  });
  learningPromptsEl.appendChild(fragment);
}

function updateParentWinsDisplay() {
  if (parentWinCountEl) {
    parentWinCountEl.textContent = `${state.parentWins} kudos logged`;
  }
}

function renderFamilyHub() {
  if (!state.user) return;
  const snapshot = computeFamilySnapshot();
  familyKidCountEl.textContent = state.kids.size;
  familyUniqueCandyEl.textContent = snapshot.uniqueCandyCount;
  familyAverageRatingEl.textContent = formatAverage(snapshot.averageRating);
  familySparkleScoreEl.textContent = snapshot.sparkleScore;
  renderFamilyRoster(snapshot);
  renderFamilyHighlights(snapshot);
  renderQuestBoard(snapshot);
  renderLearningPrompts(snapshot);
  updateParentWinsDisplay();
  updateCandyFilterOptions();
}

function updateLimitBanners() {
  if (kidSlotsUsageEl) {
    const allowed = getAllowedKidSlots();
    const kidCount = state.kids.size;
    if (Number.isFinite(allowed)) {
      kidSlotsUsageEl.textContent = `${Math.min(kidCount, allowed)}/${allowed}`;
    } else {
      kidSlotsUsageEl.textContent = `${kidCount} · unlimited`;
    }
    if (Number.isFinite(allowed) && kidCount >= allowed) {
      showElement(kidLimitBanner);
    } else {
      hideElement(kidLimitBanner);
    }
    if (canAddKid()) {
      addKidBtn.textContent = '+ Add Kid';
    } else {
      addKidBtn.textContent = 'Unlock Kid Pass';
    }
  }
  if (candyLimitBanner) {
    const limit = getCandyTypeLimit();
    const uniqueCount = countUniqueCandyTypes();
    if (Number.isFinite(limit) && uniqueCount >= limit) {
      if (candyLimitMessage) {
        candyLimitMessage.textContent = `Candy vault full! (${uniqueCount}/${limit} types). Unlock unlimited candy types with our Stripe Candy Vault pass.`;
      }
      showElement(candyLimitBanner);
      addCandyBtn.textContent = 'Unlock Candy Vault';
    } else {
      hideElement(candyLimitBanner);
      addCandyBtn.textContent = '+ Add Candy';
    }
  }
}

function ensureCharts() {
  if (typeof window.Chart === 'undefined') {
    console.warn('Chart.js is not available');
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
        plugins: { legend: { display: false } },
      },
    });
  }
  if (!state.colorChart) {
    state.colorChart = new window.Chart(colorCanvas, {
      type: 'doughnut',
      data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
      },
    });
  }
  return true;
}

function pickPalette(index) {
  const palette = ['#FF6EC7', '#FF9A3C', '#4FB0AE', '#A55EEA', '#FFC857', '#F05454', '#7BD389'];
  return palette[index % palette.length];
}

function renderInsights() {
  if (!state.user) return;
  const snapshot = computeFamilySnapshot();
  const zipCode = state.profile.zipCode || '00000';
  zipDisplayEl.textContent = zipCode;
  topZipCandyEl.textContent = snapshot.topCandyOverall?.name ?? '—';
  totalTreatsEl.textContent = snapshot.totalPieces;
  if (snapshot.roster.length > 0) {
    const breakdown = snapshot.roster
      .map((entry) => `${entry.kidName}: ${entry.pieces} pcs`)
      .join(' · ');
    kidTreatBreakdownEl.textContent = breakdown;
  } else {
    kidTreatBreakdownEl.textContent = 'Add kids to unlock insights!';
  }
  zipBreakdownBody.innerHTML = '';
  const fragment = document.createDocumentFragment();
}

function renderFamilyHighlights(snapshot) {
  if (!familyKidHighlightsEl) return;
  familyKidHighlightsEl.innerHTML = '';
  const highlights = [];
  const selectedKid = snapshot.roster.find((entry) => entry.kidId === state.currentKidId);
  if (selectedKid) {
    const fav = selectedKid.favoriteCandy;
    highlights.push({
      title: `${selectedKid.kidName}'s spotlight`,
      text: `${selectedKid.pieces} treats · ${selectedKid.uniqueCandy} types explored`,
      subtext: fav
        ? `Favorite rating: ${fav.displayName ?? fav.type} (${renderRating(fav.rating)}).`
        : 'Log ratings to reveal favorites!',
    });
  }
  if (snapshot.topKidByPieces) {
    highlights.push({
      title: 'Candy Captain',
      text: `${snapshot.topKidByPieces.kidName} collected ${snapshot.topKidByPieces.pieces} pieces!`,
      subtext: 'Invite them to share strategy tips with siblings.',
    });
  }
  if (snapshot.topKidByRating && snapshot.topKidByRating.averageRating > 0) {
    highlights.push({
      title: 'Flavor Critic',
      text: `${snapshot.topKidByRating.kidName} averages ${formatAverage(snapshot.topKidByRating.averageRating)}⭐`,
      subtext: 'Try comparing notes on what makes a five-star treat.',
    });
  }
  if (snapshot.topCandyOverall) {
    highlights.push({
      title: 'Top Treat of the Night',
      text: `${snapshot.topCandyOverall.name} (${formatAverage(snapshot.topCandyOverall.averageRating)}⭐)`,
      subtext: `Total pieces logged: ${snapshot.topCandyOverall.total}`,
    });
  }
  if (state.parentWins > 0) {
    highlights.push({
      title: 'Kudos Tracker',
      text: `${state.parentWins} moments celebrated`,
      subtext: 'Keep cheering brave trick-or-treating!',
    });
  }
  if (highlights.length === 0) {
    highlights.push({
      title: 'Ready to explore',
      text: 'Add candy logs to unlock family highlights.',
    });
  }
  const fragment = document.createDocumentFragment();
  highlights.slice(0, 4).forEach((item) => fragment.appendChild(createHighlightCard(item)));
  familyKidHighlightsEl.appendChild(fragment);
}

function renderQuestBoard(snapshot) {
  if (!questListEl) return;
  questListEl.innerHTML = '';
  const quests = [
    {
      title: 'Candy Critic',
      description: 'Rate 10 candies with stars to earn your tasting badge.',
      progress: snapshot.ratedCandyCount / 10,
      label: `${snapshot.ratedCandyCount}/10 rated treats`,
    },
    {
      title: 'Rainbow Hunter',
      description: 'Collect 8 unique candy types across the neighborhood.',
      progress: snapshot.uniqueCandyCount / 8,
      label: `${snapshot.uniqueCandyCount} of 8 colors found`,
    },
    {
      title: 'Storyteller Supreme',
      description: 'Write 50 words of tasting notes across your family.',
      progress: snapshot.notesWordCount / 50,
      label: `${snapshot.notesWordCount} of 50 story words`,
    },
    {
      title: 'High-Five Hive',
      description: 'Log 5 kudos moments when kids show kindness or bravery.',
      progress: state.parentWins / 5,
      label: `${state.parentWins}/5 kudos shared`,
    },
  ];
  const fragment = document.createDocumentFragment();
  quests.forEach((quest) => {
    const card = document.createElement('div');
    card.className = 'quest-card';
    const heading = document.createElement('h4');
    heading.textContent = quest.title;
    const description = document.createElement('p');
    description.textContent = quest.description;
    const progress = document.createElement('div');
    progress.className = 'quest-progress';
    const bar = document.createElement('span');
    bar.style.width = `${Math.min(100, Math.round(Math.max(0, quest.progress) * 100))}%`;
    progress.appendChild(bar);
    const label = document.createElement('p');
    label.className = 'roster-meta';
    label.textContent = quest.label;
    card.append(heading, description, progress, label);
    fragment.appendChild(card);
  });
  questListEl.appendChild(fragment);
}

function renderLearningPrompts(snapshot) {
  if (!learningPromptsEl) return;
  learningPromptsEl.innerHTML = '';
  const prompts = [];
  if (snapshot.topKidByPieces) {
    prompts.push(
      `Ask ${snapshot.topKidByPieces.kidName} to sort their ${snapshot.topKidByPieces.pieces} treats by type and count them by tens.`,
    );
  }
  if (snapshot.topKidByRating && snapshot.topKidByRating.averageRating > 0) {
    prompts.push(
      `Compare two top-rated candies. Why did ${snapshot.topKidByRating.kidName} give them ${formatAverage(snapshot.topKidByRating.averageRating)} stars?`,
    );
  }
  if (snapshot.topCandyOverall) {
    prompts.push(
      `Describe the taste of ${snapshot.topCandyOverall.name} using all five senses. What made it a ${formatAverage(snapshot.topCandyOverall.averageRating)} star hit?`,
    );
  }
  const selectedKid = snapshot.roster.find((entry) => entry.kidId === state.currentKidId);
  if (selectedKid) {
    prompts.push(
      `Plan next year's costume together. How could ${selectedKid.kidName} trade candy to fund their dream outfit?`,
    );
  }
  if (state.parentWins === 0) {
    prompts.push('Start a gratitude chain: each kid shares one kind moment from trick-or-treating.');
  }
  if (prompts.length === 0) {
    prompts.push('Log candy adventures to unlock custom conversation starters!');
  }
  const fragment = document.createDocumentFragment();
  prompts.slice(0, 5).forEach((prompt) => {
    const li = document.createElement('li');
    li.textContent = prompt;
    fragment.appendChild(li);
  });
  learningPromptsEl.appendChild(fragment);
}

function updateParentWinsDisplay() {
  if (parentWinCountEl) {
    parentWinCountEl.textContent = `${state.parentWins} kudos logged`;
  }
}

function renderFamilyHub() {
  if (!state.user) return;
  const snapshot = computeFamilySnapshot();
  familyKidCountEl.textContent = state.kids.size;
  familyUniqueCandyEl.textContent = snapshot.uniqueCandyCount;
  familyAverageRatingEl.textContent = formatAverage(snapshot.averageRating);
  familySparkleScoreEl.textContent = snapshot.sparkleScore;
  renderFamilyRoster(snapshot);
  renderFamilyHighlights(snapshot);
  renderQuestBoard(snapshot);
  renderLearningPrompts(snapshot);
  updateParentWinsDisplay();
  updateCandyFilterOptions();
}

function updateLimitBanners() {
  if (kidSlotsUsageEl) {
    const allowed = getAllowedKidSlots();
    const kidCount = state.kids.size;
    if (Number.isFinite(allowed)) {
      kidSlotsUsageEl.textContent = `${Math.min(kidCount, allowed)}/${allowed}`;
    } else {
      kidSlotsUsageEl.textContent = `${kidCount} · unlimited`;
    }
    if (Number.isFinite(allowed) && kidCount >= allowed) {
      showElement(kidLimitBanner);
    } else {
      hideElement(kidLimitBanner);
    }
    if (canAddKid()) {
      addKidBtn.textContent = '+ Add Kid';
    } else {
      addKidBtn.textContent = 'Unlock Kid Pass';
    }
  }
  if (candyLimitBanner) {
    const limit = getCandyTypeLimit();
    const uniqueCount = countUniqueCandyTypes();
    if (Number.isFinite(limit) && uniqueCount >= limit) {
      if (candyLimitMessage) {
        candyLimitMessage.textContent = `Candy vault full! (${uniqueCount}/${limit} types). Unlock unlimited candy types with our Stripe Candy Vault pass.`;
      }
      showElement(candyLimitBanner);
      addCandyBtn.textContent = 'Unlock Candy Vault';
    } else {
      hideElement(candyLimitBanner);
      addCandyBtn.textContent = '+ Add Candy';
    }
  }
}

function ensureCharts() {
  if (typeof window.Chart === 'undefined') {
    console.warn('Chart.js is not available');
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
        plugins: { legend: { display: false } },
      },
    });
  }
  if (!state.colorChart) {
    state.colorChart = new window.Chart(colorCanvas, {
      type: 'doughnut',
      data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
      },
    });
  }
  return true;
}

function pickPalette(index) {
  const palette = ['#FF6EC7', '#FF9A3C', '#4FB0AE', '#A55EEA', '#FFC857', '#F05454', '#7BD389'];
  return palette[index % palette.length];
}

function renderInsights() {
  if (!state.user) return;
  const snapshot = computeFamilySnapshot();
  const zipCode = state.profile.zipCode || '00000';
  zipDisplayEl.textContent = zipCode;
  topZipCandyEl.textContent = snapshot.topCandyOverall?.name ?? '—';
  totalTreatsEl.textContent = snapshot.totalPieces;
  if (snapshot.roster.length > 0) {
    const breakdown = snapshot.roster
      .map((entry) => `${entry.kidName}: ${entry.pieces} pcs`)
      .join(' · ');
    kidTreatBreakdownEl.textContent = breakdown;
  } else {
    kidTreatBreakdownEl.textContent = 'Add kids to unlock insights!';
  }
  zipBreakdownBody.innerHTML = '';
  const fragment = document.createDocumentFragment();
  Array.from(snapshot.uniqueCandyMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .forEach((entry, index) => {
      const row = document.createElement('tr');
      const candyCell = document.createElement('td');
      candyCell.textContent = entry.name;
      const countCell = document.createElement('td');
      countCell.textContent = entry.total;
      row.append(candyCell, countCell);
      row.style.setProperty('--rank-color', pickPalette(index));
      fragment.appendChild(row);
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
  zipBreakdownBody.appendChild(fragment);
  if (!ensureCharts()) return;
  const favoriteChart = state.favoriteChart;
  const colorChart = state.colorChart;
  const labels = [];
  const data = [];
  const colors = [];
  Array.from(snapshot.uniqueCandyMap.values())
    .sort((a, b) => b.total - a.total)
    .forEach((entry, index) => {
      labels.push(entry.name);
      data.push(entry.total);
      colors.push(pickPalette(index));
    });
  favoriteChart.data.labels = labels.slice(0, 6);
  favoriteChart.data.datasets[0].data = data.slice(0, 6);
  favoriteChart.data.datasets[0].backgroundColor = colors.slice(0, 6);
  favoriteChart.update();
  colorChart.data.labels = labels.slice(0, 8);
  colorChart.data.datasets[0].data = data.slice(0, 8);
  colorChart.data.datasets[0].backgroundColor = colors.slice(0, 8);
  colorChart.update();
    renderKidCards();
    renderKidSelect();
    renderCandyTable();
    renderFamilyHub();
    updateCandyLimitUI();
    refreshInsightsView();
  });
}

function updateSubscriptionUI() {
  if (!state.user) return;
  const active = isSubscriptionActive();
  if (active) {
    subscriptionStatusEl.textContent = 'Treat pass active';
    hideElement(paywallSection);
    showElement(insightsSection);
  } else {
    const expiryText = state.profile.subscriptionExpiry
      ? formatTimestamp(state.profile.subscriptionExpiry)
      : '—';
    if (state.profile.subscriptionStatus === 'trial') {
      subscriptionStatusEl.textContent = 'Trial plan · upgrade for full spooky power';
    } else {
      subscriptionStatusEl.textContent = `Renew to unlock · expired ${expiryText}`;
    }
    showElement(paywallSection);
    hideElement(insightsSection);
  }
  updateLimitBanners();
}

function openKidDialog(id = null) {
  if (!kidDialog) return;
  editingKidId = id;
  if (id) {
    kidFormTitle.textContent = 'Edit kid';
    const kid = state.kids.get(id);
    kidNameInput.value = kid?.name ?? '';
    kidCostumeInput.value = kid?.favoriteCostume ?? '';
    kidBirthYearInput.value = kid?.birthYear ?? '';
  } else {
    if (!canAddKid()) {
      openKidUpgradeDialog();
      return;
    }
    kidFormTitle.textContent = 'Add kid';
    kidForm.reset();
  }
  kidDialog.showModal();
}

function openCandyDialog(candyId = null) {
  if (!candyDialog) return;
  if (!state.currentKidId) {
    alert('Add a kid first to start logging candy.');
    return;
  }
  editingCandyId = candyId;
  const kid = state.kids.get(state.currentKidId);
  if (!kid) return;
  if (candyId) {
    candyFormTitle.textContent = 'Edit candy';
    const candy = kid.candies.find((entry) => entry.id === candyId);
    if (!candy) return;
    candyTypeSelect.value = candy.catalogId ?? state.candyCatalog[0]?.id ?? '';
    candyCountInput.value = candy.count ?? 0;
    if (candyYearInput) {
      candyYearInput.value = candy.collectedYear ?? deriveCandyYear(candy);
    }
    candyNotesInput.value = candy.notes ?? '';
    selectedRating = Number(candy.rating ?? 0);
  } else {
    if (!canAddCandyType()) {
      openCandyUpgradeDialog();
      return;
    }
    candyFormTitle.textContent = 'Add candy';
    candyForm.reset();
    candyNotesInput.value = '';
    if (candyYearInput) {
      candyYearInput.value = String(new Date().getFullYear());
    }
    selectedRating = 0;
    if (state.candyCatalog[0]) {
      candyTypeSelect.value = state.candyCatalog[0].id;
    }
  }
  renderRatingButtons(selectedRating);
  candyDialog.showModal();
}

function openKidUpgradeDialog() {
  if (kidUpgradeDialog) {
    kidUpgradeDialog.showModal();
  }
}

function openCandyUpgradeDialog() {
  if (candyUpgradeDialog) {
    candyUpgradeDialog.showModal();
  }
}

function removeCandyFromKid(kidId, candyId) {
  const kid = state.kids.get(kidId);
  if (!kid) return;
  kid.candies = kid.candies.filter((candy) => candy.id !== candyId);
}

function upsertKid(kidData) {
  state.kids.set(kidData.id, kidData);
}

function upsertCandy(kidId, candy) {
  const kid = state.kids.get(kidId);
  if (!kid) return;
  const index = kid.candies.findIndex((item) => item.id === candy.id);
  if (index >= 0) {
    kid.candies[index] = candy;
  } else {
    kid.candies.push(candy);
  }
}

function handleKidSubmit(event) {
  event.preventDefault();
  const name = kidNameInput.value.trim();
  if (!name) {
    alert('Please provide a name for the kid.');
    return;
  }
  const favoriteCostume = kidCostumeInput.value.trim();
  const birthYear = kidBirthYearInput.value ? Number(kidBirthYearInput.value) : null;
  if (!editingKidId && !canAddKid()) {
    openKidUpgradeDialog();
    return;
  }
  const kidId = editingKidId ?? generateId('kid');
  const kidRecord = state.kids.get(kidId) ?? { id: kidId, candies: [] };
  kidRecord.name = name;
  kidRecord.favoriteCostume = favoriteCostume;
  kidRecord.birthYear = birthYear;
  upsertKid(kidRecord);
  if (!state.currentKidId) {
    state.currentKidId = kidId;
  }
  persistState();
  renderKidSelect();
  renderKidCards();
  renderFamilyHub();
  renderCandyTable();
  renderInsights();
  updateLimitBanners();
  closeDialog(kidDialog);
}

function handleCandySubmit(event) {
  event.preventDefault();
  if (!state.currentKidId) {
    alert('Select a kid to add candy.');
    return;
  }
  const kidId = state.currentKidId;
  const kid = state.kids.get(kidId);
  if (!kid) return;
  const catalogId = candyTypeSelect.value;
  const candyTemplate = state.candyCatalog.find((item) => item.id === catalogId);
  const displayName = candyTemplate
    ? `${candyTemplate.emoji ?? '🍬'} ${candyTemplate.name}`
    : 'Candy Treat';
  const count = Number(candyCountInput.value ?? 0);
  const notes = candyNotesInput.value.trim();
  const rating = Number(selectedRating ?? 0);
  const now = new Date().toISOString();
  if (!editingCandyId) {
    const uniqueBefore = countUniqueCandyTypes();
    const newKey = candyTemplate?.id ?? `custom:${displayName}`;
    const kidAlreadyHasType = kid.candies.some(
      (entry) => (entry.catalogId ?? `custom:${entry.displayName}`) === newKey,
    );
    if (!kidAlreadyHasType && Number.isFinite(getCandyTypeLimit())) {
      if (uniqueBefore >= getCandyTypeLimit()) {
        openCandyUpgradeDialog();
        return;
      }
    }
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
  if (!isSubscriptionActive(state.profile)) {
    const uniqueSet = collectUniqueCandyIdentifiers({ excludeCandyId: editingCandyId });
    const identifier = getCandyIdentifier(payload);
    const isNewType = identifier ? !uniqueSet.has(identifier) : false;
    const projectedTotal = uniqueSet.size + (isNewType ? 1 : 0);
    if (projectedTotal > FREE_CANDY_LIMIT) {
      alert(
        `You've reached the free limit of ${FREE_CANDY_LIMIT} unique candy types. Activate your Stripe family pass to keep logging new discoveries.`,
      );
      return;
    }
  }
  const candiesRef = collection(db, 'users', state.user.uid, 'kids', state.currentKidId, 'candies');
  if (editingCandyId) {
    const candyRef = doc(candiesRef, editingCandyId);
    await updateDoc(candyRef, payload);
  } else {
    payload.createdAt = serverTimestamp();
    await addDoc(candiesRef, payload);
  }
  const candyRecord = editingCandyId
    ? kid.candies.find((entry) => entry.id === editingCandyId)
    : { id: generateId('candy'), createdAt: now };
  if (!candyRecord) return;
  candyRecord.catalogId = candyTemplate?.id ?? null;
  candyRecord.displayName = displayName;
  candyRecord.count = Number.isFinite(count) && count >= 0 ? count : 0;
  candyRecord.notes = notes;
  candyRecord.rating = rating;
  candyRecord.updatedAt = now;
  upsertCandy(kidId, candyRecord);
  persistState();
  renderCandyTable();
  renderKidCards();
  renderFamilyHub();
  renderInsights();
  updateLimitBanners();
  closeDialog(candyDialog);
}

function handleSignIn() {
  state.user = { ...DEMO_USER };
  if (!state.profile.subscriptionExpiry) {
    state.profile.subscriptionExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
  }
  toggleAuthUI(true);
  updateUserBadge();
  if (state.kids.size === 0) {
    const snapshot = createSampleState();
    restoreState(snapshot);
  }
  if (!state.profile.zipCode && zipDialog) {
    zipDialog.showModal();
  }
  persistState();
  renderKidSelect();
  renderKidCards();
  renderFamilyHub();
  renderCandyTable();
  updateSubscriptionUI();
  renderInsights();
}

function handleSignOut() {
  state.user = null;
  persistState();
  toggleAuthUI(false);
}

function updateUserBadge() {
  if (!userNameEl || !userAvatarEl) return;
  userNameEl.textContent = state.user?.displayName ?? 'Candy collector';
  userAvatarEl.src = state.user?.photoURL ?? 'https://avatars.dicebear.com/api/bottts/candy.svg';
}

function handleActivateSubscription() {
  state.profile.subscriptionStatus = 'active';
  state.profile.subscriptionExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString();
  state.profile.paidKidSlots = Math.max(state.profile.paidKidSlots, 1);
  state.profile.candyVaultUnlocked = true;
  persistState();
  updateSubscriptionUI();
  renderInsights();
}

function handleKidUpgradeConfirm() {
  state.profile.paidKidSlots = Number(state.profile.paidKidSlots ?? 0) + 1;
  persistState();
  updateLimitBanners();
  closeDialog(kidUpgradeDialog);
}

function handleCandyUpgradeConfirm() {
  state.profile.candyVaultUnlocked = true;
  persistState();
  updateLimitBanners();
  closeDialog(candyUpgradeDialog);
}

function handleParentWin() {
  state.parentWins += 1;
  persistState();
  renderFamilyHub();
}

function clearCandyFilters() {
  state.candyFilters = {
    rating: 'all',
    year: 'all',
    type: 'all',
    search: '',
  };
  ratingFilterEl.value = 'all';
  yearFilterEl.value = 'all';
  typeFilterEl.value = 'all';
  candySearchInput.value = '';
}

function handleActivateSubscription() {
  state.profile.subscriptionStatus = 'active';
  state.profile.subscriptionExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString();
  state.profile.paidKidSlots = Math.max(state.profile.paidKidSlots, 1);
  state.profile.candyVaultUnlocked = true;
  persistState();
  updateSubscriptionUI();
  renderInsights();
}

function handleSignOut() {
  state.user = null;
  persistState();
  toggleAuthUI(false);
}

function updateUserBadge() {
  if (!userNameEl || !userAvatarEl) return;
  userNameEl.textContent = state.user?.displayName ?? 'Candy collector';
  userAvatarEl.src = state.user?.photoURL ?? 'https://avatars.dicebear.com/api/bottts/candy.svg';
}

function handleActivateSubscription() {
  state.profile.subscriptionStatus = 'active';
  state.profile.subscriptionExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString();
  state.profile.paidKidSlots = Math.max(state.profile.paidKidSlots, 1);
  state.profile.candyVaultUnlocked = true;
  persistState();
  updateSubscriptionUI();
  renderInsights();
}

function handleKidUpgradeConfirm() {
  state.profile.paidKidSlots = Number(state.profile.paidKidSlots ?? 0) + 1;
  persistState();
  updateLimitBanners();
  closeDialog(kidUpgradeDialog);
}

function handleCandyUpgradeConfirm() {
  state.profile.candyVaultUnlocked = true;
  persistState();
  updateLimitBanners();
  closeDialog(candyUpgradeDialog);
}

function handleParentWin() {
  state.parentWins += 1;
  persistState();
  renderFamilyHub();
}

function clearCandyFilters() {
  state.candyFilters = {
    rating: 'all',
    year: 'all',
    type: 'all',
    search: '',
  };
  ratingFilterEl.value = 'all';
  yearFilterEl.value = 'all';
  typeFilterEl.value = 'all';
  candySearchInput.value = '';
}

function handleActivateSubscription() {
  state.profile.subscriptionStatus = 'active';
  state.profile.subscriptionExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString();
  state.profile.paidKidSlots = Math.max(state.profile.paidKidSlots, 1);
  state.profile.candyVaultUnlocked = true;
  persistState();
  updateSubscriptionUI();
  renderInsights();
}

function handleKidUpgradeConfirm() {
  state.profile.paidKidSlots = Number(state.profile.paidKidSlots ?? 0) + 1;
  persistState();
  updateLimitBanners();
  closeDialog(kidUpgradeDialog);
}

function handleCandyUpgradeConfirm() {
  state.profile.candyVaultUnlocked = true;
  persistState();
  updateLimitBanners();
  closeDialog(candyUpgradeDialog);
}

function handleParentWin() {
  state.parentWins += 1;
  persistState();
  renderFamilyHub();
}

function clearCandyFilters() {
  state.candyFilters = {
    rating: 'all',
    year: 'all',
    type: 'all',
    search: '',
  };
  ratingFilterEl.value = 'all';
  yearFilterEl.value = 'all';
  typeFilterEl.value = 'all';
  candySearchInput.value = '';
function handleKidUpgradeConfirm() {
  state.profile.paidKidSlots = Number(state.profile.paidKidSlots ?? 0) + 1;
  persistState();
  updateLimitBanners();
  closeDialog(kidUpgradeDialog);
}

function handleCandyUpgradeConfirm() {
  state.profile.candyVaultUnlocked = true;
  persistState();
  updateLimitBanners();
  closeDialog(candyUpgradeDialog);
}

function handleParentWin() {
  state.parentWins += 1;
  persistState();
  renderFamilyHub();
}

function clearCandyFilters() {
  state.candyFilters = {
    rating: 'all',
    year: 'all',
    type: 'all',
    search: '',
  };
  ratingFilterEl.value = 'all';
  yearFilterEl.value = 'all';
  typeFilterEl.value = 'all';
  candySearchInput.value = '';
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
  state.spotlightKidId = null;
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
    renderFamilyHub();
    updateCandyLimitUI();
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
}

function setupFilterListeners() {
  ratingFilterEl?.addEventListener('change', (event) => {
    state.candyFilters.rating = event.target.value;
    renderCandyTable();
  });
  yearFilterEl?.addEventListener('change', (event) => {
    state.candyFilters.year = event.target.value;
    renderCandyTable();
  });
  typeFilterEl?.addEventListener('change', (event) => {
    state.candyFilters.type = event.target.value;
    renderCandyTable();
  });
  candySearchInput?.addEventListener('input', (event) => {
    state.candyFilters.search = event.target.value.trim().toLowerCase();
    renderCandyTable();
  });
  clearCandyFiltersBtn?.addEventListener('click', () => {
    clearCandyFilters();
  });
}

function setupGlobalListeners() {
  signInButton?.addEventListener('click', handleSignIn);
  signOutButton?.addEventListener('click', handleSignOut);
  activateSubscriptionBtn?.addEventListener('click', handleActivateSubscription);
  addKidBtn?.addEventListener('click', () => openKidDialog());
  addCandyBtn?.addEventListener('click', () => openCandyDialog());
  openKidUpgradeBtn?.addEventListener('click', openKidUpgradeDialog);
  openCandyUpgradeBtn?.addEventListener('click', openCandyUpgradeDialog);
  kidUpgradeConfirm?.addEventListener('click', handleKidUpgradeConfirm);
  candyUpgradeConfirm?.addEventListener('click', handleCandyUpgradeConfirm);
  kidForm?.addEventListener('submit', handleKidSubmit);
  candyForm?.addEventListener('submit', handleCandySubmit);
  logParentWinBtn?.addEventListener('click', handleParentWin);
  $('[data-close]', kidDialog)?.addEventListener('click', () => closeDialog(kidDialog));
  $('[data-close]', candyDialog)?.addEventListener('click', () => closeDialog(candyDialog));
  kidDialog?.addEventListener('close', () => {
    editingKidId = null;
  });
  candyDialog?.addEventListener('close', () => {
    editingCandyId = null;
  });
  kidSelectEl?.addEventListener('change', (event) => {
    state.currentKidId = event.target.value;
    renderCandyTable();
    renderFamilyHub();
    renderInsights();
  });
  refreshInsightsBtn?.addEventListener('click', () => {
    renderInsights();
  });
  zipSubmit?.addEventListener('click', (event) => {
    event.preventDefault();
    const zip = zipInput.value.trim();
    if (!zip) return;
    state.profile.zipCode = zip;
    persistState();
    closeDialog(zipDialog);
    renderInsights();
  });
}

function bootstrapFromStorage() {
  const snapshot = loadStateFromStorage();
  if (snapshot) {
    restoreState(snapshot);
    if (snapshot.user) {
      state.user = snapshot.user;
      toggleAuthUI(true);
      updateUserBadge();
    }
  }
}


function bootstrapFromStorage() {
  const snapshot = loadStateFromStorage();
  if (snapshot) {
    restoreState(snapshot);
    if (snapshot.user) {
      state.user = snapshot.user;
      toggleAuthUI(true);
      updateUserBadge();
    }
  }
}


function bootstrapFromStorage() {
  const snapshot = loadStateFromStorage();
  if (snapshot) {
    restoreState(snapshot);
    if (snapshot.user) {
      state.user = snapshot.user;
      toggleAuthUI(true);
      updateUserBadge();
    }
  }
}
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

panelButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setActivePanel(button.dataset.panelTarget);
  });
});

if (cycleSpotlightBtn) {
  cycleSpotlightBtn.addEventListener('click', () => {
    rotateSpotlightKid();
  });
}

function bootstrapFromStorage() {
  const snapshot = loadStateFromStorage();
  if (snapshot) {
    restoreState(snapshot);
    if (snapshot.user) {
      state.user = snapshot.user;
      toggleAuthUI(true);
      updateUserBadge();
    }
  }
}

async function init() {
  await loadCandyCatalog();
  bootstrapFromStorage();
  setupGlobalListeners();
  setupFilterListeners();
  renderRatingButtons(selectedRating);
  if (state.user) {
    renderKidSelect();
    renderKidCards();
    renderFamilyHub();
    renderCandyTable();
    updateSubscriptionUI();
    renderInsights();
  } else {
    toggleAuthUI(false);
    if (!hasStoredState()) {
      // Auto-start demo for first-time visitors so screenshots work immediately.
      handleSignIn();
    }
  }
  updateLimitBanners();
}

init();
