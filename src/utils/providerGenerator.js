// Generate deterministic provider data based on index
// This avoids storing 1.6M+ providers in memory while maintaining consistency

const PROVIDER_COUNT = 1678625;

// US County FIPS codes distribution (simplified - using state codes as proxy)
const stateDistribution = {
  'CA': 0.12, 'TX': 0.09, 'FL': 0.065, 'NY': 0.06, 'PA': 0.04,
  'IL': 0.04, 'OH': 0.035, 'GA': 0.032, 'NC': 0.031, 'MI': 0.03,
  'NJ': 0.028, 'VA': 0.026, 'WA': 0.023, 'AZ': 0.022, 'MA': 0.021,
  'TN': 0.021, 'IN': 0.02, 'MO': 0.019, 'MD': 0.018, 'WI': 0.018,
  'CO': 0.017, 'MN': 0.017, 'SC': 0.015, 'AL': 0.015, 'LA': 0.014,
  'KY': 0.013, 'OR': 0.013, 'OK': 0.012, 'CT': 0.011, 'UT': 0.01,
  'IA': 0.01, 'NV': 0.009, 'AR': 0.009, 'MS': 0.009, 'KS': 0.009,
  'NM': 0.006, 'NE': 0.006, 'WV': 0.005, 'ID': 0.005, 'HI': 0.004,
  'NH': 0.004, 'ME': 0.004, 'RI': 0.003, 'MT': 0.003, 'DE': 0.003,
  'SD': 0.003, 'ND': 0.002, 'AK': 0.002, 'VT': 0.002, 'WY': 0.002
};

const specialties = [
  'Primary Care', 'Family Medicine', 'Internal Medicine', 'Pediatrics',
  'Cardiology', 'Dermatology', 'Orthopedics', 'Psychiatry',
  'Obstetrics/Gynecology', 'Emergency Medicine', 'Radiology',
  'Anesthesiology', 'Surgery', 'Oncology', 'Neurology',
  'Ophthalmology', 'Urology', 'Gastroenterology', 'Endocrinology',
  'Pulmonology', 'Nephrology', 'Rheumatology', 'Pathology',
  'Physical Medicine', 'Allergy/Immunology'
];

const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Barbara', 'David', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
];

// Deterministic hash function
function hash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Get state for provider based on index
function getStateForProvider(index) {
  const states = Object.keys(stateDistribution);
  const distributions = Object.values(stateDistribution);

  // Use index to deterministically assign state
  const seed = hash(`state_${index}`);
  const random = (seed % 10000) / 10000;

  let cumulative = 0;
  for (let i = 0; i < distributions.length; i++) {
    cumulative += distributions[i];
    if (random <= cumulative) {
      return states[i];
    }
  }
  return states[states.length - 1];
}

// Generate a single provider by index
export function generateProvider(index) {
  const seed = hash(`provider_${index}`);

  // Name
  const firstNameIdx = hash(`first_${index}`) % firstNames.length;
  const lastNameIdx = hash(`last_${index}`) % lastNames.length;
  const name = `Dr. ${firstNames[firstNameIdx]} ${lastNames[lastNameIdx]}`;

  // NPI (National Provider Identifier) - 10 digits
  const npi = `${1000000000 + (seed % 900000000)}`;

  // Specialty
  const specialtyIdx = hash(`specialty_${index}`) % specialties.length;
  const specialty = specialties[specialtyIdx];

  // State
  const state = getStateForProvider(index);

  // Confidence rating based on seed
  const confidenceSeed = seed % 100;
  let confidence;
  if (confidenceSeed < 60) confidence = 'High';
  else if (confidenceSeed < 85) confidence = 'Mid';
  else confidence = 'Low';

  // Accepting patients
  const acceptingPatients = (seed % 10) > 2; // ~70% accepting

  // Years in practice
  const yearsInPractice = 1 + (hash(`years_${index}`) % 40);

  return {
    id: index,
    npi,
    name,
    specialty,
    state,
    confidence,
    acceptingPatients,
    yearsInPractice,
    inReview: false,
    removed: false
  };
}

// Get total provider count
export function getTotalProviderCount() {
  return PROVIDER_COUNT;
}

// Get providers by state (for adequacy calculations)
export function getProviderCountByState(removedProviderIds = new Set()) {
  const counts = {};

  // Initialize all states
  Object.keys(stateDistribution).forEach(state => {
    counts[state] = 0;
  });

  // Count providers (accounting for removed ones)
  for (let i = 0; i < PROVIDER_COUNT; i++) {
    if (!removedProviderIds.has(i)) {
      const state = getStateForProvider(i);
      counts[state]++;
    }
  }

  return counts;
}

// Get providers by confidence level
export function getProvidersByConfidence(removedProviderIds = new Set()) {
  const counts = { High: 0, Mid: 0, Low: 0 };

  for (let i = 0; i < PROVIDER_COUNT; i++) {
    if (!removedProviderIds.has(i)) {
      const provider = generateProvider(i);
      counts[provider.confidence]++;
    }
  }

  return counts;
}

// Search providers with pagination
export function searchProviders(options = {}) {
  const {
    page = 0,
    pageSize = 50,
    searchTerm = '',
    state = null,
    specialty = null,
    confidence = null,
    inReview = null,
    removedProviderIds = new Set()
  } = options;

  const results = [];
  let skipped = 0;
  let checked = 0;
  const startIndex = page * pageSize;

  // Scan through providers to find matches
  for (let i = 0; i < PROVIDER_COUNT && results.length < pageSize; i++) {
    if (removedProviderIds.has(i)) continue;

    const provider = generateProvider(i);
    checked++;

    // Apply filters
    if (state && provider.state !== state) continue;
    if (specialty && provider.specialty !== specialty) continue;
    if (confidence && provider.confidence !== confidence) continue;
    if (inReview !== null && provider.inReview !== inReview) continue;
    if (searchTerm && !provider.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !provider.npi.includes(searchTerm)) continue;

    // Pagination
    if (skipped < startIndex) {
      skipped++;
      continue;
    }

    results.push(provider);
  }

  return {
    providers: results,
    hasMore: checked < PROVIDER_COUNT,
    totalChecked: checked
  };
}

export { specialties, stateDistribution };
