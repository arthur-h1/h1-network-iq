import React, { useState, useRef } from 'react';

const stateData = {
  CA: { name: 'California', providers: 2840, score: 92, driveTime: 11, ratio: 1100, status: 'ok', counties: [
    { name: 'Los Angeles', driveTime: 8, ratio: 900, providers: 1240, status: 'ok' },
    { name: 'San Francisco', driveTime: 6, ratio: 800, providers: 680, status: 'ok' },
    { name: 'San Diego', driveTime: 10, ratio: 1100, providers: 420, status: 'ok' },
    { name: 'Kern', driveTime: 28, ratio: 2400, providers: 85, status: 'critical' },
    { name: 'Fresno', driveTime: 22, ratio: 1900, providers: 120, status: 'review' },
  ]},
  TX: { name: 'Texas', providers: 2156, score: 74, driveTime: 19, ratio: 1800, status: 'critical', counties: [
    { name: 'Harris', driveTime: 12, ratio: 2800, providers: 890, status: 'critical' },
    { name: 'Dallas', driveTime: 10, ratio: 1400, providers: 720, status: 'ok' },
    { name: 'Travis', driveTime: 9, ratio: 1200, providers: 340, status: 'ok' },
    { name: 'Rural West', driveTime: 45, ratio: 3500, providers: 42, status: 'critical' },
    { name: 'Rural East', driveTime: 38, ratio: 2900, providers: 58, status: 'critical' },
  ]},
  FL: { name: 'Florida', providers: 1680, score: 88, driveTime: 13, ratio: 1300, status: 'ok', counties: [
    { name: 'Miami-Dade', driveTime: 9, ratio: 1000, providers: 540, status: 'ok' },
    { name: 'Broward', driveTime: 11, ratio: 1200, providers: 380, status: 'ok' },
    { name: 'Orange', driveTime: 12, ratio: 1400, providers: 290, status: 'ok' },
    { name: 'Hillsborough', driveTime: 14, ratio: 1500, providers: 210, status: 'ok' },
  ]},
  NY: { name: 'New York', providers: 1420, score: 85, driveTime: 10, ratio: 1100, status: 'review', counties: [
    { name: 'New York City', driveTime: 5, ratio: 600, providers: 980, status: 'ok' },
    { name: 'Nassau', driveTime: 12, ratio: 1300, providers: 180, status: 'ok' },
    { name: 'Suffolk', driveTime: 18, ratio: 1800, providers: 140, status: 'review' },
    { name: 'Upstate Rural', driveTime: 32, ratio: 2600, providers: 65, status: 'critical' },
  ]},
  IL: { name: 'Illinois', providers: 760, score: 82, driveTime: 14, ratio: 1500, status: 'review', counties: [
    { name: 'Cook', driveTime: 8, ratio: 2200, providers: 620, status: 'review' },
    { name: 'DuPage', driveTime: 12, ratio: 1400, providers: 85, status: 'ok' },
    { name: 'Rural South', driveTime: 35, ratio: 2800, providers: 32, status: 'critical' },
  ]},
};

const adequacyMetrics = {
  driveTime: { avg: 12.4, target: 15, unit: 'min', status: 'ok', trend: -2.1 },
  providerRatio: { avg: 1, per: 1500, target: 2000, unit: 'beneficiaries', status: 'ok', trend: +0.3 },
};

const getStatusColor = (status) => {
  if (status === 'critical') return '#f43f5e';
  if (status === 'review') return '#f59e0b';
  return '#10b981';
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

export default function MapView({
  hoveredState,
  setHoveredState,
  hoveredCounty,
  setHoveredCounty,
  zoomLevel,
  setZoomLevel,
  panOffset,
  setPanOffset,
  selectedState,
  setSelectedState,
  isDragging,
  setIsDragging,
  dragStart,
  setDragStart
}) {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapFilter, setMapFilter] = useState('all');
  const mapRef = useRef(null);

  const countyPaths = {
    CA: [
      { name: 'Los Angeles', d: 'M8,48 L14,46 L16,50 L12,54 L6,52 Z', data: stateData.CA.counties[0] },
      { name: 'San Francisco', d: 'M6,38 L10,36 L12,40 L8,42 Z', data: stateData.CA.counties[1] },
      { name: 'San Diego', d: 'M10,54 L16,52 L18,56 L12,58 Z', data: stateData.CA.counties[2] },
      { name: 'Kern', d: 'M12,42 L18,40 L20,46 L14,48 Z', data: stateData.CA.counties[3] },
      { name: 'Fresno', d: 'M10,36 L16,34 L18,40 L12,42 Z', data: stateData.CA.counties[4] },
    ],
    TX: [
      { name: 'Harris', d: 'M54,56 L60,54 L62,60 L56,62 Z', data: stateData.TX.counties[0] },
      { name: 'Dallas', d: 'M50,48 L56,46 L58,52 L52,54 Z', data: stateData.TX.counties[1] },
      { name: 'Travis', d: 'M46,54 L52,52 L54,58 L48,60 Z', data: stateData.TX.counties[2] },
      { name: 'Rural West', d: 'M38,50 L46,48 L48,56 L40,58 Z', data: stateData.TX.counties[3] },
      { name: 'Rural East', d: 'M58,50 L66,48 L68,56 L60,58 Z', data: stateData.TX.counties[4] },
    ],
    NY: [
      { name: 'NYC', d: 'M82,24 L88,22 L90,28 L84,30 Z', data: stateData.NY.counties[0] },
      { name: 'Nassau', d: 'M86,28 L90,26 L92,30 L88,32 Z', data: stateData.NY.counties[1] },
      { name: 'Suffolk', d: 'M88,26 L94,24 L96,28 L90,30 Z', data: stateData.NY.counties[2] },
      { name: 'Upstate', d: 'M76,18 L84,16 L86,24 L78,26 Z', data: stateData.NY.counties[3] },
    ],
    FL: [
      { name: 'Miami-Dade', d: 'M80,62 L86,60 L88,66 L82,68 Z', data: stateData.FL.counties[0] },
      { name: 'Broward', d: 'M78,58 L84,56 L86,62 L80,64 Z', data: stateData.FL.counties[1] },
      { name: 'Orange', d: 'M76,52 L82,50 L84,56 L78,58 Z', data: stateData.FL.counties[2] },
      { name: 'Hillsborough', d: 'M72,54 L78,52 L80,58 L74,60 Z', data: stateData.FL.counties[3] },
    ],
    IL: [
      { name: 'Cook', d: 'M66,32 L72,30 L74,36 L68,38 Z', data: stateData.IL.counties[0] },
      { name: 'DuPage', d: 'M64,34 L68,32 L70,36 L66,38 Z', data: stateData.IL.counties[1] },
      { name: 'Rural South', d: 'M64,40 L72,38 L74,46 L66,48 Z', data: stateData.IL.counties[2] },
    ],
  };

  const getCountyFill = (county, isHovered) => {
    if (mapFilter === 'driveTime') {
      if (county.driveTime > 30) return isHovered ? 'rgba(244,63,94,0.6)' : 'rgba(244,63,94,0.4)';
      if (county.driveTime > 20) return isHovered ? 'rgba(245,158,11,0.6)' : 'rgba(245,158,11,0.4)';
      return isHovered ? 'rgba(16,185,129,0.5)' : 'rgba(16,185,129,0.3)';
    }
    if (mapFilter === 'ratio') {
      if (county.ratio > 2500) return isHovered ? 'rgba(244,63,94,0.6)' : 'rgba(244,63,94,0.4)';
      if (county.ratio > 2000) return isHovered ? 'rgba(245,158,11,0.6)' : 'rgba(245,158,11,0.4)';
      return isHovered ? 'rgba(16,185,129,0.5)' : 'rgba(16,185,129,0.3)';
    }
    return isHovered ? 'rgba(20,184,166,0.4)' : 'rgba(20,184,166,0.2)';
  };

  const handleZoom = (delta) => {
    setZoomLevel(prev => Math.min(Math.max(prev + delta, 1), 4));
    if (delta < 0 && zoomLevel <= 1.5) { setSelectedState(null); setPanOffset({ x: 0, y: 0 }); }
  };

  const handleMouseDown = (e) => { if (zoomLevel > 1) { setIsDragging(true); setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y }); } };
  const handleMouseMove = (e) => { if (isDragging) setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="relative h-full">
      <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-4 h-full">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Network Adequacy Map</h2>
            <p className="text-xs text-slate-500">{selectedState ? `Viewing ${stateData[selectedState]?.name} counties` : 'Click state to view counties • Scroll to zoom'}</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={mapFilter} onChange={(e) => setMapFilter(e.target.value)} className="px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs text-white">
              <option value="all">All Metrics</option>
              <option value="driveTime">Drive Time</option>
              <option value="ratio">Provider Ratio</option>
            </select>
            <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
              <button onClick={() => handleZoom(-0.5)} className="p-1.5 text-slate-400 hover:text-white rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg></button>
              <span className="text-xs text-slate-400 w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
              <button onClick={() => handleZoom(0.5)} className="p-1.5 text-slate-400 hover:text-white rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-3 text-xs">
          <span className="text-slate-400">Legend:</span>
          {mapFilter === 'driveTime' ? (
            <><span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500/50"></span>≤20 min</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500/50"></span>21-30 min</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500/50"></span>&gt;30 min</span></>
          ) : mapFilter === 'ratio' ? (
            <><span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500/50"></span>≤2000:1</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500/50"></span>2001-2500:1</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500/50"></span>&gt;2500:1</span></>
          ) : (
            <><span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500/50"></span>Healthy</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500/50"></span>Review</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500/50"></span>Critical</span></>
          )}
        </div>

        <div className="relative bg-slate-950/50 rounded-xl overflow-hidden h-72" ref={mapRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}>
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(20,184,166,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.5) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

          <svg viewBox="0 0 100 75" className="w-full h-full" style={{ transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`, transition: isDragging ? 'none' : 'transform 0.3s ease' }}>
            <defs>
              <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#1e293b" /><stop offset="100%" stopColor="#0f172a" /></linearGradient>
              <filter id="glow"><feGaussianBlur stdDeviation="1.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>

            {/* US Base */}
            <path d="M5,25 L15,20 L20,22 L22,18 L30,15 L40,16 L50,18 L60,16 L70,18 L80,20 L88,25 L90,30 L88,40 L85,50 L80,55 L75,58 L70,55 L65,58 L60,65 L50,68 L40,65 L30,60 L25,55 L20,50 L15,48 L10,45 L8,40 L5,35 Z" fill="url(#mapGrad)" stroke="#334155" strokeWidth="0.3" />

            {/* State boundaries */}
            <g stroke="#475569" strokeWidth="0.2" fill="none">
              <path d="M5,25 L18,30 L15,48 L10,45 L8,40 L5,35 Z" /> {/* CA */}
              <path d="M35,45 L65,42 L68,68 L42,70 L35,55 Z" /> {/* TX */}
              <path d="M70,48 L88,45 L90,70 L72,68 Z" /> {/* FL */}
              <path d="M75,15 L92,18 L90,35 L78,32 Z" /> {/* NY */}
              <path d="M62,28 L76,26 L78,45 L64,47 Z" /> {/* IL */}
            </g>

            {/* County boundaries when zoomed */}
            {zoomLevel >= 1.5 && Object.entries(countyPaths).map(([state, counties]) => (
              <g key={state}>
                {counties.map((county, i) => (
                  <path key={i} d={county.d} fill={getCountyFill(county.data, hoveredCounty === `${state}-${county.name}`)}
                    stroke={hoveredCounty === `${state}-${county.name}` ? '#14b8a6' : '#475569'} strokeWidth={hoveredCounty === `${state}-${county.name}` ? '0.4' : '0.15'}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredCounty(`${state}-${county.name}`)} onMouseLeave={() => setHoveredCounty(null)}
                    onClick={() => setSelectedMarker({ ...county.data, state, countyName: county.name })} />
                ))}
              </g>
            ))}

            {/* State regions clickable */}
            {zoomLevel < 1.5 && Object.entries(stateData).map(([code, data]) => {
              const paths = { CA: 'M5,25 L18,30 L15,48 L10,45 L8,40 L5,35 Z', TX: 'M35,45 L65,42 L68,68 L42,70 L35,55 Z', FL: 'M70,48 L88,45 L90,70 L72,68 Z', NY: 'M75,15 L92,18 L90,35 L78,32 Z', IL: 'M62,28 L76,26 L78,45 L64,47 Z' };
              return (
                <path key={code} d={paths[code]} fill={hoveredState === code ? `${getStatusColor(data.status)}40` : `${getStatusColor(data.status)}20`}
                  stroke={getStatusColor(data.status)} strokeWidth="0.3" className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredState(code)} onMouseLeave={() => setHoveredState(null)}
                  onClick={() => { setSelectedState(code); setZoomLevel(2); }} />
              );
            })}

            {/* City markers */}
            {[{ x: 10, y: 45, state: 'CA', city: 'LA' }, { x: 55, y: 55, state: 'TX', city: 'Houston' }, { x: 82, y: 58, state: 'FL', city: 'Miami' }, { x: 85, y: 24, state: 'NY', city: 'NYC' }, { x: 68, y: 34, state: 'IL', city: 'Chicago' }].map((m, i) => (
              <g key={i}>
                <circle cx={m.x} cy={m.y} r="1.5" fill={getStatusColor(stateData[m.state].status)} filter="url(#glow)">
                  <animate attributeName="r" values="1.5;2.5;1.5" dur="2s" repeatCount="indefinite" />
                </circle>
              </g>
            ))}
          </svg>

          {/* Hover tooltip */}
          {(hoveredState || hoveredCounty) && (
            <div className="absolute top-3 left-3 bg-slate-800/95 backdrop-blur border border-slate-700/50 rounded-lg p-3 text-xs shadow-xl">
              {hoveredCounty ? (() => {
                const [state, name] = hoveredCounty.split('-');
                const county = stateData[state]?.counties.find(c => c.name === name);
                return county && (
                  <><p className="font-semibold text-white">{name}, {state}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between gap-4"><span className="text-slate-400">Drive Time:</span><span className={county.driveTime > 30 ? 'text-rose-400' : county.driveTime > 20 ? 'text-amber-400' : 'text-emerald-400'}>{county.driveTime} min</span></div>
                    <div className="flex justify-between gap-4"><span className="text-slate-400">Ratio:</span><span className={county.ratio > 2500 ? 'text-rose-400' : county.ratio > 2000 ? 'text-amber-400' : 'text-emerald-400'}>1:{county.ratio}</span></div>
                    <div className="flex justify-between gap-4"><span className="text-slate-400">Providers:</span><span className="text-white">{county.providers}</span></div>
                  </div></>
                );
              })() : hoveredState && stateData[hoveredState] && (
                <><p className="font-semibold text-white">{stateData[hoveredState].name}</p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between gap-4"><span className="text-slate-400">Avg Drive:</span><span className="text-white">{stateData[hoveredState].driveTime} min</span></div>
                  <div className="flex justify-between gap-4"><span className="text-slate-400">Avg Ratio:</span><span className="text-white">1:{stateData[hoveredState].ratio}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-slate-400">Providers:</span><span className="text-white">{stateData[hoveredState].providers.toLocaleString()}</span></div>
                </div>
                <p className="text-teal-400 mt-2">Click to view counties →</p></>
              )}
            </div>
          )}

          {/* Selected county detail */}
          {selectedMarker && (
            <div className="absolute top-3 right-3 bg-slate-800/95 backdrop-blur border border-slate-700/50 rounded-xl p-4 w-52 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">{selectedMarker.countyName}</h3>
                <button onClick={() => setSelectedMarker(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <p className="text-xs text-slate-400 mb-3">{selectedMarker.state}</p>
              <div className="space-y-3">
                <div className="p-2 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400">Drive Time</p>
                  <p className={`text-lg font-bold ${selectedMarker.driveTime > 30 ? 'text-rose-400' : selectedMarker.driveTime > 20 ? 'text-amber-400' : 'text-emerald-400'}`}>{selectedMarker.driveTime} min</p>
                  <p className="text-xs text-slate-500">Target: ≤30 min</p>
                </div>
                <div className="p-2 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400">Provider Ratio</p>
                  <p className={`text-lg font-bold ${selectedMarker.ratio > 2500 ? 'text-rose-400' : selectedMarker.ratio > 2000 ? 'text-amber-400' : 'text-emerald-400'}`}>1:{selectedMarker.ratio}</p>
                  <p className="text-xs text-slate-500">Target: ≤1:2000</p>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-700/50">
                  <span className="text-slate-400">Providers</span>
                  <span className="text-white font-medium">{selectedMarker.providers}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Adequacy Metrics Row */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <MetricCard
            icon={<svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            title="Avg. Drive Time to Provider" value={adequacyMetrics.driveTime.avg} unit="min" target="≤15 min"
            status={adequacyMetrics.driveTime.status} trend={adequacyMetrics.driveTime.trend} subtitle="Across all specialties" />
          <MetricCard
            icon={<svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            title="Provider to Beneficiary Ratio" value={`1:${adequacyMetrics.providerRatio.per}`} unit="" target="≤1:2000"
            status={adequacyMetrics.providerRatio.status} trend={adequacyMetrics.providerRatio.trend} subtitle="Network-wide average" />
        </div>
      </div>
    </div>
  );
}
