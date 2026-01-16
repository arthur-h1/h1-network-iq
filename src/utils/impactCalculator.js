// Calculate the impact of provider removals on network adequacy

import { generateProvider, getProviderCountByState } from './providerGenerator';

// State population data (2020 Census approximations for beneficiary calculations)
const statePopulations = {
  'CA': 39538223, 'TX': 29145505, 'FL': 21538187, 'NY': 20201249,
  'PA': 13002700, 'IL': 12812508, 'OH': 11799448, 'GA': 10711908,
  'NC': 10439388, 'MI': 10077331, 'NJ': 9288994, 'VA': 8631393,
  'WA': 7705281, 'AZ': 7151502, 'MA': 7029917, 'TN': 6910840,
  'IN': 6785528, 'MO': 6154913, 'MD': 6177224, 'WI': 5893718,
  'CO': 5773714, 'MN': 5706494, 'SC': 5118425, 'AL': 5024279,
  'LA': 4657757, 'KY': 4505836, 'OR': 4237256, 'OK': 3959353,
  'CT': 3605944, 'UT': 3271616, 'IA': 3190369, 'NV': 3104614,
  'AR': 3011524, 'MS': 2961279, 'KS': 2937880, 'NM': 2117522,
  'NE': 1961504, 'ID': 1839106, 'WV': 1793716, 'HI': 1455271,
  'NH': 1377529, 'ME': 1362359, 'RI': 1097379, 'MT': 1084225,
  'DE': 989948, 'SD': 886667, 'ND': 779094, 'AK': 733391,
  'VT': 643077, 'WY': 576851
};

// County data for more granular analysis
const majorCounties = {
  'CA': ['Los Angeles', 'San Diego', 'Orange', 'Riverside', 'San Bernardino', 'Santa Clara', 'Alameda', 'Sacramento', 'Fresno'],
  'TX': ['Harris', 'Dallas', 'Tarrant', 'Bexar', 'Travis', 'Collin', 'El Paso', 'Denton'],
  'FL': ['Miami-Dade', 'Broward', 'Palm Beach', 'Hillsborough', 'Orange', 'Pinellas', 'Duval'],
  'NY': ['Kings', 'Queens', 'New York', 'Suffolk', 'Bronx', 'Nassau', 'Westchester'],
  'PA': ['Philadelphia', 'Allegheny', 'Montgomery', 'Bucks', 'Delaware', 'Lancaster'],
  'IL': ['Cook', 'DuPage', 'Lake', 'Will', 'Kane'],
  'OH': ['Cuyahoga', 'Franklin', 'Hamilton', 'Summit', 'Montgomery'],
  'GA': ['Fulton', 'Gwinnett', 'Cobb', 'DeKalb', 'Clayton'],
  'NC': ['Mecklenburg', 'Wake', 'Guilford', 'Forsyth', 'Durham'],
  'MI': ['Wayne', 'Oakland', 'Macomb', 'Kent', 'Genesee']
};

// Calculate impacts for a single provider removal
export function calculateProviderImpact(providerId, currentRemovedIds = new Set()) {
  const provider = generateProvider(providerId);
  const impacts = [];

  // Get state info
  const state = provider.state;
  const statePop = statePopulations[state] || 1000000;
  const beneficiaries = Math.floor(statePop * 0.18); // ~18% are Medicare/Medicaid eligible

  // Get current provider counts
  const beforeCount = getProviderCountByState(currentRemovedIds);
  const afterRemovedIds = new Set([...currentRemovedIds, providerId]);
  const afterCount = getProviderCountByState(afterRemovedIds);

  const providersBefore = beforeCount[state] || 0;
  const providersAfter = afterCount[state] || 0;

  // Calculate ratio changes
  const ratioBefore = Math.floor(beneficiaries / providersBefore);
  const ratioAfter = Math.floor(beneficiaries / providersAfter);
  const ratioChange = ratioAfter - ratioBefore;

  // State-level impact
  if (ratioChange > 0) {
    impacts.push({
      type: 'ratio',
      severity: ratioChange > 100 ? 'critical' : ratioChange > 50 ? 'warning' : 'info',
      location: `${state} state-wide`,
      metric: 'Provider Ratio',
      change: `+${ratioChange}`,
      description: `Beneficiary-to-provider ratio increased from 1:${ratioBefore.toLocaleString()} to 1:${ratioAfter.toLocaleString()}`,
      details: {
        before: ratioBefore,
        after: ratioAfter,
        provider: provider.name,
        specialty: provider.specialty
      }
    });
  }

  // Simulate drive time impact for major counties
  const counties = majorCounties[state] || [];
  if (counties.length > 0 && Math.random() > 0.6) { // 40% chance of county impact
    const affectedCounty = counties[Math.floor(Math.random() * counties.length)];
    const driveTimeIncrease = Math.floor(Math.random() * 8) + 1; // 1-8 minutes

    impacts.push({
      type: 'driveTime',
      severity: driveTimeIncrease > 5 ? 'critical' : driveTimeIncrease > 3 ? 'warning' : 'info',
      location: `${affectedCounty} County, ${state}`,
      metric: 'Drive Time',
      change: `+${driveTimeIncrease}min`,
      description: `Average drive time to ${provider.specialty} increased by ${driveTimeIncrease} minutes`,
      details: {
        county: affectedCounty,
        provider: provider.name,
        specialty: provider.specialty,
        increase: driveTimeIncrease
      }
    });
  }

  // Check for specialty gaps
  const specialtyProvidersInState = Math.floor(providersBefore * 0.04); // Assume 4% per specialty
  if (specialtyProvidersInState < 20) {
    impacts.push({
      type: 'specialtyGap',
      severity: 'critical',
      location: `${state}`,
      metric: 'Specialty Coverage',
      change: 'Gap Created',
      description: `${provider.specialty} coverage may fall below adequacy threshold`,
      details: {
        specialty: provider.specialty,
        provider: provider.name,
        remainingProviders: specialtyProvidersInState - 1
      }
    });
  }

  // Threshold violations
  if (ratioAfter > 2000) {
    impacts.push({
      type: 'threshold',
      severity: 'critical',
      location: `${state}`,
      metric: 'Adequacy Threshold',
      change: 'Violated',
      description: `${state} now exceeds federal adequacy threshold of 1:2000`,
      details: {
        threshold: 2000,
        actual: ratioAfter,
        provider: provider.name
      }
    });
  }

  return impacts;
}

// Calculate all impacts from a set of removed providers
export function calculateAllImpacts(removedProviderIds) {
  const allImpacts = [];
  const sortedIds = Array.from(removedProviderIds).sort((a, b) => a - b);

  // Calculate cumulative impacts
  const processedIds = new Set();
  for (const providerId of sortedIds) {
    const impacts = calculateProviderImpact(providerId, processedIds);
    allImpacts.push(...impacts.map(impact => ({
      ...impact,
      providerId,
      changeNumber: allImpacts.length + 1
    })));
    processedIds.add(providerId);
  }

  return allImpacts;
}

// Get summary statistics
export function getImpactSummary(impacts) {
  const summary = {
    total: impacts.length,
    critical: impacts.filter(i => i.severity === 'critical').length,
    warning: impacts.filter(i => i.severity === 'warning').length,
    info: impacts.filter(i => i.severity === 'info').length,
    affectedStates: new Set(impacts.map(i => i.location.split(',').pop().trim())).size,
    byType: {
      ratio: impacts.filter(i => i.type === 'ratio').length,
      driveTime: impacts.filter(i => i.type === 'driveTime').length,
      specialtyGap: impacts.filter(i => i.type === 'specialtyGap').length,
      threshold: impacts.filter(i => i.type === 'threshold').length
    }
  };

  return summary;
}
