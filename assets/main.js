const STORAGE_KEY = 'spooky-candy-cloud';
const COLOR_PALETTE = [
  '#ff6f1d',
  '#a855f7',
  '#48e287',
  '#facc15',
  '#fb7185',
  '#38bdf8',
  '#f97316',
  '#f472b6',
  '#22d3ee',
  '#fbbf24',
];

const state = {
  user: null,
  family: null,
  kids: [],
  candyCatalog: [],
  charts: {
    favorites: null,
    colors: null,
  },
  map: null,
  markerLayer: null,
  streetLayer: null,
  streetLogs: [],
  streetDrawing: {
    active: false,
    points: [],
    polyline: null,
  },
  globalStreetMap: null,
  globalStreetLayer: null,
  mapClickBound: false,
  selectedKidId: null,
  editingKidId: null,
  editingCandyId: null,
  selectedRating: 0,
  quests: [
    'Trade for three new treats you have never tasted before.',
    'Collect one photo of every costume you meet tonight.',
    'Find the neighbor handing out the most unique candy.',
    'Share five pieces with a friend to unlock the kindness badge.',
    'Document the top three sour candies on your route.',
  ],
};

// DOM references
const familyNav = document.getElementById('familyNav');
const panels = {
  family: document.getElementById('familyHub'),
  kids: document.getElementById('kidManager'),
  candy: document.getElementById('candyManager'),
  insights: document.getElementById('insights'),
};
const paywallSection = document.getElementById('paywall');
const signInButton = document.getElementById('googleSignIn');
const signOutButton = document.getElementById('signOut');
const userBadge = document.getElementById('userBadge');
const userNameEl = document.getElementById('userName');
const userAvatarEl = document.getElementById('userAvatar');
const subscriptionStatusEl = document.getElementById('subscriptionStatus');
const activateSubscriptionBtn = document.getElementById('activateSubscription');
const downloadDataBtn = document.getElementById('downloadData');
const downloadInsightsBtn = document.getElementById('downloadInsights');
const openZipDialogBtn = document.getElementById('openZipDialog');
const scrollToFamilyBtn = document.getElementById('scrollToFamily');
const zipDialog = document.getElementById('zipDialog');
const zipInput = document.getElementById('zipInput');
const zipSubmitBtn = document.getElementById('zipSubmit');
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
const moodboardEl = document.getElementById('candyMoodboard');
const spotlightKidEl = document.getElementById('spotlightKid');
const cycleSpotlightBtn = document.getElementById('cycleSpotlight');
const kidListEl = document.getElementById('kidList');
const addKidBtn = document.getElementById('addKid');
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
const kidSelectEl = document.getElementById('kidSelect');
const addCandyBtn = document.getElementById('addCandy');
const candyEmptyState = document.getElementById('candyEmptyState');
const candyTableWrapper = document.getElementById('candyTableWrapper');
const candyTableBody = document.getElementById('candyTableBody');
const kidCardTemplate = document.getElementById('kidCardTemplate');
const candyRowTemplate = document.getElementById('candyRowTemplate');
const newQuestBtn = document.getElementById('newQuest');
const favoriteChartCanvas = document.getElementById('favoriteChart');
const colorChartCanvas = document.getElementById('colorChart');
const totalTreatsEl = document.getElementById('totalTreats');
const kidTreatBreakdownEl = document.getElementById('kidTreatBreakdown');
const zipDisplayEl = document.getElementById('zipDisplay');
const topZipCandyEl = document.getElementById('topZipCandy');
const refreshInsightsBtn = document.getElementById('refreshInsights');
const zipBreakdownBody = document.getElementById('zipBreakdown');
const startStreetLogBtn = document.getElementById('startStreetLog');
const cancelStreetLogBtn = document.getElementById('cancelStreetLog');
const finishStreetLogBtn = document.getElementById('finishStreetLog');
const streetDrawingStatus = document.getElementById('streetDrawingStatus');
const streetLogList = document.getElementById('streetLogList');
const streetLogEmpty = document.getElementById('streetLogEmpty');
const streetDialog = document.getElementById('streetDialog');
const streetForm = document.getElementById('streetForm');
const streetDrawingSummary = document.getElementById('streetDrawingSummary');
const streetFormError = document.getElementById('streetFormError');
const streetNameInput = document.getElementById('streetName');
const streetHousesInput = document.getElementById('streetHouses');
const streetCandyList = document.getElementById('streetCandyList');
const addStreetCandyBtn = document.getElementById('addStreetCandy');
const streetMapWrapper = document.getElementById('streetMapWrapper');
const streetMapPaywall = document.getElementById('streetMapPaywall');
const streetMapActivateBtn = document.getElementById('streetMapActivate');
const streetLeaderboard = document.getElementById('streetLeaderboard');
const streetMapContainer = document.getElementById('streetMap');
const previewGallery = document.getElementById('previewGallery');

function loadPersistedState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.warn('Unable to load stored state', error);
    return null;
  }
}

function persistState() {
  if (!state.user) return; // only persist for signed-in demos
  try {
    const payload = {
      family: state.family,
      kids: state.kids.map((kid) => ({
        ...kid,
        candies: undefined,
      })),
      streetLogs: state.streetLogs.map((log) => ({
        ...log,
        candy: (log.candy || []).map((entry) => ({ ...entry })),
        path: (log.path || []).map((point) => [...point]),
      })),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('Unable to persist state', error);
  }
}

function createId(prefix = 'item') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function createTimestamp(year) {
  const targetYear = Number.isFinite(Number(year)) ? Number(year) : new Date().getFullYear();
  return new Date(targetYear, 9, 31, 19, 30, 0).toISOString();
}

const EARTH_RADIUS_METERS = 6371000;

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function haversineDistance(pointA, pointB) {
  if (!Array.isArray(pointA) || !Array.isArray(pointB) || pointA.length !== 2 || pointB.length !== 2) {
    return 0;
  }
  const [lat1, lon1] = pointA.map(Number);
  const [lat2, lon2] = pointB.map(Number);
  if (![lat1, lon1, lat2, lon2].every((coord) => Number.isFinite(coord))) {
    return 0;
  }
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

function computeStreetDistance(points) {
  if (!Array.isArray(points) || points.length < 2) return 0;
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    total += haversineDistance(points[index - 1], points[index]);
  }
  return total;
}

function normaliseStreetLog(rawLog) {
  if (!rawLog) return null;
  const path = Array.isArray(rawLog.path)
    ? rawLog.path
        .map((point) => [Number(point?.[0]), Number(point?.[1])])
        .filter((point) => point.every((coord) => Number.isFinite(coord)))
    : [];
  const candy = Array.isArray(rawLog.candy)
    ? rawLog.candy
        .map((entry) => ({
          type: entry.type,
          quantity: Number(entry.quantity) || 0,
        }))
        .filter((entry) => entry.type)
    : [];
  const housesVisited = Number(rawLog.housesVisited) || 0;
  const computedTotal = candy.reduce((sum, entry) => sum + entry.quantity, 0);
  const persistedTotal = Number(rawLog.totalPieces);
  const totalPieces = Number.isFinite(persistedTotal) && persistedTotal >= 0 ? persistedTotal : computedTotal;
  const effectiveTotal = computedTotal || totalPieces || 0;
  const fallbackAverage =
    housesVisited > 0 ? Number(((effectiveTotal || 0) / housesVisited).toFixed(2)) : 0;
  const persistedAverage = Number(rawLog.averagePieces);
  const averagePieces = Number.isFinite(persistedAverage) ? persistedAverage : fallbackAverage;
  const distanceMeters = Number(rawLog.distanceMeters) || Math.round(computeStreetDistance(path));
  return {
    id: rawLog.id || createId('street'),
    streetName: rawLog.streetName || 'Unnamed Street',
    housesVisited,
    candy,
    path,
    totalPieces: effectiveTotal,
    averagePieces,
    distanceMeters,
  };
}

function formatDistanceMeters(distance) {
  if (!Number.isFinite(distance) || distance <= 0) {
    return '';
  }
  if (distance >= 1609.34) {
    return `${(distance / 1609.34).toFixed(2)} mi`;
  }
  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(2)} km`;
  }
  return `${Math.round(distance)} m`;
}

function getGenerosityColor(average) {
  if (Number(average) >= 5) return '#48e287';
  if (Number(average) >= 3) return '#facc15';
  return '#fb7185';
}

function normaliseKid(rawKid) {
  const kid = {
    id: rawKid.id || createId('kid'),
    name: rawKid.name,
    costume: rawKid.costume || 'Mystery costume',
    birthYear: rawKid.birthYear || null,
    location: rawKid.location || null,
    favoriteQuote: rawKid.favoriteQuote || '',
    collections: (rawKid.collections || []).map((collection) => ({
      id: collection.id || createId('collection'),
      year: collection.year,
      theme: collection.theme || '',
      event: collection.event || '',
      notes: collection.notes || '',
      candy: (collection.candy || []).map((item) => ({
        id: item.id || createId('candy'),
        type: item.type,
        quantity: item.quantity || 0,
        color: item.color || 'Mystery',
        rating: item.rating || 0,
        notes: item.notes || '',
        updatedAt: item.updatedAt || createTimestamp(collection.year),
      })),
    })),
  };

  kid.candies = kid.collections.flatMap((collection) =>
    collection.candy.map((item) => ({
      ...item,
      collectionId: collection.id,
      year: collection.year,
    })),
  );

  return kid;
}

function hydrateState(baseData, persisted) {
  state.family = {
    ...baseData.family,
    ...(persisted?.family || {}),
  };
  state.candyCatalog = baseData.candyCatalog || [];

  const sourceKids = persisted?.kids && persisted.kids.length > 0 ? persisted.kids : baseData.children;
  state.kids = (sourceKids || []).map(normaliseKid);
  state.selectedKidId = state.kids[0]?.id || null;
  const persistedStreetLogs = Array.isArray(persisted?.streetLogs) ? persisted.streetLogs : [];
  state.streetLogs = persistedStreetLogs.map(normaliseStreetLog).filter(Boolean);
}

function showElement(element) {
  element.classList.remove('hidden');
}

function hideElement(element) {
  element.classList.add('hidden');
}

function openDialog(dialog) {
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  }
}

function closeDialog(dialog) {
  if (dialog.open) {
    dialog.close();
  }
}

function toggleNavVisibility(isVisible) {
  if (isVisible) {
    showElement(familyNav);
    showPanel('family');
  } else {
    hideElement(familyNav);
    Object.values(panels).forEach((panel) => hideElement(panel));
  }
}

function showPanel(panelKey) {
  Object.entries(panels).forEach(([key, panel]) => {
    if (key === panelKey) {
      showElement(panel);
    } else {
      hideElement(panel);
    }
  });
  document.querySelectorAll('.nav-pill').forEach((button) => {
    button.classList.toggle('active', button.dataset.panelTarget === panelKey);
  });

  if (panelKey === 'insights') {
    updateCharts();
    updateMap();
  } else {
    resetStreetDrawing();
  }
}

function scrollToPanel(panelKey) {
  showPanel(panelKey);
  const target = panels[panelKey];
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function buildPreviewFigure(container, layout) {
  if (!container) return;
  container.innerHTML = '';
  const template = Array.isArray(layout) && layout.length ? layout : [[1, 1, 1], [2, 1]];
  template.forEach((rowWeights) => {
    const weights = Array.isArray(rowWeights) ? rowWeights : [rowWeights];
    const row = document.createElement('div');
    row.className = 'preview-figure__row';
    weights.forEach((weight) => {
      const block = document.createElement('span');
      block.className = 'preview-figure__block';
      const numeric = Number(weight);
      if (Number.isFinite(numeric) && numeric > 0) {
        block.style.setProperty('--block-weight', numeric);
      }
      row.appendChild(block);
    });
    container.appendChild(row);
  });
}

function buildPreviewItems() {
  const totalKids = state.kids.length;
  const totalPieces = state.kids.reduce((sum, kid) => sum + totalCandyForKid(kid), 0);
  const uniqueCandy = new Set();
  let candyEntries = 0;
  let totalRatings = 0;
  state.kids.forEach((kid) => {
    kid.candies.forEach((candy) => {
      uniqueCandy.add(candy.type);
      candyEntries += 1;
      totalRatings += Number(candy.rating || 0);
    });
  });
  const averageRating = candyEntries ? totalRatings / candyEntries : 0;
  const questPreview = state.family?.currentQuest || 'Spin nightly quests for your crew.';
  const topKid = totalKids
    ? [...state.kids].sort((a, b) => totalCandyForKid(b) - totalCandyForKid(a))[0]
    : null;
  const topKidPieces = topKid ? totalCandyForKid(topKid) : 0;
  const streetCount = state.streetLogs.length;
  const topStreet = streetCount
    ? [...state.streetLogs].sort((a, b) => (b.averagePieces || 0) - (a.averagePieces || 0))[0]
    : null;
  const topStreetAverage = topStreet ? Number(topStreet.averagePieces || 0).toFixed(1) : null;
  const subscriptionStatus = state.family?.subscriptionStatus === 'active' ? 'Active' : 'Inactive';
  const signedIn = Boolean(state.user);
  const topZipCandy = topZipCandyEl?.textContent?.trim() || '—';
  const kidNames = state.kids.slice(0, 3).map((kid) => kid.name);
  if (state.kids.length > 3) {
    kidNames.push('…');
  }

  const previewItems = [];

  const authActions = [];
  if (!signedIn) {
    authActions.push({ label: 'Preview sign-in', handler: simulateSignIn, variant: 'primary' });
  } else {
    authActions.push({ label: 'Sign out', handler: signOut, variant: 'ghost' });
    if (state.family?.subscriptionStatus !== 'active') {
      authActions.push({
        label: 'View paywall',
        handler: () => {
          paywallSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          activateSubscriptionBtn?.focus({ preventScroll: true });
        },
        variant: 'secondary',
      });
    }
  }
  previewItems.push({
    key: 'auth',
    title: 'Demo sign-in & subscription',
    description: 'Preview the authentication badge and spooky pass messaging.',
    layout: [[1], [2]],
    callouts: [
      signedIn ? `Signed in as ${state.user.displayName}` : 'Not signed in',
      `Pass: ${subscriptionStatus}`,
    ],
    actions: authActions,
  });

  const familyActions = [
    { label: 'Open Family HQ', handler: () => scrollToPanel('family'), variant: 'secondary' },
  ];
  if (totalKids) {
    familyActions.push({
      label: 'Jump to nightly quest',
      handler: () => {
        scrollToPanel('family');
        familyQuestEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
      variant: 'ghost',
    });
  } else {
    familyActions.push({
      label: 'Add your first kid',
      handler: () => {
        scrollToPanel('kids');
        state.editingKidId = null;
        kidFormTitle.textContent = 'Add kid';
        kidForm?.reset();
        openDialog(kidDialog);
      },
      variant: 'primary',
    });
  }
  previewItems.push({
    key: 'family',
    title: 'Family HQ dashboard',
    description: 'See milestones, achievements, and nightly quests at a glance.',
    layout: [[3, 1], [1, 1, 1]],
    callouts: [
      `${totalKids} kid${totalKids === 1 ? '' : 's'} tracked`,
      `${totalPieces} pieces logged`,
      `${uniqueCandy.size} candy types`,
    ],
    actions: familyActions,
  });

  const kidActions = [
    { label: 'Open Kid Crew', handler: () => scrollToPanel('kids'), variant: 'secondary' },
    {
      label: 'Add kid profile',
      handler: () => {
        scrollToPanel('kids');
        state.editingKidId = null;
        kidFormTitle.textContent = 'Add kid';
        kidForm?.reset();
        openDialog(kidDialog);
      },
      variant: 'primary',
    },
  ];
  previewItems.push({
    key: 'kids',
    title: 'Kid Crew profiles',
    description: 'Manage costumes, ages, and candy collections.',
    layout: [[1, 1, 1], [2, 1]],
    callouts: [
      totalKids ? `Top collector: ${topKid?.name || '—'} (${topKidPieces} pcs)` : 'No kids added yet',
      kidNames.length ? `Line-up: ${kidNames.join(', ')}` : 'Invite your crew',
    ],
    actions: kidActions,
  });

  const candyActions = [
    { label: 'Open Candy Vault', handler: () => scrollToPanel('candy'), variant: 'secondary' },
  ];
  if (totalKids) {
    candyActions.push({
      label: 'Add candy entry',
      handler: () => {
        const kidId = state.selectedKidId || state.kids[0]?.id;
        if (!kidId) {
          scrollToPanel('kids');
          return;
        }
        scrollToPanel('candy');
        openCandyEditor(kidId, null);
      },
      variant: 'primary',
    });
  }
  candyActions.push({
    label: 'Highlight export',
    handler: () => {
      scrollToPanel('family');
      downloadDataBtn?.focus({ preventScroll: true });
    },
    variant: 'ghost',
  });
  previewItems.push({
    key: 'candy',
    title: 'Candy vault entries',
    description: 'Log candy by type, count, rating, and tasting notes.',
    layout: [[2, 1, 1], [1, 1, 1, 1]],
    callouts: [
      `${candyEntries} candy entries`,
      `Avg rating: ${averageRating.toFixed(1)}`,
    ],
    actions: candyActions,
  });

  const insightsActions = [
    { label: 'Open Insights', handler: () => scrollToPanel('insights'), variant: 'secondary' },
    {
      label: 'Refresh insights',
      handler: () => {
        scrollToPanel('insights');
        refreshInsightsBtn?.click();
      },
      variant: 'ghost',
    },
    {
      label: 'Focus export',
      handler: () => {
        scrollToPanel('insights');
        downloadInsightsBtn?.focus({ preventScroll: true });
      },
      variant: 'ghost',
    },
  ];
  previewItems.push({
    key: 'insights',
    title: 'Neighborhood insights',
    description: 'Charts, totals, and favorite candies by zip code.',
    layout: [[1, 1, 1], [2, 1]],
    callouts: [
      `${totalPieces} total treats`,
      `Zip favorite: ${topZipCandy}`,
      `Quest teaser: ${questPreview}`,
    ],
    actions: insightsActions,
  });

  const streetActions = [
    {
      label: 'Draw street route',
      handler: () => {
        scrollToPanel('insights');
        initializeMap();
        startStreetDrawing();
      },
      variant: 'primary',
    },
  ];
  if (streetCount) {
    streetActions.push({
      label: 'Review street logs',
      handler: () => {
        scrollToPanel('insights');
        streetLogList?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
      variant: 'ghost',
    });
  }
  previewItems.push({
    key: 'streets',
    title: 'Street haul logging',
    description: 'Sketch trick-or-treat routes and log candy by type.',
    layout: [[2], [1, 1], [3]],
    callouts: [
      `${streetCount} route${streetCount === 1 ? '' : 's'} logged`,
      topStreet
        ? `Best: ${topStreet.streetName} (${topStreetAverage} pcs/house)`
        : 'Log a street to reveal averages',
    ],
    actions: streetActions,
  });

  const generousActions = [
    {
      label: 'View generosity map',
      handler: () => {
        scrollToPanel('insights');
        streetMapWrapper?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
      variant: 'secondary',
    },
  ];
  if (state.family?.subscriptionStatus !== 'active') {
    generousActions.push({
      label: 'Activate pass',
      handler: () => {
        if (!state.user) {
          simulateSignIn();
        }
        activateSubscriptionBtn?.click();
      },
      variant: 'primary',
    });
  }
  previewItems.push({
    key: 'generous',
    title: 'Generous streets map',
    description: 'See community averages and leaderboard rankings.',
    layout: [[1, 1], [1, 1, 1]],
    callouts: [
      `Pass: ${subscriptionStatus}`,
      streetCount
        ? `Leaderboard ready: ${streetCount} street${streetCount === 1 ? '' : 's'}`
        : 'Log streets to unlock rankings',
    ],
    actions: generousActions,
  });

  return previewItems;
}

function renderPreviewGallery() {
  if (!previewGallery) return;
  const items = buildPreviewItems();
  previewGallery.innerHTML = '';
  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'preview-card';
    card.setAttribute('role', 'listitem');
    card.dataset.previewKey = item.key;

    const header = document.createElement('div');
    header.className = 'preview-card__header';
    const title = document.createElement('h3');
    title.textContent = item.title;
    const description = document.createElement('p');
    description.textContent = item.description;
    header.appendChild(title);
    header.appendChild(description);
    card.appendChild(header);

    const figure = document.createElement('div');
    figure.className = 'preview-figure';
    buildPreviewFigure(figure, item.layout);
    card.appendChild(figure);

    if (Array.isArray(item.callouts) && item.callouts.length) {
      const list = document.createElement('ul');
      list.className = 'preview-card__callouts';
      item.callouts
        .filter((callout) => Boolean(callout))
        .forEach((callout) => {
          const entry = document.createElement('li');
          entry.textContent = callout;
          list.appendChild(entry);
        });
      if (list.children.length) {
        card.appendChild(list);
      }
    }

    if (Array.isArray(item.actions) && item.actions.length) {
      const actionGroup = document.createElement('div');
      actionGroup.className = 'preview-card__actions';
      item.actions
        .filter(Boolean)
        .forEach((action) => {
          const button = document.createElement('button');
          button.type = 'button';
          const variant = action.variant || 'ghost';
          button.className = `btn small ${variant}`;
          button.textContent = action.label;
          button.addEventListener('click', () => {
            try {
              action.handler?.();
            } catch (error) {
              console.error('Preview action failed', error);
            }
          });
          actionGroup.appendChild(button);
        });
      if (actionGroup.children.length) {
        card.appendChild(actionGroup);
      }
    }

    previewGallery.appendChild(card);
  });
}

function computeAge(birthYear) {
  if (!birthYear) return null;
  const numeric = Number(birthYear);
  if (!Number.isFinite(numeric)) return null;
  const currentYear = new Date().getFullYear();
  return Math.max(currentYear - numeric, 0);
}

function totalCandyForKid(kid) {
  return kid.candies.reduce((sum, candy) => sum + Number(candy.quantity || 0), 0);
}

function averageRatingForKid(kid) {
  if (kid.candies.length === 0) return 0;
  const total = kid.candies.reduce((sum, candy) => sum + Number(candy.rating || 0), 0);
  return total / kid.candies.length;
}

function updateFamilySummary() {
  if (!state.kids.length) {
    familySummaryEl.textContent = 'Add your first kid to begin.';
    priceEstimateEl.textContent = '$0 family pass estimate';
    hideElement(candyLimitNoticeEl);
    return;
  }

  const totalPieces = state.kids.reduce((sum, kid) => sum + totalCandyForKid(kid), 0);
  const uniqueCandy = new Set();
  state.kids.forEach((kid) => kid.candies.forEach((candy) => uniqueCandy.add(candy.type)));

  familySummaryEl.textContent = `${state.kids.length} kids • ${totalPieces} pieces • ${uniqueCandy.size} unique treats`;
  const estimate = state.kids.length * 2;
  priceEstimateEl.textContent = `$${estimate} family pass estimate`;

  if (totalPieces > 180) {
    candyLimitNoticeEl.textContent =
      'Whoa! You are approaching the legendary 200-piece milestone. Time to plan a candy swap.';
    showElement(candyLimitNoticeEl);
  } else {
    hideElement(candyLimitNoticeEl);
  }
}

function updateSpotlightKid() {
  if (!state.kids.length) {
    spotlightKidEl.innerHTML = '<p>Add a kid to unlock the spotlight.</p>';
    return;
  }
  const randomKid = state.kids[Math.floor(Math.random() * state.kids.length)];
  const age = computeAge(randomKid.birthYear);
  const favoriteCandy = [...randomKid.candies].sort((a, b) => b.rating - a.rating)[0];
  spotlightKidEl.innerHTML = `
    <strong>${randomKid.name}</strong>
    <span>${age ? `${age}-year-old` : 'Timeless'} candy explorer</span>
    <span>Favorite treat: ${favoriteCandy ? favoriteCandy.type : 'TBD'}</span>
    <span class="highlight-pill">${randomKid.costume}</span>
  `;
}

function updateLeaderboard() {
  kidLeaderboardEl.innerHTML = '';
  if (!state.kids.length) return;

  const sorted = [...state.kids]
    .map((kid) => ({
      kid,
      total: totalCandyForKid(kid),
      rating: averageRatingForKid(kid),
    }))
    .sort((a, b) => b.total - a.total);

  sorted.forEach(({ kid, total, rating }, index) => {
    const item = document.createElement('li');
    item.innerHTML = `
      <strong>#${index + 1} ${kid.name}</strong>
      <small>${total} pcs • ${rating.toFixed(1)}★ avg</small>
    `;
    kidLeaderboardEl.appendChild(item);
  });
}

function updateAchievements() {
  achievementBoardEl.innerHTML = '';
  if (!state.kids.length) return;

  const totalPieces = state.kids.reduce((sum, kid) => sum + totalCandyForKid(kid), 0);
  const avgRating = (() => {
    const ratings = state.kids.flatMap((kid) => kid.candies.map((candy) => candy.rating));
    if (!ratings.length) return 0;
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  })();

  const achievements = [];
  if (totalPieces >= 150) {
    achievements.push({ label: 'Cauldron Crusher', detail: 'Collected 150+ pieces in total.' });
  }
  if (avgRating >= 4.2) {
    achievements.push({ label: 'Sweet Sommelier', detail: 'Average candy rating above 4.2 stars.' });
  }
  const explorer = state.kids.some((kid) => (kid.collections || []).length >= 3);
  if (explorer) {
    achievements.push({ label: 'Trailblazing Trick-or-Treater', detail: 'Three years of candy adventures logged.' });
  }
  if (achievements.length === 0) {
    achievements.push({ label: 'Freshly Bewitched', detail: 'Start logging candy to earn achievements.' });
  }

  achievements.forEach((achievement) => {
    const item = document.createElement('li');
    item.className = 'badge';
    item.innerHTML = `
      <span>${achievement.label}</span>
      <small>${achievement.detail}</small>
    `;
    achievementBoardEl.appendChild(item);
  });
}

function updateLearningPrompts() {
  const prompts = [
    'Graph tonight\'s candy colors and compare to last year.',
    'Interview a neighbor about their favorite childhood treat.',
    'Sort candies by texture and rate the crunch factor.',
    'Design a sharing plan so every kid gets their top three picks.',
  ];

  learningPromptsEl.innerHTML = '';
  prompts.forEach((prompt) => {
    const item = document.createElement('li');
    item.textContent = prompt;
    learningPromptsEl.appendChild(item);
  });
}

function updateStarMeter() {
  const ratings = state.kids.flatMap((kid) => kid.candies.map((candy) => candy.rating));
  const avgRating = ratings.length
    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    : 0;
  const progress = Math.min(Math.max(avgRating / 5, 0), 1);
  familyStarMeterEl.style.setProperty('--progress', progress.toString());
  familyStarMeterEl.dataset.progress = progress.toFixed(2);
  familyStarMeterEl.setAttribute('aria-label', `Average family rating ${avgRating.toFixed(1)} out of 5`);
}

function updateTimeline() {
  familyTimelineEl.innerHTML = '';
  const events = state.kids.flatMap((kid) =>
    (kid.collections || []).map((collection) => ({
      kidName: kid.name,
      year: collection.year,
      theme: collection.theme,
      event: collection.event,
      total: collection.candy.reduce((sum, candy) => sum + candy.quantity, 0),
    })),
  );
  events.sort((a, b) => a.year - b.year);

  events.forEach((event) => {
    const entry = document.createElement('div');
    entry.className = 'timeline-entry';
    entry.innerHTML = `
      <strong>${event.year}</strong>
      <span>${event.kidName} hauled ${event.total} pieces.</span>
      <small>${event.theme || 'Neighborhood tour'}${event.event ? ` • ${event.event}` : ''}</small>
    `;
    familyTimelineEl.appendChild(entry);
  });
}

function updateClassroom() {
  const lessons = [
    'Estimate sugar grams collected tonight.',
    'Map walking distance using the candy map.',
    'Plan a sharing algorithm so every cousin gets a fair mix.',
  ];
  familyClassroomEl.innerHTML = '';
  lessons.forEach((lesson) => {
    const item = document.createElement('li');
    item.textContent = lesson;
    familyClassroomEl.appendChild(item);
  });
}

function chooseQuest() {
  const quest = state.quests[Math.floor(Math.random() * state.quests.length)];
  familyQuestEl.textContent = quest;

  const goals = [
    'Log the top-rated candy with tasting notes.',
    'Upload a photo to the family scrapbook.',
    'Share at least five pieces with a friend or neighbor.',
  ];
  familyGoalsEl.innerHTML = '';
  goals.forEach((goal, index) => {
    const item = document.createElement('li');
    item.innerHTML = `<span>Step ${index + 1}</span>${goal}`;
    familyGoalsEl.appendChild(item);
  });
}

function updateMoodboard() {
  const colorCounts = new Map();
  state.kids.forEach((kid) => {
    kid.candies.forEach((candy) => {
      const key = candy.color || 'Mystery';
      colorCounts.set(key, (colorCounts.get(key) || 0) + candy.quantity);
    });
  });
  const sortedColors = [...colorCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  moodboardEl.innerHTML = '';
  sortedColors.forEach(([color, count]) => {
    const swatch = document.createElement('div');
    swatch.className = 'mood-swatch';
    swatch.innerHTML = `
      <span>${color}</span>
      <small>${count} pieces</small>
      <div style="width: 100%; height: 32px; border-radius: 12px; background: linear-gradient(135deg, ${COLOR_PALETTE[0]}, ${COLOR_PALETTE[1]}); position: relative; overflow: hidden;"></div>
    `;
    const accent = swatch.querySelector('div');
    if (accent) {
      accent.style.background = color.toLowerCase() === 'rainbow'
        ? 'linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)'
        : color;
    }
    moodboardEl.appendChild(swatch);
  });
}

function updateKidCards() {
  kidListEl.innerHTML = '';
  state.kids.forEach((kid) => {
    const card = kidCardTemplate.content.firstElementChild.cloneNode(true);
    card.querySelector('.kid-name').textContent = kid.name;
    card.querySelector('.kid-costume').textContent = `Favorite costume: ${kid.costume}`;
    const age = computeAge(kid.birthYear);
    card.querySelector('.kid-age').textContent = age ? `${age} years old` : 'Age mystery';
    card.querySelector('.kid-summary').textContent = `${totalCandyForKid(kid)} pieces • ${averageRatingForKid(kid).toFixed(1)}★ avg`;
    card.querySelector('.edit-kid').addEventListener('click', () => openKidEditor(kid.id));
    kidListEl.appendChild(card);
  });
}

function updateKidSelect() {
  kidSelectEl.innerHTML = '<option value="">Select kid</option>';
  state.kids.forEach((kid) => {
    const option = document.createElement('option');
    option.value = kid.id;
    option.textContent = kid.name;
    kidSelectEl.appendChild(option);
  });
  if (state.selectedKidId) {
    kidSelectEl.value = state.selectedKidId;
  }
}

function openKidEditor(kidId) {
  state.editingKidId = kidId;
  const kid = state.kids.find((candidate) => candidate.id === kidId);
  if (!kid) return;
  kidFormTitle.textContent = `Edit ${kid.name}`;
  kidNameInput.value = kid.name;
  kidCostumeInput.value = kid.costume;
  kidBirthYearInput.value = kid.birthYear || '';
  openDialog(kidDialog);
}

function resetKidForm() {
  state.editingKidId = null;
  kidForm.reset();
}

function openCandyEditor(kidId, candyId = null) {
  state.selectedKidId = kidId;
  state.editingCandyId = candyId;
  const kid = state.kids.find((candidate) => candidate.id === kidId);
  if (!kid) return;
  populateCandySelect();

  if (candyId) {
    const candy = kid.candies.find((entry) => entry.id === candyId);
    if (!candy) return;
    candyFormTitle.textContent = `Edit ${candy.type}`;
    candyTypeSelect.value = candy.type;
    candyCountInput.value = candy.quantity;
    candyNotesInput.value = candy.notes;
    state.selectedRating = candy.rating;
  } else {
    candyFormTitle.textContent = `Add candy for ${kid.name}`;
    candyForm.reset();
    state.selectedRating = 0;
  }
  renderRatingButtons();
  openDialog(candyDialog);
}

function resetCandyForm() {
  state.editingCandyId = null;
  candyForm.reset();
  state.selectedRating = 0;
  renderRatingButtons();
}

function populateCandySelect() {
  candyTypeSelect.innerHTML = '';
  state.candyCatalog.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.type;
    option.textContent = item.type;
    candyTypeSelect.appendChild(option);
  });
}

function renderRatingButtons() {
  ratingSelector.innerHTML = '';
  const icons = ['💀', '🎃', '🍬', '🧙', '🌟'];
  for (let value = 1; value <= 5; value += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = icons[value - 1];
    button.dataset.value = String(value);
    if (value === state.selectedRating) {
      button.classList.add('active');
    }
    button.addEventListener('click', () => {
      state.selectedRating = value;
      renderRatingButtons();
    });
    ratingSelector.appendChild(button);
  }
}

function upsertKid(kidData) {
  if (state.editingKidId) {
    const kid = state.kids.find((candidate) => candidate.id === state.editingKidId);
    if (!kid) return;
    kid.name = kidData.name;
    kid.costume = kidData.costume;
    kid.birthYear = kidData.birthYear;
  } else {
    const newKid = normaliseKid({
      id: createId('kid'),
      ...kidData,
      collections: [],
    });
    state.kids.push(newKid);
    state.selectedKidId = newKid.id;
  }
  persistState();
  updateAllFamilyViews();
}

function ensureCollectionForYear(kid, year) {
  let collection = kid.collections.find((entry) => entry.year === year);
  if (!collection) {
    collection = {
      id: createId('collection'),
      year,
      theme: 'Halloween Night',
      event: '',
      notes: '',
      candy: [],
    };
    kid.collections.push(collection);
  }
  return collection;
}

function upsertCandy(kidId, candyData) {
  const kid = state.kids.find((candidate) => candidate.id === kidId);
  if (!kid) return;
  const year = candyData.year || new Date().getFullYear();
  const collection = ensureCollectionForYear(kid, year);

  if (state.editingCandyId) {
    const candy = collection.candy.find((entry) => entry.id === state.editingCandyId);
    if (candy) {
      candy.type = candyData.type;
      candy.quantity = candyData.quantity;
      candy.rating = candyData.rating;
      candy.notes = candyData.notes;
      candy.color = candyData.color;
      candy.updatedAt = new Date().toISOString();
    }
  } else {
    collection.candy.push({
      id: createId('candy'),
      type: candyData.type,
      quantity: candyData.quantity,
      rating: candyData.rating,
      notes: candyData.notes,
      color: candyData.color,
      updatedAt: new Date().toISOString(),
    });
  }

  kid.candies = kid.collections.flatMap((col) =>
    col.candy.map((item) => ({
      ...item,
      collectionId: col.id,
      year: col.year,
    })),
  );
  persistState();
  updateAllFamilyViews();
  updateCandyTable();
}

function updateCandyTable() {
  const kidId = state.selectedKidId || kidSelectEl.value;
  const kid = state.kids.find((candidate) => candidate.id === kidId);
  if (!kid) {
    candyEmptyState.classList.remove('hidden');
    candyTableWrapper.classList.add('hidden');
    return;
  }
  state.selectedKidId = kid.id;
  kidSelectEl.value = kid.id;

  const rows = [...kid.candies].sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  candyTableBody.innerHTML = '';
  rows.forEach((candy) => {
    const row = candyRowTemplate.content.firstElementChild.cloneNode(true);
    row.querySelector('.candy-type').textContent = candy.type;
    row.querySelector('.candy-year').textContent = candy.year;
    row.querySelector('.candy-count').textContent = candy.quantity;
    row.querySelector('.candy-rating').textContent = candy.rating ? `${'⭐'.repeat(candy.rating)} (${candy.rating})` : '—';
    row.querySelector('.candy-notes').textContent = candy.notes || '—';
    row.querySelector('.candy-updated').textContent = new Date(candy.updatedAt).toLocaleString();
    row.querySelector('.edit-candy').addEventListener('click', () => openCandyEditor(kid.id, candy.id));
    candyTableBody.appendChild(row);
  });

  candyEmptyState.classList.toggle('hidden', rows.length > 0);
  candyTableWrapper.classList.toggle('hidden', rows.length === 0);
}

function updateTotalTreats() {
  const total = state.kids.reduce((sum, kid) => sum + totalCandyForKid(kid), 0);
  totalTreatsEl.textContent = total;
  const breakdown = state.kids.map((kid) => `${kid.name} (${totalCandyForKid(kid)} pcs)`).join(', ');
  kidTreatBreakdownEl.textContent = breakdown || 'Add kids to see the breakdown.';
}

function updateZipInsights() {
  const zip = state.family?.zipCode || '?????';
  zipDisplayEl.textContent = zip;
  const candyByZip = new Map();
  state.kids
    .filter((kid) => kid.location?.postalCode === zip)
    .forEach((kid) => {
      kid.candies.forEach((candy) => {
        candyByZip.set(candy.type, (candyByZip.get(candy.type) || 0) + candy.quantity);
      });
    });
  const sorted = [...candyByZip.entries()].sort((a, b) => b[1] - a[1]);
  topZipCandyEl.textContent = sorted[0] ? `${sorted[0][0]} (${sorted[0][1]} pcs)` : 'a surprise mix';

  zipBreakdownBody.innerHTML = '';
  sorted.slice(0, 5).forEach(([type, quantity]) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${type}</td><td>${quantity}</td>`;
    zipBreakdownBody.appendChild(row);
  });
}

function prepareCharts() {
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js has not loaded yet.');
    setTimeout(prepareCharts, 250);
    return;
  }
  if (state.charts.favorites || state.charts.colors) return;
  state.charts.favorites = new Chart(favoriteChartCanvas, {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Average Rating', data: [], backgroundColor: COLOR_PALETTE }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, max: 5 },
      },
    },
  });

  state.charts.colors = new Chart(colorChartCanvas, {
    type: 'doughnut',
    data: { labels: [], datasets: [{ data: [], backgroundColor: COLOR_PALETTE }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
      },
    },
  });
}

function updateCharts() {
  if (!state.charts.favorites || !state.charts.colors) {
    prepareCharts();
  }
  if (!state.charts.favorites || !state.charts.colors) {
    return;
  }

  const candyRatings = new Map();
  const colorTotals = new Map();

  state.kids.forEach((kid) => {
    kid.candies.forEach((candy) => {
      const stats = candyRatings.get(candy.type) || { totalRating: 0, count: 0 };
      stats.totalRating += candy.rating;
      stats.count += 1;
      candyRatings.set(candy.type, stats);

      colorTotals.set(candy.color, (colorTotals.get(candy.color) || 0) + candy.quantity);
    });
  });

  const favoriteLabels = [...candyRatings.keys()].slice(0, 8);
  const favoriteData = favoriteLabels.map((label) => {
    const stats = candyRatings.get(label);
    return stats.count ? Number((stats.totalRating / stats.count).toFixed(2)) : 0;
  });

  state.charts.favorites.data.labels = favoriteLabels;
  state.charts.favorites.data.datasets[0].data = favoriteData;
  state.charts.favorites.update();

  const colorLabels = [...colorTotals.keys()];
  const colorData = colorLabels.map((label) => colorTotals.get(label));

  state.charts.colors.data.labels = colorLabels;
  state.charts.colors.data.datasets[0].data = colorData;
  if (colorData.length > COLOR_PALETTE.length) {
    const repeats = Math.ceil(colorData.length / COLOR_PALETTE.length);
    state.charts.colors.data.datasets[0].backgroundColor = Array(repeats).fill(COLOR_PALETTE).flat().slice(0, colorData.length);
  } else {
    state.charts.colors.data.datasets[0].backgroundColor = COLOR_PALETTE.slice(0, colorData.length);
  }
  state.charts.colors.update();
}

function initializeMap() {
  if (state.map) return;
  if (typeof L === 'undefined') {
    console.warn('Leaflet has not loaded yet.');
    setTimeout(initializeMap, 250);
    return;
  }
  state.map = L.map('map', { zoomControl: false, scrollWheelZoom: false });
  L.control.zoom({ position: 'bottomright' }).addTo(state.map);
  L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(state.map);
  state.markerLayer = L.layerGroup().addTo(state.map);
  state.streetLayer = L.layerGroup().addTo(state.map);
  if (!state.mapClickBound) {
    state.map.on('click', handleStreetMapClick);
    state.mapClickBound = true;
  }
}

function updateMap() {
  if (!state.map || !state.markerLayer) {
    initializeMap();
  }
  if (!state.map || !state.markerLayer) {
    return;
  }
  state.markerLayer.clearLayers();
  const bounds = [];
  state.kids.forEach((kid) => {
    const { location } = kid;
    if (!location || !Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) {
      return;
    }
    const total = totalCandyForKid(kid);
    const marker = L.circleMarker([location.latitude, location.longitude], {
      radius: 12,
      color: '#ff6f1d',
      weight: 3,
      fillColor: '#a855f7',
      fillOpacity: 0.65,
    }).bindPopup(
      `
        <strong>${kid.name}</strong><br />
        ${location.city || ''}${location.state ? `, ${location.state}` : ''}<br />
        ${total} pieces logged
      `,
    );
    marker.addTo(state.markerLayer);
    bounds.push(marker.getLatLng());
  });

  renderStreetLogsOnMap();

  state.streetLogs.forEach((log) => {
    if (!Array.isArray(log.path)) return;
    log.path.forEach((point) => {
      if (!Array.isArray(point) || point.length !== 2) return;
      const [lat, lng] = point;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      bounds.push(L.latLng(lat, lng));
    });
  });

  if (bounds.length === 0) {
    state.map.setView([37.8, -96], 3);
  } else if (bounds.length === 1) {
    state.map.setView(bounds[0], 12);
  } else {
    state.map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] });
  }
}

function renderStreetLogsOnMap() {
  if (!state.streetLogs.length) {
    if (state.streetLayer) {
      state.streetLayer.clearLayers();
    }
    return;
  }
  if (!state.map || !state.streetLayer) {
    initializeMap();
  }
  if (!state.map || !state.streetLayer || typeof L === 'undefined') {
    return;
  }
  state.streetLayer.clearLayers();
  state.streetLogs.forEach((log) => {
    if (!Array.isArray(log.path) || log.path.length < 2) return;
    const average = Number(log.averagePieces) || 0;
    const color = getGenerosityColor(average);
    const weight = Math.max(4, Math.min(9, 3 + average));
    const candySummary = (log.candy || [])
      .map((entry) => `${entry.type}: ${entry.quantity}`)
      .join('<br />');
    const distanceText = formatDistanceMeters(log.distanceMeters);
    const popupLines = [
      `<strong>${log.streetName}</strong>`,
      `${log.totalPieces} pieces across ${log.housesVisited} houses`,
      `Avg ${average.toFixed(1)} pcs/house`,
    ];
    if (distanceText) {
      popupLines.push(`Route ≈ ${distanceText}`);
    }
    const popupContent = popupLines.join('<br />') + (candySummary ? `<br /><br />${candySummary}` : '');
    L.polyline(log.path, {
      color,
      weight,
      opacity: 0.85,
    })
      .bindPopup(popupContent)
      .addTo(state.streetLayer);
  });
}

function updateStreetLogList() {
  if (!streetLogList || !streetLogEmpty) return;
  streetLogList.innerHTML = '';
  if (!state.streetLogs.length) {
    showElement(streetLogEmpty);
    return;
  }
  hideElement(streetLogEmpty);
  const sorted = [...state.streetLogs].sort((a, b) => b.totalPieces - a.totalPieces);
  sorted.forEach((log) => {
    const item = document.createElement('li');
    const summary = document.createElement('div');
    summary.className = 'street-log-summary';
    const title = document.createElement('strong');
    title.textContent = log.streetName;
    const detail = document.createElement('small');
    const distanceText = formatDistanceMeters(log.distanceMeters);
    const detailParts = [`${log.totalPieces} pcs`, `${log.housesVisited} houses`];
    if (distanceText) {
      detailParts.push(distanceText);
    }
    detail.textContent = detailParts.join(' • ');
    const metric = document.createElement('span');
    metric.textContent = `${Number(log.averagePieces || 0).toFixed(1)} pcs/house`;
    const candySummary = (log.candy || [])
      .map((entry) => `${entry.type} (${entry.quantity})`)
      .join(', ');
    if (candySummary) {
      item.title = `Candy haul: ${candySummary}`;
    }
    summary.appendChild(title);
    summary.appendChild(detail);
    item.appendChild(summary);
    item.appendChild(metric);
    streetLogList.appendChild(item);
  });
}

function initializeGlobalStreetMap() {
  if (state.globalStreetMap) return;
  if (typeof L === 'undefined' || !streetMapContainer) {
    setTimeout(initializeGlobalStreetMap, 250);
    return;
  }
  state.globalStreetMap = L.map('streetMap', { zoomControl: false, scrollWheelZoom: false });
  L.control.zoom({ position: 'bottomright' }).addTo(state.globalStreetMap);
  L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(state.globalStreetMap);
  state.globalStreetLayer = L.layerGroup().addTo(state.globalStreetMap);
}

function updateGlobalStreetMap() {
  if (!streetMapContainer) return;
  if (!state.globalStreetMap || !state.globalStreetLayer) {
    initializeGlobalStreetMap();
  }
  if (!state.globalStreetMap || !state.globalStreetLayer || typeof L === 'undefined') {
    return;
  }
  state.globalStreetLayer.clearLayers();
  const sorted = [...state.streetLogs].filter((log) => Array.isArray(log.path) && log.path.length >= 2);
  const latLngs = [];
  sorted.forEach((log) => {
    const average = Number(log.averagePieces) || 0;
    const color = getGenerosityColor(average);
    const weight = Math.max(4, Math.min(9, 3 + average));
    L.polyline(log.path, {
      color,
      weight,
      opacity: 0.85,
    })
      .bindPopup(
        `<strong>${log.streetName}</strong><br />${log.totalPieces} pieces • ${log.housesVisited} houses<br />Avg ${average.toFixed(
          1,
        )} pcs/house`,
      )
      .addTo(state.globalStreetLayer);
    log.path.forEach((point) => {
      if (!Array.isArray(point) || point.length !== 2) return;
      const [lat, lng] = point;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      latLngs.push(L.latLng(lat, lng));
    });
  });

  if (latLngs.length === 0) {
    state.globalStreetMap.setView([37.8, -96], 3);
  } else if (latLngs.length === 1) {
    state.globalStreetMap.setView(latLngs[0], 12);
  } else {
    state.globalStreetMap.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40] });
  }

  if (!streetLeaderboard || state.family?.subscriptionStatus !== 'active') {
    return;
  }

  if (!sorted.length) {
    streetLeaderboard.innerHTML = '';
    const message = document.createElement('li');
    message.className = 'locked-message';
    message.textContent = 'Log a street to see the sweetest routes.';
    streetLeaderboard.appendChild(message);
    return;
  }

  streetLeaderboard.innerHTML = '';
  sorted
    .sort((a, b) => Number(b.averagePieces || 0) - Number(a.averagePieces || 0))
    .slice(0, 5)
    .forEach((log, index) => {
      const item = document.createElement('li');
      const wrapper = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = `#${index + 1} ${log.streetName}`;
      const detail = document.createElement('small');
      detail.textContent = `${log.housesVisited} houses • ${log.totalPieces} pcs`;
      wrapper.appendChild(title);
      wrapper.appendChild(detail);
      const metric = document.createElement('span');
      metric.textContent = `${Number(log.averagePieces || 0).toFixed(1)} pcs/house`;
      item.appendChild(wrapper);
      item.appendChild(metric);
      streetLeaderboard.appendChild(item);
    });
}

function updateStreetSubscriptionUI() {
  if (!streetMapWrapper || !streetMapPaywall || !streetLeaderboard) return;
  const isActive = state.family?.subscriptionStatus === 'active';
  streetMapWrapper.classList.toggle('locked', !isActive);
  streetMapPaywall.classList.toggle('hidden', isActive);
  if (!isActive) {
    streetLeaderboard.innerHTML = '';
    const item = document.createElement('li');
    item.className = 'locked-message';
    item.textContent = 'Activate your pass to reveal the sweetest streets.';
    streetLeaderboard.appendChild(item);
  }
  renderPreviewGallery();
}

function resetStreetForm() {
  if (streetForm) {
    streetForm.reset();
  }
  if (streetCandyList) {
    streetCandyList.innerHTML = '';
  }
  if (streetFormError) {
    streetFormError.textContent = '';
    hideElement(streetFormError);
  }
}

function addStreetCandyRow(type = '', quantity = '') {
  if (!streetCandyList) return;
  const row = document.createElement('div');
  row.className = 'street-candy-row';
  const select = document.createElement('select');
  select.required = true;
  select.setAttribute('aria-label', 'Candy type');
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Select type';
  placeholder.disabled = true;
  select.appendChild(placeholder);
  state.candyCatalog.forEach((entry) => {
    const option = document.createElement('option');
    option.value = entry.type;
    option.textContent = entry.type;
    select.appendChild(option);
  });
  if (type) {
    select.value = type;
  } else {
    select.selectedIndex = 0;
  }
  const input = document.createElement('input');
  input.type = 'number';
  input.min = '0';
  input.required = true;
  input.placeholder = 'Pieces';
  input.setAttribute('aria-label', 'Pieces collected');
  if (quantity !== '') {
    input.value = quantity;
  }
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn ghost small';
  removeBtn.textContent = 'Remove';
  removeBtn.addEventListener('click', () => {
    if (streetCandyList.children.length > 1) {
      streetCandyList.removeChild(row);
    } else {
      select.value = '';
      input.value = '';
    }
  });
  row.append(select, input, removeBtn);
  streetCandyList.appendChild(row);
}

function openStreetLogDialog() {
  if (!streetDialog) return;
  resetStreetForm();
  const segments = Math.max(state.streetDrawing.points.length - 1, 0);
  const distance = Math.round(computeStreetDistance(state.streetDrawing.points));
  if (streetDrawingSummary) {
    const parts = [`${segments} street segment${segments === 1 ? '' : 's'} captured`];
    const distanceText = formatDistanceMeters(distance);
    if (distanceText) {
      parts.push(`≈ ${distanceText}`);
    }
    streetDrawingSummary.textContent = parts.join(' • ');
  }
  if (streetFormError) {
    hideElement(streetFormError);
  }
  addStreetCandyRow();
  openDialog(streetDialog);
}

function handleStreetFormSubmit(event) {
  event.preventDefault();
  if (!state.streetDrawing.points.length) {
    closeDialog(streetDialog);
    resetStreetForm();
    resetStreetDrawing();
    return;
  }
  const houses = Number(streetHousesInput?.value);
  if (!Number.isFinite(houses) || houses <= 0) {
    if (streetFormError) {
      streetFormError.textContent = 'Enter how many houses you visited on this street.';
      showElement(streetFormError);
    }
    return;
  }
  const rows = streetCandyList ? Array.from(streetCandyList.querySelectorAll('.street-candy-row')) : [];
  const candyEntries = [];
  let hasError = false;
  rows.forEach((row) => {
    const select = row.querySelector('select');
    const input = row.querySelector('input');
    const type = select?.value;
    const quantity = Number(input?.value);
    if (!type || !Number.isFinite(quantity) || quantity < 0) {
      hasError = true;
      return;
    }
    candyEntries.push({ type, quantity });
  });
  if (hasError || !candyEntries.length) {
    if (streetFormError) {
      streetFormError.textContent = 'Choose at least one candy type and enter the pieces collected.';
      showElement(streetFormError);
    }
    return;
  }

  const streetName = streetNameInput?.value.trim() || 'Unnamed Street';
  const totalPieces = candyEntries.reduce((sum, entry) => sum + entry.quantity, 0);
  const distance = Math.round(computeStreetDistance(state.streetDrawing.points));
  const averagePieces = houses > 0 ? Number((totalPieces / houses).toFixed(2)) : 0;
  const path = state.streetDrawing.points.map((point) => [Number(point[0]), Number(point[1])]);

  const newLog = {
    id: createId('street'),
    streetName,
    housesVisited: houses,
    candy: candyEntries,
    path,
    totalPieces,
    averagePieces,
    distanceMeters: distance,
  };

  state.streetLogs.push(newLog);
  persistState();
  updateMap();
  updateStreetLogList();
  updateGlobalStreetMap();
  closeDialog(streetDialog);
  resetStreetForm();
  resetStreetDrawing();
}

function resetStreetDrawing() {
  state.streetDrawing.active = false;
  state.streetDrawing.points = [];
  if (state.streetDrawing.polyline && state.map) {
    state.map.removeLayer(state.streetDrawing.polyline);
  }
  state.streetDrawing.polyline = null;
  if (streetDrawingStatus) {
    streetDrawingStatus.textContent = '';
    hideElement(streetDrawingStatus);
  }
  if (cancelStreetLogBtn) hideElement(cancelStreetLogBtn);
  if (finishStreetLogBtn) {
    finishStreetLogBtn.setAttribute('disabled', 'true');
    hideElement(finishStreetLogBtn);
  }
  if (startStreetLogBtn) {
    showElement(startStreetLogBtn);
  }
}

function startStreetDrawing() {
  initializeMap();
  if (!state.map) return;
  state.streetDrawing.active = true;
  state.streetDrawing.points = [];
  if (state.streetDrawing.polyline) {
    state.map.removeLayer(state.streetDrawing.polyline);
    state.streetDrawing.polyline = null;
  }
  if (startStreetLogBtn) hideElement(startStreetLogBtn);
  if (cancelStreetLogBtn) showElement(cancelStreetLogBtn);
  if (finishStreetLogBtn) {
    finishStreetLogBtn.setAttribute('disabled', 'true');
    showElement(finishStreetLogBtn);
  }
  if (streetDrawingStatus) {
    streetDrawingStatus.textContent = 'Click the map to trace the street route. Add at least two points.';
    showElement(streetDrawingStatus);
  }
}

function handleStreetMapClick(event) {
  if (!state.streetDrawing.active) return;
  const { latlng } = event;
  if (!latlng || typeof L === 'undefined') return;
  const lat = Number(latlng.lat.toFixed(6));
  const lng = Number(latlng.lng.toFixed(6));
  state.streetDrawing.points.push([lat, lng]);
  if (!state.streetDrawing.polyline) {
    state.streetDrawing.polyline = L.polyline(state.streetDrawing.points, {
      color: '#38bdf8',
      weight: 4,
      dashArray: '8 6',
      opacity: 0.85,
    }).addTo(state.map);
  } else {
    state.streetDrawing.polyline.setLatLngs(state.streetDrawing.points);
  }
  if (streetDrawingStatus) {
    const pointCount = state.streetDrawing.points.length;
    streetDrawingStatus.textContent =
      pointCount < 2
        ? `Route points: ${pointCount}. Add at least one more point.`
        : `Route points: ${pointCount}. Ready to log this street.`;
    showElement(streetDrawingStatus);
  }
  if (finishStreetLogBtn && state.streetDrawing.points.length >= 2) {
    finishStreetLogBtn.removeAttribute('disabled');
  }
}

function finishStreetDrawing() {
  if (state.streetDrawing.points.length < 2) {
    if (streetDrawingStatus) {
      streetDrawingStatus.textContent = 'Add at least two points to log a street.';
      showElement(streetDrawingStatus);
    }
    return;
  }
  state.streetDrawing.active = false;
  if (cancelStreetLogBtn) hideElement(cancelStreetLogBtn);
  if (finishStreetLogBtn) {
    finishStreetLogBtn.setAttribute('disabled', 'true');
    hideElement(finishStreetLogBtn);
  }
  if (streetDrawingStatus) {
    streetDrawingStatus.textContent = 'Document the candy haul for this street to save it.';
    showElement(streetDrawingStatus);
  }
  openStreetLogDialog();
}

function downloadJSON(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadFamilyData() {
  const payload = {
    family: state.family,
    kids: state.kids.map((kid) => ({
      ...kid,
      candies: undefined,
    })),
  };
  downloadJSON('spooky-candy-cloud-data.json', payload);
}

function downloadInsights() {
  const payload = {
    generatedAt: new Date().toISOString(),
    totalTreats: totalTreatsEl.textContent,
    favoriteCandies: state.charts.favorites?.data?.labels || [],
    zipBreakdown: Array.from(zipBreakdownBody.querySelectorAll('tr')).map((row) => ({
      candy: row.children[0].textContent,
      count: Number(row.children[1].textContent),
    })),
    topZipCandy: topZipCandyEl.textContent,
  };
  downloadJSON('spooky-candy-insights.json', payload);
}

function updateSubscriptionUI() {
  if (!state.user) {
    hideElement(userBadge);
    showElement(signInButton);
    return;
  }
  userNameEl.textContent = state.user.displayName;
  if (state.user.photoURL) {
    userAvatarEl.src = state.user.photoURL;
  } else {
    userAvatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(state.user.displayName)}&background=ff6f1d&color=0b1120`;
  }
  subscriptionStatusEl.textContent = state.family?.subscriptionStatus === 'active'
    ? 'Subscription active'
    : 'Subscription paused';
  hideElement(signInButton);
  showElement(userBadge);
}

function updatePaywall() {
  if (!state.user) {
    hideElement(paywallSection);
    updateStreetSubscriptionUI();
    return;
  }
  if (state.family?.subscriptionStatus === 'active') {
    hideElement(paywallSection);
    Object.values(panels).forEach((panel) => panel.removeAttribute('aria-hidden'));
    updateStreetSubscriptionUI();
    updateGlobalStreetMap();
  } else {
    showElement(paywallSection);
    panels.insights.setAttribute('aria-hidden', 'true');
    updateStreetSubscriptionUI();
  }
}

function simulateSignIn() {
  state.user = {
    displayName: state.family?.owner?.name || 'Candy Parent',
    email: state.family?.owner?.email || 'parent@example.com',
    photoURL: state.family?.owner?.avatar || '',
  };
  toggleNavVisibility(true);
  updateSubscriptionUI();
  updatePaywall();
  updateAllFamilyViews();
  persistState();
}

function signOut() {
  state.user = null;
  hideElement(userBadge);
  showElement(signInButton);
  toggleNavVisibility(false);
  resetStreetDrawing();
  updateStreetSubscriptionUI();
}

function updateAllFamilyViews() {
  updateFamilySummary();
  updateSpotlightKid();
  updateLeaderboard();
  updateAchievements();
  updateLearningPrompts();
  updateStarMeter();
  updateTimeline();
  updateClassroom();
  updateMoodboard();
  chooseQuest();
  updateKidCards();
  updateKidSelect();
  updateCandyTable();
  updateTotalTreats();
  updateZipInsights();
  updateCharts();
  updateMap();
  updateStreetLogList();
  updateGlobalStreetMap();
  renderPreviewGallery();
}

function handleZipUpdate(event) {
  event?.preventDefault();
  if (!zipInput.value) return;
  state.family = state.family || {};
  state.family.zipCode = zipInput.value;
  zipDisplayEl.textContent = zipInput.value;
  persistState();
  closeDialog(zipDialog);
  updateZipInsights();
}

function setupEventListeners() {
  document.querySelectorAll('.nav-pill').forEach((button) => {
    button.addEventListener('click', () => {
      showPanel(button.dataset.panelTarget);
    });
  });

  addKidBtn.addEventListener('click', () => {
    state.editingKidId = null;
    kidFormTitle.textContent = 'Add kid';
    kidForm.reset();
    openDialog(kidDialog);
  });

  kidForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const payload = {
      name: kidNameInput.value.trim(),
      costume: kidCostumeInput.value.trim() || 'Mystery costume',
      birthYear: kidBirthYearInput.value ? Number(kidBirthYearInput.value) : null,
    };
    upsertKid(payload);
    closeDialog(kidDialog);
    resetKidForm();
  });

  kidDialog.querySelectorAll('[data-close]').forEach((button) => {
    button.addEventListener('click', () => {
      closeDialog(kidDialog);
      resetKidForm();
    });
  });

  kidSelectEl.addEventListener('change', (event) => {
    state.selectedKidId = event.target.value || null;
    updateCandyTable();
  });

  addCandyBtn.addEventListener('click', () => {
    const kidId = kidSelectEl.value || state.selectedKidId || state.kids[0]?.id;
    if (!kidId) return;
    openCandyEditor(kidId, null);
  });

  candyForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const kidId = state.selectedKidId || kidSelectEl.value;
    if (!kidId) return;
    const catalogEntry = state.candyCatalog.find((entry) => entry.type === candyTypeSelect.value);
    upsertCandy(kidId, {
      type: candyTypeSelect.value,
      quantity: Number(candyCountInput.value),
      rating: state.selectedRating,
      notes: candyNotesInput.value.trim(),
      color: catalogEntry?.color || 'Mystery',
      year: new Date().getFullYear(),
    });
    closeDialog(candyDialog);
    resetCandyForm();
  });

  candyDialog.querySelectorAll('[data-close]').forEach((button) => {
    button.addEventListener('click', () => {
      closeDialog(candyDialog);
      resetCandyForm();
    });
  });

  if (startStreetLogBtn) {
    startStreetLogBtn.addEventListener('click', startStreetDrawing);
  }
  if (cancelStreetLogBtn) {
    cancelStreetLogBtn.addEventListener('click', resetStreetDrawing);
  }
  if (finishStreetLogBtn) {
    finishStreetLogBtn.addEventListener('click', finishStreetDrawing);
  }
  if (addStreetCandyBtn) {
    addStreetCandyBtn.addEventListener('click', () => addStreetCandyRow());
  }
  if (streetForm) {
    streetForm.addEventListener('submit', handleStreetFormSubmit);
  }
  if (streetDialog) {
    streetDialog.querySelectorAll('[data-close]').forEach((button) => {
      button.addEventListener('click', () => {
        closeDialog(streetDialog);
        resetStreetForm();
        resetStreetDrawing();
      });
    });
    streetDialog.addEventListener('close', () => {
      resetStreetForm();
      resetStreetDrawing();
    });
  }

  if (streetMapActivateBtn) {
    streetMapActivateBtn.addEventListener('click', () => {
      activateSubscriptionBtn?.click();
    });
  }

  signInButton.addEventListener('click', simulateSignIn);
  signOutButton.addEventListener('click', signOut);

  activateSubscriptionBtn.addEventListener('click', () => {
    state.family.subscriptionStatus = 'active';
    state.family.subscriptionExpiry = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();
    updateSubscriptionUI();
    updatePaywall();
    persistState();
  });

  downloadDataBtn.addEventListener('click', downloadFamilyData);
  downloadInsightsBtn.addEventListener('click', downloadInsights);

  refreshInsightsBtn.addEventListener('click', () => {
    updateSpotlightKid();
    updateZipInsights();
    updateCharts();
  });

  newQuestBtn.addEventListener('click', chooseQuest);
  cycleSpotlightBtn.addEventListener('click', updateSpotlightKid);

  openZipDialogBtn.addEventListener('click', () => {
    if (state.family?.zipCode) {
      zipInput.value = state.family.zipCode;
    }
    openDialog(zipDialog);
  });

  scrollToFamilyBtn.addEventListener('click', () => {
    showPanel('family');
    panels.family.scrollIntoView({ behavior: 'smooth' });
  });

  zipSubmitBtn.addEventListener('click', handleZipUpdate);
  zipDialog.addEventListener('close', () => {
    zipInput.value = state.family?.zipCode || '';
  });
}

async function init() {
  try {
    const response = await fetch('data/candy.json');
    const baseData = await response.json();
    const persisted = loadPersistedState();
    hydrateState(baseData, persisted);
    renderPreviewGallery();
    initializeMap();
    initializeGlobalStreetMap();
    prepareCharts();
    setupEventListeners();
    renderRatingButtons();
    toggleNavVisibility(false);
    updateStreetSubscriptionUI();
    updateStreetLogList();
    updateGlobalStreetMap();
    if (state.family?.zipCode) {
      zipDisplayEl.textContent = state.family.zipCode;
    }
  } catch (error) {
    console.error('Failed to load candy data', error);
  }
}

document.addEventListener('DOMContentLoaded', init);
