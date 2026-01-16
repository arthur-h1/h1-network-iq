// Generate realistic provider data with addresses
// This creates a set of providers distributed across the US

const PROVIDER_SPECIALTIES = [
  'Primary Care',
  'Cardiology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'Obstetrics & Gynecology',
  'Psychiatry',
  'Neurology',
  'Gastroenterology',
  'Endocrinology',
];

// Major US cities with coordinates for clustering providers
const MAJOR_CITIES = [
  { name: 'New York, NY', lat: 40.7128, lng: -74.0060, state: 'NY', population: 8336817 },
  { name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437, state: 'CA', population: 3979576 },
  { name: 'Chicago, IL', lat: 41.8781, lng: -87.6298, state: 'IL', population: 2693976 },
  { name: 'Houston, TX', lat: 29.7604, lng: -95.3698, state: 'TX', population: 2320268 },
  { name: 'Phoenix, AZ', lat: 33.4484, lng: -112.0740, state: 'AZ', population: 1680992 },
  { name: 'Philadelphia, PA', lat: 39.9526, lng: -75.1652, state: 'PA', population: 1584064 },
  { name: 'San Antonio, TX', lat: 29.4241, lng: -98.4936, state: 'TX', population: 1547253 },
  { name: 'San Diego, CA', lat: 32.7157, lng: -117.1611, state: 'CA', population: 1423851 },
  { name: 'Dallas, TX', lat: 32.7767, lng: -96.7970, state: 'TX', population: 1343573 },
  { name: 'San Jose, CA', lat: 37.3382, lng: -121.8863, state: 'CA', population: 1021795 },
  { name: 'Austin, TX', lat: 30.2672, lng: -97.7431, state: 'TX', population: 978908 },
  { name: 'Jacksonville, FL', lat: 30.3322, lng: -81.6557, state: 'FL', population: 911507 },
  { name: 'Fort Worth, TX', lat: 32.7555, lng: -97.3308, state: 'TX', population: 909585 },
  { name: 'Columbus, OH', lat: 39.9612, lng: -82.9988, state: 'OH', population: 898553 },
  { name: 'Charlotte, NC', lat: 35.2271, lng: -80.8431, state: 'NC', population: 885708 },
  { name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194, state: 'CA', population: 881549 },
  { name: 'Indianapolis, IN', lat: 39.7684, lng: -86.1581, state: 'IN', population: 876384 },
  { name: 'Seattle, WA', lat: 47.6062, lng: -122.3321, state: 'WA', population: 753675 },
  { name: 'Denver, CO', lat: 39.7392, lng: -104.9903, state: 'CO', population: 727211 },
  { name: 'Boston, MA', lat: 42.3601, lng: -71.0589, state: 'MA', population: 692600 },
  { name: 'Nashville, TN', lat: 36.1627, lng: -86.7816, state: 'TN', population: 689447 },
  { name: 'Detroit, MI', lat: 42.3314, lng: -83.0458, state: 'MI', population: 639111 },
  { name: 'Portland, OR', lat: 45.5152, lng: -122.6784, state: 'OR', population: 652503 },
  { name: 'Las Vegas, NV', lat: 36.1699, lng: -115.1398, state: 'NV', population: 641903 },
  { name: 'Memphis, TN', lat: 35.1495, lng: -90.0490, state: 'TN', population: 633104 },
  { name: 'Louisville, KY', lat: 38.2527, lng: -85.7585, state: 'KY', population: 617638 },
  { name: 'Baltimore, MD', lat: 39.2904, lng: -76.6122, state: 'MD', population: 585708 },
  { name: 'Milwaukee, WI', lat: 43.0389, lng: -87.9065, state: 'WI', population: 577222 },
  { name: 'Albuquerque, NM', lat: 35.0844, lng: -106.6504, state: 'NM', population: 564559 },
  { name: 'Tucson, AZ', lat: 32.2226, lng: -110.9747, state: 'AZ', population: 548073 },
  { name: 'Fresno, CA', lat: 36.7378, lng: -119.7871, state: 'CA', population: 542107 },
  { name: 'Mesa, AZ', lat: 33.4152, lng: -111.8315, state: 'AZ', population: 528159 },
  { name: 'Sacramento, CA', lat: 38.5816, lng: -121.4944, state: 'CA', population: 524943 },
  { name: 'Atlanta, GA', lat: 33.7490, lng: -84.3880, state: 'GA', population: 498715 },
  { name: 'Kansas City, MO', lat: 39.0997, lng: -94.5786, state: 'MO', population: 495327 },
  { name: 'Colorado Springs, CO', lat: 38.8339, lng: -104.8214, state: 'CO', population: 478961 },
  { name: 'Omaha, NE', lat: 41.2565, lng: -95.9345, state: 'NE', population: 478192 },
  { name: 'Raleigh, NC', lat: 35.7796, lng: -78.6382, state: 'NC', population: 474069 },
  { name: 'Miami, FL', lat: 25.7617, lng: -80.1918, state: 'FL', population: 467963 },
  { name: 'Long Beach, CA', lat: 33.7701, lng: -118.1937, state: 'CA', population: 466742 },
  { name: 'Virginia Beach, VA', lat: 36.8529, lng: -75.9780, state: 'VA', population: 459470 },
  { name: 'Oakland, CA', lat: 37.8044, lng: -122.2712, state: 'CA', population: 433031 },
  { name: 'Minneapolis, MN', lat: 44.9778, lng: -93.2650, state: 'MN', population: 429954 },
  { name: 'Tulsa, OK', lat: 36.1540, lng: -95.9928, state: 'OK', population: 413066 },
  { name: 'Tampa, FL', lat: 27.9506, lng: -82.4572, state: 'FL', population: 407599 },
  { name: 'Arlington, TX', lat: 32.7357, lng: -97.1081, state: 'TX', population: 398854 },
  { name: 'New Orleans, LA', lat: 29.9511, lng: -90.0715, state: 'LA', population: 383997 },
];

// Generate random offset for coordinates (to spread providers around cities)
function randomOffset(max = 0.1) {
  return (Math.random() - 0.5) * max;
}

// Generate a provider
function generateProvider(id, city) {
  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen', 'Daniel', 'Nancy', 'Matthew', 'Lisa', 'Anthony', 'Betty', 'Mark', 'Margaret', 'Donald', 'Sandra'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const specialty = PROVIDER_SPECIALTIES[Math.floor(Math.random() * PROVIDER_SPECIALTIES.length)];

  // Generate address near city center with some spread
  const lat = city.lat + randomOffset(0.15);
  const lng = city.lng + randomOffset(0.15);
  const streetNumber = Math.floor(Math.random() * 9999) + 1;
  const streetNames = ['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Park Blvd', 'Washington St', 'Lake Dr', 'Hill Rd', 'River Rd', 'Forest Ave'];
  const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];

  return {
    id: `PRV-${String(id).padStart(6, '0')}`,
    name: `Dr. ${firstName} ${lastName}`,
    specialty,
    address: `${streetNumber} ${streetName}`,
    city: city.name.split(',')[0],
    state: city.state,
    zip: String(Math.floor(Math.random() * 90000) + 10000),
    lat,
    lng,
    accepting: Math.random() > 0.1, // 90% accepting patients
    network: Math.random() > 0.2 ? 'In-Network' : 'Out-of-Network', // 80% in-network
  };
}

// Generate all providers distributed by population
export function generateProviders(totalCount = 25000) {
  const providers = [];
  const totalPopulation = MAJOR_CITIES.reduce((sum, city) => sum + city.population, 0);

  MAJOR_CITIES.forEach(city => {
    // Distribute providers proportionally to population
    const cityProviderCount = Math.floor((city.population / totalPopulation) * totalCount);

    for (let i = 0; i < cityProviderCount; i++) {
      providers.push(generateProvider(providers.length + 1, city));
    }
  });

  return providers;
}

// Get providers for a specific state
export function getProvidersByState(providers, stateCode) {
  return providers.filter(p => p.state === stateCode);
}

// Get providers within a bounding box
export function getProvidersInBounds(providers, bounds) {
  return providers.filter(p =>
    p.lat >= bounds.south &&
    p.lat <= bounds.north &&
    p.lng >= bounds.west &&
    p.lng <= bounds.east
  );
}

// Get providers by specialty
export function getProvidersBySpecialty(providers, specialty) {
  return providers.filter(p => p.specialty === specialty);
}
