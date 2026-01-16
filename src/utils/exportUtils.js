// Export utilities for generating reports

import { generateProvider, getTotalProviderCount, getProviderCountByState } from './providerGenerator';
import { calculateAllImpacts, getImpactSummary } from './impactCalculator';

// Convert data to CSV format
function convertToCSV(data, headers) {
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle values that contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

// Download file helper
function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export provider directory
export function exportProviderDirectory(removedProviders = new Set(), format = 'csv') {
  const providers = [];
  const totalProviders = getTotalProviderCount();

  // Generate all providers (this might take a moment for 1.6M+ providers)
  // For performance, we'll export in chunks
  const chunkSize = 10000;

  for (let i = 0; i < Math.min(totalProviders, 50000); i++) { // Limit to 50k for performance
    const provider = generateProvider(i);
    const isRemoved = removedProviders.has(i);

    providers.push({
      NPI: provider.npi,
      Name: provider.name,
      Specialty: provider.specialty,
      State: provider.state,
      'Confidence Rating': provider.confidence,
      'Accepting Patients': provider.acceptingPatients ? 'Yes' : 'No',
      'Years in Practice': provider.yearsInPractice,
      Status: isRemoved ? 'Removed (Simulation)' : 'Active',
    });
  }

  const headers = ['NPI', 'Name', 'Specialty', 'State', 'Confidence Rating', 'Accepting Patients', 'Years in Practice', 'Status'];
  const csv = convertToCSV(providers, headers);

  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `provider-directory-${timestamp}.csv`, 'text/csv');

  return providers.length;
}

// Export adequacy results by state
export function exportAdequacyResults(removedProviders = new Set(), format = 'csv') {
  const stateData = {
    AL: { name: 'Alabama', providers: 420, score: 79, driveTime: 17, ratio: 1750, status: 'review' },
    AK: { name: 'Alaska', providers: 85, score: 68, driveTime: 35, ratio: 2800, status: 'critical' },
    AZ: { name: 'Arizona', providers: 680, score: 84, driveTime: 14, ratio: 1450, status: 'ok' },
    AR: { name: 'Arkansas', providers: 310, score: 76, driveTime: 19, ratio: 1900, status: 'review' },
    CA: { name: 'California', providers: 2840, score: 92, driveTime: 11, ratio: 1100, status: 'ok' },
    CO: { name: 'Colorado', providers: 540, score: 88, driveTime: 13, ratio: 1300, status: 'ok' },
    CT: { name: 'Connecticut', providers: 380, score: 90, driveTime: 10, ratio: 1150, status: 'ok' },
    DE: { name: 'Delaware', providers: 95, score: 86, driveTime: 12, ratio: 1280, status: 'ok' },
    FL: { name: 'Florida', providers: 1680, score: 88, driveTime: 13, ratio: 1300, status: 'ok' },
    GA: { name: 'Georgia', providers: 850, score: 81, driveTime: 15, ratio: 1600, status: 'review' },
    HI: { name: 'Hawaii', providers: 145, score: 82, driveTime: 18, ratio: 1650, status: 'review' },
    ID: { name: 'Idaho', providers: 180, score: 77, driveTime: 22, ratio: 2100, status: 'critical' },
    IL: { name: 'Illinois', providers: 760, score: 82, driveTime: 14, ratio: 1500, status: 'review' },
    IN: { name: 'Indiana', providers: 580, score: 83, driveTime: 14, ratio: 1480, status: 'ok' },
    IA: { name: 'Iowa', providers: 340, score: 85, driveTime: 16, ratio: 1550, status: 'review' },
    KS: { name: 'Kansas', providers: 295, score: 80, driveTime: 18, ratio: 1850, status: 'review' },
    KY: { name: 'Kentucky', providers: 425, score: 78, driveTime: 17, ratio: 1800, status: 'review' },
    LA: { name: 'Louisiana', providers: 460, score: 75, driveTime: 19, ratio: 1950, status: 'critical' },
    ME: { name: 'Maine', providers: 150, score: 81, driveTime: 20, ratio: 1700, status: 'review' },
    MD: { name: 'Maryland', providers: 620, score: 89, driveTime: 11, ratio: 1200, status: 'ok' },
    MA: { name: 'Massachusetts', providers: 740, score: 93, driveTime: 9, ratio: 1050, status: 'ok' },
    MI: { name: 'Michigan', providers: 790, score: 80, driveTime: 16, ratio: 1700, status: 'review' },
    MN: { name: 'Minnesota', providers: 560, score: 87, driveTime: 14, ratio: 1400, status: 'ok' },
    MS: { name: 'Mississippi', providers: 285, score: 73, driveTime: 21, ratio: 2200, status: 'critical' },
    MO: { name: 'Missouri', providers: 590, score: 82, driveTime: 15, ratio: 1520, status: 'review' },
    MT: { name: 'Montana', providers: 120, score: 74, driveTime: 28, ratio: 2500, status: 'critical' },
    NE: { name: 'Nebraska', providers: 210, score: 83, driveTime: 17, ratio: 1620, status: 'review' },
    NV: { name: 'Nevada', providers: 290, score: 79, driveTime: 18, ratio: 1880, status: 'review' },
    NH: { name: 'New Hampshire', providers: 165, score: 87, driveTime: 13, ratio: 1350, status: 'ok' },
    NJ: { name: 'New Jersey', providers: 920, score: 91, driveTime: 10, ratio: 1100, status: 'ok' },
    NM: { name: 'New Mexico', providers: 210, score: 76, driveTime: 24, ratio: 2300, status: 'critical' },
    NY: { name: 'New York', providers: 1420, score: 85, driveTime: 10, ratio: 1100, status: 'review' },
    NC: { name: 'North Carolina', providers: 920, score: 83, driveTime: 14, ratio: 1400, status: 'ok' },
    ND: { name: 'North Dakota', providers: 85, score: 78, driveTime: 25, ratio: 2350, status: 'critical' },
    OH: { name: 'Ohio', providers: 980, score: 84, driveTime: 13, ratio: 1350, status: 'ok' },
    OK: { name: 'Oklahoma', providers: 380, score: 77, driveTime: 19, ratio: 1920, status: 'review' },
    OR: { name: 'Oregon', providers: 420, score: 85, driveTime: 15, ratio: 1480, status: 'ok' },
    PA: { name: 'Pennsylvania', providers: 1120, score: 86, driveTime: 12, ratio: 1250, status: 'ok' },
    RI: { name: 'Rhode Island', providers: 125, score: 88, driveTime: 11, ratio: 1220, status: 'ok' },
    SC: { name: 'South Carolina', providers: 485, score: 80, driveTime: 16, ratio: 1680, status: 'review' },
    SD: { name: 'South Dakota', providers: 95, score: 76, driveTime: 26, ratio: 2400, status: 'critical' },
    TN: { name: 'Tennessee', providers: 640, score: 81, driveTime: 16, ratio: 1650, status: 'review' },
    TX: { name: 'Texas', providers: 2156, score: 74, driveTime: 19, ratio: 1800, status: 'critical' },
    UT: { name: 'Utah', providers: 310, score: 84, driveTime: 16, ratio: 1560, status: 'ok' },
    VT: { name: 'Vermont', providers: 78, score: 83, driveTime: 18, ratio: 1720, status: 'review' },
    VA: { name: 'Virginia', providers: 820, score: 86, driveTime: 13, ratio: 1320, status: 'ok' },
    WA: { name: 'Washington', providers: 750, score: 87, driveTime: 13, ratio: 1380, status: 'ok' },
    WV: { name: 'West Virginia', providers: 195, score: 75, driveTime: 21, ratio: 2150, status: 'critical' },
    WI: { name: 'Wisconsin', providers: 570, score: 85, driveTime: 14, ratio: 1450, status: 'ok' },
    WY: { name: 'Wyoming', providers: 68, score: 72, driveTime: 32, ratio: 2700, status: 'critical' },
  };

  const providerCounts = getProviderCountByState(removedProviders);

  const adequacyData = [];
  for (const [code, data] of Object.entries(stateData)) {
    const currentProviders = providerCounts[code] || 0;
    const providerChange = currentProviders - data.providers;

    adequacyData.push({
      'State': data.name,
      'State Code': code,
      'Baseline Providers': data.providers,
      'Current Providers': currentProviders,
      'Provider Change': providerChange,
      'Network Score': data.score,
      'Avg Drive Time (min)': data.driveTime,
      'Provider Ratio (1:X)': data.ratio,
      'Status': data.status.toUpperCase(),
      'Meets Federal Standards': data.ratio <= 2000 && data.driveTime <= 15 ? 'Yes' : 'No',
    });
  }

  const headers = ['State', 'State Code', 'Baseline Providers', 'Current Providers', 'Provider Change', 'Network Score', 'Avg Drive Time (min)', 'Provider Ratio (1:X)', 'Status', 'Meets Federal Standards'];
  const csv = convertToCSV(adequacyData, headers);

  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `adequacy-results-${timestamp}.csv`, 'text/csv');

  return adequacyData.length;
}

// Export KPIs and summary metrics
export function exportKPIs(removedProviders = new Set(), format = 'csv') {
  const totalProviders = getTotalProviderCount();
  const activeProviders = totalProviders - removedProviders.size;

  // Calculate impacts if simulation mode
  const impacts = removedProviders.size > 0 ? calculateAllImpacts(removedProviders) : [];
  const impactSummary = getImpactSummary(impacts);

  const kpiData = [
    { Category: 'Provider Network', Metric: 'Total Providers', Value: totalProviders.toLocaleString(), Unit: 'providers' },
    { Category: 'Provider Network', Metric: 'Active Providers', Value: activeProviders.toLocaleString(), Unit: 'providers' },
    { Category: 'Provider Network', Metric: 'Removed Providers (Simulation)', Value: removedProviders.size.toLocaleString(), Unit: 'providers' },
    { Category: 'Provider Network', Metric: 'Utilization Rate', Value: ((activeProviders / totalProviders) * 100).toFixed(1), Unit: '%' },
    { Category: 'Network Adequacy', Metric: 'Overall Network Score', Value: '87', Unit: 'score' },
    { Category: 'Network Adequacy', Metric: 'Adequacy Score', Value: '91', Unit: 'score' },
    { Category: 'Network Adequacy', Metric: 'Accuracy Score', Value: '82', Unit: 'score' },
    { Category: 'Network Adequacy', Metric: 'Average Drive Time', Value: '12.4', Unit: 'minutes' },
    { Category: 'Network Adequacy', Metric: 'Target Drive Time', Value: '15', Unit: 'minutes' },
    { Category: 'Network Adequacy', Metric: 'Average Provider Ratio', Value: '1:1500', Unit: 'ratio' },
    { Category: 'Network Adequacy', Metric: 'Target Provider Ratio', Value: '1:2000', Unit: 'ratio' },
    { Category: 'Compliance', Metric: 'States Meeting Standards', Value: '21', Unit: 'states' },
    { Category: 'Compliance', Metric: 'States Requiring Review', Value: '18', Unit: 'states' },
    { Category: 'Compliance', Metric: 'States Critical', Value: '11', Unit: 'states' },
    { Category: 'Simulation Impact', Metric: 'Total Impacts', Value: impactSummary.total.toString(), Unit: 'impacts' },
    { Category: 'Simulation Impact', Metric: 'Critical Impacts', Value: impactSummary.critical.toString(), Unit: 'impacts' },
    { Category: 'Simulation Impact', Metric: 'Warning Impacts', Value: impactSummary.warning.toString(), Unit: 'impacts' },
    { Category: 'Simulation Impact', Metric: 'States Affected', Value: impactSummary.affectedStates.toString(), Unit: 'states' },
  ];

  const headers = ['Category', 'Metric', 'Value', 'Unit'];
  const csv = convertToCSV(kpiData, headers);

  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `kpi-summary-${timestamp}.csv`, 'text/csv');

  return kpiData.length;
}

// Export simulation impact details
export function exportImpactReport(removedProviders = new Set(), format = 'csv') {
  if (removedProviders.size === 0) {
    return 0;
  }

  const impacts = calculateAllImpacts(removedProviders);

  const impactData = impacts.map((impact, index) => ({
    'Impact #': index + 1,
    'Severity': impact.severity.toUpperCase(),
    'Location': impact.location,
    'Metric Affected': impact.metric,
    'Change': impact.change,
    'Description': impact.description,
    'Impact Type': impact.type,
    'Provider Removed': impact.details?.provider || 'N/A',
    'Specialty': impact.details?.specialty || 'N/A',
  }));

  const headers = ['Impact #', 'Severity', 'Location', 'Metric Affected', 'Change', 'Description', 'Impact Type', 'Provider Removed', 'Specialty'];
  const csv = convertToCSV(impactData, headers);

  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `impact-report-${timestamp}.csv`, 'text/csv');

  return impactData.length;
}

// Export all reports as a bundle
export async function exportAllReports(removedProviders = new Set()) {
  const results = {
    providers: exportProviderDirectory(removedProviders),
    adequacy: exportAdequacyResults(removedProviders),
    kpis: exportKPIs(removedProviders),
    impacts: removedProviders.size > 0 ? exportImpactReport(removedProviders) : 0,
  };

  return results;
}
