import { useState, useRef } from 'react';
import ReactMapGL, { Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapbox access token
const MAPBOX_TOKEN = 'pk.eyJ1IjoiYXJ0aHVyaDEiLCJhIjoiY21raDJmb2cyMGVzYjNmcW1kOWRmbGJqbyJ9.K5fViocsPVuK_22SwWc4Lg';

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

// Map state names to abbreviations for GeoJSON data
const stateNameToCode = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
  'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
  'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
  'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
  'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
  'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
  'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
  'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
  'Wisconsin': 'WI', 'Wyoming': 'WY',
};

const MetricCard = ({ icon, title, value, unit, target, status, trend, subtitle }) => (
  <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
    <div className="flex items-start justify-between mb-2">
      <div className="p-2 rounded-lg bg-slate-700/30">{icon}</div>
      <span className={`text-xs px-2 py-0.5 rounded-full ${status === 'ok' ? 'bg-emerald-500/20 text-emerald-400' : status === 'review' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>
        {status === 'ok' ? '✓ Meeting' : status === 'review' ? '! Review' : '✗ Gap'}
      </span>
    </div>
    <p className="text-xs text-slate-400 mb-1">{title}</p>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-bold text-white">{value}</span>
      <span className="text-sm text-slate-400">{unit}</span>
    </div>
    <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/30">
      <span className="text-xs text-slate-500">Target: {target}</span>
      {trend && <span className={`text-xs ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}</span>}
    </div>
  </div>
);

const adequacyMetrics = {
  driveTime: { avg: 12.4, target: 15, unit: 'min', status: 'ok', trend: -2.1 },
  providerRatio: { avg: 1, per: 1500, target: 2000, unit: 'beneficiaries', status: 'ok', trend: +0.3 },
};

export default function MapView({
  hoveredState,
  setHoveredState,
  selectedState,
  setSelectedState,
  isSimulationMode = false,
  removedProviders = new Set(),
}) {
  const [mapFilter, setMapFilter] = useState('all');
  const [viewMode, setViewMode] = useState('state'); // 'state' or 'county'
  const [viewState, setViewState] = useState({
    longitude: -98.5795,
    latitude: 39.8283,
    zoom: 3.5,
  });
  const mapRef = useRef(null);

  // Generate random but consistent county rating based on county name
  const getCountyRating = (countyName, stateName) => {
    // Use county+state name to generate consistent hash
    const hash = (countyName + stateName).split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const normalized = Math.abs(hash % 100);

    // Generate metrics based on hash
    const driveTime = 8 + (normalized % 25); // 8-32 minutes
    const ratio = 1000 + (normalized % 2000); // 1000-3000

    let status = 'ok';
    if (driveTime > 20 || ratio > 2000) status = 'critical';
    else if (driveTime > 15 || ratio > 1600) status = 'review';

    return { driveTime, ratio, status };
  };

  // Get color for county based on generated rating
  const getColorForCounty = (countyName, stateName) => {
    const rating = getCountyRating(countyName, stateName);

    if (mapFilter === 'driveTime') {
      if (rating.driveTime > 20) return 'rgba(244,63,94,0.7)';
      if (rating.driveTime > 15) return 'rgba(245,158,11,0.7)';
      return 'rgba(16,185,129,0.6)';
    }

    if (mapFilter === 'ratio') {
      if (rating.ratio > 2000) return 'rgba(244,63,94,0.7)';
      if (rating.ratio > 1600) return 'rgba(245,158,11,0.7)';
      return 'rgba(16,185,129,0.6)';
    }

    // Status colors
    if (rating.status === 'critical') return 'rgba(244,63,94,0.7)';
    if (rating.status === 'review') return 'rgba(245,158,11,0.7)';
    return 'rgba(16,185,129,0.6)';
  };

  // Get color for a specific state based on data and filter
  const getColorForState = (stateCode) => {
    const data = stateData[stateCode];
    if (!data) return 'rgba(71,85,105,0.2)';

    if (mapFilter === 'driveTime') {
      if (data.driveTime > 15) return 'rgba(244,63,94,0.6)';
      if (data.driveTime > 12) return 'rgba(245,158,11,0.6)';
      return 'rgba(16,185,129,0.5)';
    }

    if (mapFilter === 'ratio') {
      if (data.ratio > 1600) return 'rgba(244,63,94,0.6)';
      if (data.ratio > 1300) return 'rgba(245,158,11,0.6)';
      return 'rgba(16,185,129,0.5)';
    }

    // Convert hex to rgba for status colors
    if (data.status === 'critical') return 'rgba(244,63,94,0.6)';
    if (data.status === 'review') return 'rgba(245,158,11,0.6)';
    return 'rgba(16,185,129,0.5)';
  };

  // Build Mapbox expression for fill colors
  const buildFillColorExpression = () => {
    const cases = [];
    Object.keys(stateData).forEach(stateCode => {
      // Match by state name from GeoJSON
      const stateName = stateData[stateCode].name;
      cases.push(['==', ['get', 'name'], stateName]);
      cases.push(getColorForState(stateCode));
    });
    return ['case', ...cases, 'rgba(71,85,105,0.2)'];
  };

  // Mapbox layer configuration for state fills using custom GeoJSON
  const dataLayer = {
    id: 'state-fills',
    type: 'fill',
    paint: {
      'fill-color': buildFillColorExpression(),
      'fill-opacity': 0.8,
    },
  };

  const outlineLayer = {
    id: 'state-borders',
    type: 'line',
    paint: {
      'line-color': '#334155',
      'line-width': 1,
    },
  };

  const hoverLayer = {
    id: 'state-hover',
    type: 'line',
    filter: ['==', ['get', 'name'], hoveredState && !selectedState ? stateData[hoveredState]?.name : ''],
    paint: {
      'line-color': '#ffffff',
      'line-width': 2,
      'line-opacity': 0.8,
    },
  };

  const highlightLayer = {
    id: 'state-highlighted',
    type: 'line',
    filter: ['==', ['get', 'name'], selectedState ? stateData[selectedState]?.name : ''],
    paint: {
      'line-color': '#14b8a6',
      'line-width': 3,
    },
  };

  // Build fill color expression for counties using GeoJSON
  const buildCountyFillColorExpression = () => {
    // We'll generate colors based on county properties when we have the data
    // For now, use a hash-based approach with the county ID/name
    return [
      'case',
      ['has', 'NAME'],
      [
        'interpolate',
        ['linear'],
        ['%', ['length', ['get', 'NAME']], 10],
        0, 'rgba(16,185,129,0.6)',
        3, 'rgba(245,158,11,0.6)',
        7, 'rgba(244,63,94,0.6)',
        10, 'rgba(16,185,129,0.6)'
      ],
      'rgba(71,85,105,0.2)' // default
    ];
  };

  // County layers - only shown in county view
  const countyLayer = {
    id: 'county-fills',
    type: 'fill',
    paint: {
      'fill-color': buildCountyFillColorExpression(),
      'fill-opacity': 0.7,
    },
  };

  const countyBorderLayer = {
    id: 'county-borders',
    type: 'line',
    paint: {
      'line-color': '#334155',
      'line-width': 0.5,
    },
  };

  const onMapClick = (event) => {
    const features = event.features;
    if (features && features.length > 0) {
      const props = features[0].properties;
      const stateName = props.name;

      // Convert state name to code using our mapping
      const stateCode = stateNameToCode[stateName];

      if (stateCode && stateData[stateCode]) {
        setSelectedState(selectedState === stateCode ? null : stateCode);
      }
    }
  };

  const onMapHover = (event) => {
    const features = event.features;
    if (features && features.length > 0) {
      const props = features[0].properties;
      const stateName = props.name;

      // Convert state name to code using our mapping
      const stateCode = stateNameToCode[stateName];

      if (stateCode && stateData[stateCode]) {
        setHoveredState(stateCode);
      } else {
        setHoveredState(null);
      }
    } else {
      setHoveredState(null);
    }
  };

  return (
    <div className="relative h-full">
      <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-4 h-full">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">Network Adequacy Map</h2>
              {isSimulationMode && (
                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full border border-amber-500/30 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  What-If Simulation
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {selectedState && stateData[selectedState] ? `${stateData[selectedState].name} selected` : viewMode === 'county' ? 'County-level view • Click county for details' : 'Click state to view details • Scroll to zoom'}
              {isSimulationMode && ` • ${removedProviders.size.toLocaleString()} providers removed`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('state')}
                className={`px-3 py-1.5 text-xs transition-colors ${viewMode === 'state' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                States
              </button>
              <button
                onClick={() => setViewMode('county')}
                className={`px-3 py-1.5 text-xs transition-colors ${viewMode === 'county' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Counties
              </button>
            </div>
            <select value={mapFilter} onChange={(e) => setMapFilter(e.target.value)} className="px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs text-white">
              <option value="all">All Metrics</option>
              <option value="driveTime">Drive Time</option>
              <option value="ratio">Provider Ratio</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-3 text-xs text-slate-400">
          <span>Legend:</span>
          {mapFilter === 'driveTime' ? (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500/50"></span>≤12 min
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500/50"></span>13-15 min
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500/50"></span>&gt;15 min
              </span>
            </>
          ) : mapFilter === 'ratio' ? (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500/50"></span>≤1300:1
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500/50"></span>1301-1600:1
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500/50"></span>&gt;1600:1
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500/50"></span>Healthy
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500/50"></span>Review
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500/50"></span>Critical
              </span>
            </>
          )}
        </div>

        <div className="relative rounded-xl overflow-hidden h-96 border border-slate-800/50">
          <ReactMapGL
            key={viewMode}
            ref={mapRef}
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
            interactiveLayerIds={viewMode === 'state' ? ['state-fills'] : ['county-fills']}
            onClick={onMapClick}
            onMouseMove={onMapHover}
            style={{ width: '100%', height: '100%' }}
          >
            {viewMode === 'state' ? (
              <Source
                id="us-states"
                type="geojson"
                data="https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json"
              >
                <Layer {...dataLayer} />
                <Layer {...outlineLayer} />
                <Layer {...hoverLayer} />
                <Layer {...highlightLayer} />
              </Source>
            ) : (
              <Source
                id="counties"
                type="geojson"
                data="https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json"
              >
                <Layer {...countyLayer} />
                <Layer {...countyBorderLayer} />
              </Source>
            )}
          </ReactMapGL>

          {/* Hover tooltip */}
          {hoveredState && stateData[hoveredState] && !selectedState && (
            <div className="absolute top-4 left-4 bg-slate-800/95 backdrop-blur-lg border border-slate-700/50 rounded-xl p-3 shadow-2xl pointer-events-none z-10">
              <p className="font-semibold text-white mb-2">{stateData[hoveredState].name}</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between gap-6">
                  <span className="text-slate-400">Drive Time:</span>
                  <span className={stateData[hoveredState].driveTime > 15 ? 'text-rose-400 font-medium' : stateData[hoveredState].driveTime > 12 ? 'text-amber-400 font-medium' : 'text-emerald-400 font-medium'}>
                    {stateData[hoveredState].driveTime} min
                  </span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-slate-400">Ratio:</span>
                  <span className={stateData[hoveredState].ratio > 1600 ? 'text-rose-400 font-medium' : stateData[hoveredState].ratio > 1300 ? 'text-amber-400 font-medium' : 'text-emerald-400 font-medium'}>
                    1:{stateData[hoveredState].ratio}
                  </span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-slate-400">Providers:</span>
                  <span className="text-white font-medium">{stateData[hoveredState].providers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-slate-400">Score:</span>
                  <span className="text-cyan-400 font-medium">{stateData[hoveredState].score}/100</span>
                </div>
              </div>
              <p className="text-teal-400 text-xs mt-2 pt-2 border-t border-slate-700/50">Click for details →</p>
            </div>
          )}

          {/* Selected state detail panel */}
          {selectedState && stateData[selectedState] && (
            <div className="absolute top-4 right-4 bg-slate-800/95 backdrop-blur-lg border border-teal-500/30 rounded-xl p-4 w-64 shadow-2xl z-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white text-base">{stateData[selectedState].name}</h3>
                <button
                  onClick={() => setSelectedState(null)}
                  className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700/50 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                  <p className="text-xs text-slate-400 mb-1">Network Score</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-cyan-400">{stateData[selectedState].score}</p>
                    <p className="text-sm text-slate-400">/100</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                  <p className="text-xs text-slate-400 mb-1">Avg. Drive Time</p>
                  <p className={`text-xl font-bold ${stateData[selectedState].driveTime > 15 ? 'text-rose-400' : stateData[selectedState].driveTime > 12 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {stateData[selectedState].driveTime} min
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Target: ≤15 min</p>
                </div>

                <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                  <p className="text-xs text-slate-400 mb-1">Provider Ratio</p>
                  <p className={`text-xl font-bold ${stateData[selectedState].ratio > 1600 ? 'text-rose-400' : stateData[selectedState].ratio > 1300 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    1:{stateData[selectedState].ratio}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Target: ≤1:2000</p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-700/50">
                  <span className="text-xs text-slate-400">Total Providers</span>
                  <span className="text-sm text-white font-semibold">{stateData[selectedState].providers.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Status</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    stateData[selectedState].status === 'ok' ? 'bg-emerald-500/20 text-emerald-400' :
                    stateData[selectedState].status === 'review' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-rose-500/20 text-rose-400'
                  }`}>
                    {stateData[selectedState].status === 'ok' ? '✓ Healthy' :
                     stateData[selectedState].status === 'review' ? '! Review' :
                     '✗ Critical'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Adequacy Metrics Row */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <MetricCard
            icon={<svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            title="Avg. Drive Time to Provider"
            value={adequacyMetrics.driveTime.avg}
            unit="min"
            target="≤15 min"
            status={adequacyMetrics.driveTime.status}
            trend={adequacyMetrics.driveTime.trend}
            subtitle="Across all networks"
          />
          <MetricCard
            icon={<svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            title="Provider to Beneficiary Ratio"
            value={`1:${adequacyMetrics.providerRatio.per}`}
            unit=""
            target="≤1:2000"
            status={adequacyMetrics.providerRatio.status}
            trend={adequacyMetrics.providerRatio.trend}
            subtitle="Network-wide average"
          />
        </div>
      </div>
    </div>
  );
}
