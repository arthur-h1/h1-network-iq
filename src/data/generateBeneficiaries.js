// Generate realistic beneficiary data with addresses
// This creates 4 million beneficiaries distributed across the US

// We'll use a more efficient approach: generate metadata and use a seeded random function
// to generate beneficiaries on-demand rather than storing 4 million objects in memory

const AGE_GROUPS = ['18-34', '35-49', '50-64', '65+'];
const PLAN_TYPES = ['HMO', 'PPO', 'EPO', 'POS'];

// US Counties with approximate population and coordinates
// This is a subset - in production you'd have all ~3000 counties
const US_COUNTIES = [
  // Major metro areas
  { name: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437, population: 10014009 },
  { name: 'Cook', state: 'IL', lat: 41.8781, lng: -87.6298, population: 5275541 },
  { name: 'Harris', state: 'TX', lat: 29.7604, lng: -95.3698, population: 4713325 },
  { name: 'Maricopa', state: 'AZ', lat: 33.4484, lng: -112.0740, population: 4485414 },
  { name: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611, population: 3338330 },
  { name: 'Orange', state: 'CA', lat: 33.7175, lng: -117.8311, population: 3186989 },
  { name: 'Miami-Dade', state: 'FL', lat: 25.7617, lng: -80.1918, population: 2716940 },
  { name: 'Kings', state: 'NY', lat: 40.6782, lng: -73.9442, population: 2559903 },
  { name: 'Queens', state: 'NY', lat: 40.7282, lng: -73.7949, population: 2253858 },
  { name: 'Riverside', state: 'CA', lat: 33.9533, lng: -117.3962, population: 2470546 },
  { name: 'San Bernardino', state: 'CA', lat: 34.1083, lng: -117.2898, population: 2180085 },
  { name: 'Clark', state: 'NV', lat: 36.1699, lng: -115.1398, population: 2265461 },
  { name: 'Tarrant', state: 'TX', lat: 32.7357, lng: -97.1081, population: 2110640 },
  { name: 'Bexar', state: 'TX', lat: 29.4241, lng: -98.4936, population: 2009324 },
  { name: 'Wayne', state: 'MI', lat: 42.3314, lng: -83.0458, population: 1749343 },
  { name: 'Santa Clara', state: 'CA', lat: 37.3541, lng: -121.9552, population: 1936259 },
  { name: 'Broward', state: 'FL', lat: 26.1224, lng: -80.1373, population: 1952778 },
  { name: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060, population: 1632480 },
  { name: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652, population: 1584064 },
  { name: 'Middlesex', state: 'MA', lat: 42.4867, lng: -71.3824, population: 1611699 },
  { name: 'Alameda', state: 'CA', lat: 37.6017, lng: -121.7195, population: 1671329 },
  { name: 'King', state: 'WA', lat: 47.6062, lng: -122.3321, population: 2269675 },
  { name: 'Palm Beach', state: 'FL', lat: 26.7056, lng: -80.0364, population: 1496770 },
  { name: 'Hennepin', state: 'MN', lat: 44.9778, lng: -93.2650, population: 1281565 },
  { name: 'Cuyahoga', state: 'OH', lat: 41.4993, lng: -81.6944, population: 1235072 },
  { name: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.7970, population: 2637772 },
  { name: 'Suffolk', state: 'MA', lat: 42.3601, lng: -71.0589, population: 803907 },
  { name: 'Bronx', state: 'NY', lat: 40.8448, lng: -73.8648, population: 1472654 },
  { name: 'Travis', state: 'TX', lat: 30.2672, lng: -97.7431, population: 1273954 },
  { name: 'Franklin', state: 'OH', lat: 39.9612, lng: -82.9988, population: 1316756 },
  // Add more counties to reach better coverage
  { name: 'Fulton', state: 'GA', lat: 33.7490, lng: -84.3880, population: 1063937 },
  { name: 'DeKalb', state: 'GA', lat: 33.7712, lng: -84.2169, population: 759297 },
  { name: 'Mecklenburg', state: 'NC', lat: 35.2271, lng: -80.8431, population: 1110356 },
  { name: 'Wake', state: 'NC', lat: 35.7796, lng: -78.6382, population: 1111761 },
  { name: 'Hillsborough', state: 'FL', lat: 27.9506, lng: -82.4572, population: 1459762 },
  { name: 'Salt Lake', state: 'UT', lat: 40.7608, lng: -111.8910, population: 1185238 },
  { name: 'Shelby', state: 'TN', lat: 35.1495, lng: -90.0490, population: 927644 },
  { name: 'Jefferson', state: 'KY', lat: 38.2527, lng: -85.7585, population: 766757 },
  { name: 'Milwaukee', state: 'WI', lat: 43.0389, lng: -87.9065, population: 945726 },
  { name: 'Baltimore City', state: 'MD', lat: 39.2904, lng: -76.6122, population: 585708 },
];

// Seeded random number generator for consistent results
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }

  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

// Generate a single beneficiary based on ID (deterministic)
export function generateBeneficiary(id) {
  const rng = new SeededRandom(id);

  // Select county based on population distribution
  const totalPopulation = US_COUNTIES.reduce((sum, c) => sum + c.population, 0);
  let populationThreshold = rng.next() * totalPopulation;
  let selectedCounty = US_COUNTIES[0];

  for (const county of US_COUNTIES) {
    populationThreshold -= county.population;
    if (populationThreshold <= 0) {
      selectedCounty = county;
      break;
    }
  }

  // Generate coordinates near county center
  const latOffset = (rng.next() - 0.5) * 0.2; // ~11 mile radius
  const lngOffset = (rng.next() - 0.5) * 0.2;
  const lat = selectedCounty.lat + latOffset;
  const lng = selectedCounty.lng + lngOffset;

  // Generate other attributes
  const ageGroup = AGE_GROUPS[Math.floor(rng.next() * AGE_GROUPS.length)];
  const planType = PLAN_TYPES[Math.floor(rng.next() * PLAN_TYPES.length)];

  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen', 'Daniel', 'Nancy', 'Matthew', 'Lisa', 'Anthony', 'Betty', 'Mark', 'Margaret', 'Donald', 'Sandra', 'Paul', 'Ashley', 'Steven', 'Emily', 'Andrew', 'Donna'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

  const firstName = firstNames[Math.floor(rng.next() * firstNames.length)];
  const lastName = lastNames[Math.floor(rng.next() * lastNames.length)];

  const streetNumber = Math.floor(rng.next() * 9999) + 1;
  const streetNames = ['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Park Blvd', 'Washington St', 'Lake Dr', 'Hill Rd', 'River Rd', 'Forest Ave', 'Pine St', 'Elm St', '1st Ave', '2nd Ave', 'Broadway', 'Market St'];
  const streetName = streetNames[Math.floor(rng.next() * streetNames.length)];

  return {
    id: `BEN-${String(id).padStart(7, '0')}`,
    name: `${firstName} ${lastName}`,
    ageGroup,
    planType,
    address: `${streetNumber} ${streetName}`,
    city: selectedCounty.name,
    state: selectedCounty.state,
    zip: String(Math.floor(rng.next() * 90000) + 10000),
    lat,
    lng,
    hasProvider: rng.next() > 0.15, // 85% have assigned provider
    chronicConditions: Math.floor(rng.next() * 3), // 0-2 chronic conditions
  };
}

// Generate beneficiaries in batches (for performance)
export function generateBeneficiariesBatch(startId, count) {
  const beneficiaries = [];
  for (let i = 0; i < count; i++) {
    beneficiaries.push(generateBeneficiary(startId + i));
  }
  return beneficiaries;
}

// Get total beneficiary count
export const TOTAL_BENEFICIARIES = 4000000;

// Get beneficiaries in a bounding box (samples a subset for performance)
export function getBeneficiariesInBounds(bounds, sampleSize = 1000) {
  const beneficiaries = [];
  const step = Math.ceil(TOTAL_BENEFICIARIES / sampleSize);

  for (let i = 0; i < TOTAL_BENEFICIARIES; i += step) {
    const ben = generateBeneficiary(i);
    if (ben.lat >= bounds.south && ben.lat <= bounds.north &&
        ben.lng >= bounds.west && ben.lng <= bounds.east) {
      beneficiaries.push(ben);
    }
  }

  return beneficiaries;
}

// Get beneficiaries for a specific state (samples)
export function getBeneficiariesByState(stateCode, sampleSize = 5000) {
  const beneficiaries = [];
  const step = Math.ceil(TOTAL_BENEFICIARIES / (sampleSize * 2)); // Sample more to filter

  for (let i = 0; i < TOTAL_BENEFICIARIES; i += step) {
    const ben = generateBeneficiary(i);
    if (ben.state === stateCode) {
      beneficiaries.push(ben);
      if (beneficiaries.length >= sampleSize) break;
    }
  }

  return beneficiaries;
}

// Get summary statistics
export function getBeneficiaryStats() {
  return {
    total: TOTAL_BENEFICIARIES,
    counties: US_COUNTIES.length,
    avgPerCounty: Math.floor(TOTAL_BENEFICIARIES / US_COUNTIES.length),
  };
}
