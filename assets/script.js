const yearFilter = document.getElementById('yearFilter');
const favoritePercentageEl = document.getElementById('favoritePercentage');
const topCandyEl = document.getElementById('topCandy');
const totalPiecesEl = document.getElementById('totalPieces');
const uniqueCandyCountEl = document.getElementById('uniqueCandyCount');
const scrollToDashboardBtn = document.getElementById('scrollToDashboard');
const downloadDataBtn = document.getElementById('downloadData');

let totalCandyChart;
let candyTypeChart;
let colorChart;
let candyData = null;
let map;
let markerLayer;

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

async function init() {
  try {
    const response = await fetch('data/candy.json');
    candyData = await response.json();
    setupYearFilter();
    initializeCharts();
    initializeMap();
    updateDashboard(yearFilter.value);
  } catch (error) {
    console.error('Failed to load candy data', error);
  }
}

function setupYearFilter() {
  const years = new Set();

  candyData.children.forEach((child) => {
    child.collections.forEach((collection) => {
      years.add(collection.year);
    });
  });

  const sortedYears = Array.from(years).sort((a, b) => a - b);
  yearFilter.innerHTML = [`<option value="all">All Years</option>`,
    ...sortedYears.map((year) => `<option value="${year}">${year}</option>`),
  ].join('');

  yearFilter.value = 'all';
}

function matchesYear(collection, year) {
  return year === 'all' || collection.year === Number(year);
}

function aggregateTotals() {
  const totalsByYear = new Map();

  candyData.children.forEach((child) => {
    child.collections.forEach((collection) => {
      const total = collection.candy.reduce((sum, item) => sum + item.quantity, 0);
      totalsByYear.set(collection.year, (totalsByYear.get(collection.year) || 0) + total);
    });
  });

  return totalsByYear;
}

function aggregateCandyByType(year) {
  const typeMap = new Map();

  candyData.children.forEach((child) => {
    child.collections
      .filter((collection) => matchesYear(collection, year))
      .forEach((collection) => {
        collection.candy.forEach((item) => {
          typeMap.set(item.type, (typeMap.get(item.type) || 0) + item.quantity);
        });
      });
  });

  return typeMap;
}

function aggregateCandyByColor(year) {
  const colorMap = new Map();

  candyData.children.forEach((child) => {
    child.collections
      .filter((collection) => matchesYear(collection, year))
      .forEach((collection) => {
        collection.candy.forEach((item) => {
          colorMap.set(item.color, (colorMap.get(item.color) || 0) + item.quantity);
        });
      });
  });

  return colorMap;
}

function computeFavoriteStats(year) {
  let favoriteTotal = 0;
  let overallTotal = 0;
  let topCandy = { name: 'N/A', rating: 0 };

  candyData.children.forEach((child) => {
    child.collections
      .filter((collection) => matchesYear(collection, year))
      .forEach((collection) => {
        collection.candy.forEach((item) => {
          overallTotal += item.quantity;
          if (item.rating >= 4) {
            favoriteTotal += item.quantity;
          }
          if (item.rating > topCandy.rating) {
            topCandy = { name: item.type, rating: item.rating };
          }
        });
      });
  });

  const percentage = overallTotal === 0 ? 0 : Math.round((favoriteTotal / overallTotal) * 100);

  return { percentage, topCandy: `${topCandy.name} (${topCandy.rating.toFixed(1)}/5)` };
}

function computeSummaryStats(year) {
  let totalPieces = 0;
  const uniqueCandy = new Set();

  candyData.children.forEach((child) => {
    child.collections
      .filter((collection) => matchesYear(collection, year))
      .forEach((collection) => {
        collection.candy.forEach((item) => {
          totalPieces += item.quantity;
          uniqueCandy.add(item.type);
        });
      });
  });

  return { totalPieces, uniqueCount: uniqueCandy.size };
}

function initializeCharts() {
  const ctxTotal = document.getElementById('totalCandyChart');
  const ctxType = document.getElementById('candyTypeChart');
  const ctxColor = document.getElementById('colorChart');

  totalCandyChart = new Chart(ctxTotal, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Total Pieces',
          data: [],
          borderColor: '#ff6f1d',
          backgroundColor: 'rgba(255, 111, 29, 0.25)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#f97316',
          pointRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#f1ecff' } },
        tooltip: {
          backgroundColor: '#1c122d',
          titleColor: '#ff6f1d',
          bodyColor: '#f1ecff',
        },
      },
      scales: {
        x: {
          ticks: { color: '#f1ecff' },
          grid: { color: 'rgba(255, 255, 255, 0.08)' },
        },
        y: {
          ticks: { color: '#f1ecff' },
          grid: { color: 'rgba(255, 255, 255, 0.08)' },
          beginAtZero: true,
        },
      },
    },
  });

  candyTypeChart = new Chart(ctxType, {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: COLOR_PALETTE,
          borderWidth: 2,
          borderColor: '#0f0a1a',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#f1ecff', usePointStyle: true },
        },
        tooltip: {
          callbacks: {
            label(context) {
              const total = context.dataset.data.reduce((sum, value) => sum + value, 0);
              const percentage = total === 0 ? 0 : ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: ${context.parsed} pcs (${percentage}%)`;
            },
          },
          backgroundColor: '#1c122d',
          titleColor: '#ff6f1d',
          bodyColor: '#f1ecff',
        },
      },
    },
  });

  colorChart = new Chart(ctxColor, {
    type: 'radar',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Candy Colors',
          data: [],
          backgroundColor: 'rgba(168, 85, 247, 0.25)',
          borderColor: '#a855f7',
          pointBackgroundColor: '#48e287',
          pointBorderColor: '#0f0a1a',
          pointHoverBackgroundColor: '#ff6f1d',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          grid: { color: 'rgba(255, 255, 255, 0.12)' },
          angleLines: { color: 'rgba(255, 255, 255, 0.12)' },
          pointLabels: { color: '#f1ecff' },
          ticks: {
            display: true,
            showLabelBackdrop: false,
            color: '#f1ecff',
            beginAtZero: true,
          },
        },
      },
      plugins: {
        legend: { labels: { color: '#f1ecff' } },
        tooltip: {
          backgroundColor: '#1c122d',
          titleColor: '#ff6f1d',
          bodyColor: '#f1ecff',
        },
      },
    },
  });
}

function updateTotalCandyChart() {
  const totalsByYear = aggregateTotals();
  const years = Array.from(totalsByYear.keys()).sort((a, b) => a - b);
  const totals = years.map((year) => totalsByYear.get(year));

  totalCandyChart.data.labels = years;
  totalCandyChart.data.datasets[0].data = totals;
  totalCandyChart.update();
}

function updateCandyTypeChart(year) {
  const typeMap = aggregateCandyByType(year);
  const labels = Array.from(typeMap.keys());
  const values = labels.map((label) => typeMap.get(label));

  candyTypeChart.data.labels = labels;
  candyTypeChart.data.datasets[0].data = values;

  if (values.length > COLOR_PALETTE.length) {
    const repeats = Math.ceil(values.length / COLOR_PALETTE.length);
    candyTypeChart.data.datasets[0].backgroundColor = Array(repeats)
      .fill(COLOR_PALETTE)
      .flat()
      .slice(0, values.length);
  } else {
    candyTypeChart.data.datasets[0].backgroundColor = COLOR_PALETTE.slice(0, values.length);
  }

  candyTypeChart.update();
}

function updateColorChart(year) {
  const colorMap = aggregateCandyByColor(year);
  const labels = Array.from(colorMap.keys());
  const values = labels.map((label) => colorMap.get(label));

  colorChart.data.labels = labels;
  colorChart.data.datasets[0].data = values;
  colorChart.update();
}

function initializeMap() {
  map = L.map('map', {
    zoomControl: false,
    scrollWheelZoom: false,
  });

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  markerLayer = L.layerGroup().addTo(map);
}

function updateMap(year) {
  markerLayer.clearLayers();

  const markers = [];

  candyData.children.forEach((child) => {
    const totalForYear = child.collections
      .filter((collection) => matchesYear(collection, year))
      .reduce((sum, collection) => sum + collection.candy.reduce((s, item) => s + item.quantity, 0), 0);

    if (totalForYear === 0) {
      return;
    }

    const { latitude, longitude, city, state, country } = child.location;
    const popupContent = `
      <strong>${child.name}</strong><br />
      ${city}, ${state}<br />
      ${country}<br />
      <span style="color: #ff6f1d; font-weight: 700;">${totalForYear} pieces in ${year}</span>
    `;

    const marker = L.circleMarker([latitude, longitude], {
      radius: 12,
      color: '#ff6f1d',
      weight: 3,
      fillColor: '#a855f7',
      fillOpacity: 0.65,
    }).bindPopup(popupContent);

    markerLayer.addLayer(marker);
    markers.push(marker.getLatLng());
  });

  if (markers.length > 0) {
    map.fitBounds(L.latLngBounds(markers), { padding: [50, 50] });
  } else {
    map.setView([20, 0], 2);
  }
}

function updateFavoriteStats(year) {
  const { percentage, topCandy } = computeFavoriteStats(year);
  favoritePercentageEl.textContent = `${percentage}%`;
  topCandyEl.textContent = topCandy;
}

function updateSummaryStats(year) {
  const { totalPieces, uniqueCount } = computeSummaryStats(year);
  totalPiecesEl.textContent = totalPieces;
  uniqueCandyCountEl.textContent = uniqueCount;
}

function updateDashboard(year) {
  updateTotalCandyChart();
  updateCandyTypeChart(year);
  updateColorChart(year);
  updateMap(year);
  updateFavoriteStats(year);
  updateSummaryStats(year);
}

yearFilter.addEventListener('change', (event) => {
  updateDashboard(event.target.value);
});

scrollToDashboardBtn.addEventListener('click', () => {
  document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
});

downloadDataBtn.addEventListener('click', () => {
  const element = document.createElement('a');
  element.href = 'data/candy.json';
  element.download = 'candy-data.json';
  element.click();
});

document.addEventListener('DOMContentLoaded', init);
