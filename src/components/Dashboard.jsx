import { useState, useEffect } from 'react';
import MapView from './MapView';
import ProviderDirectory from './ProviderDirectory';
import ImpactTracker from './ImpactTracker';
import Reports from './Reports';

export default function Dashboard() {
  const [selectedNetwork, setSelectedNetwork] = useState('all');
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [animated, setAnimated] = useState(false);
  const [hoveredState, setHoveredState] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [removedProviders, setRemovedProviders] = useState(new Set());
  const [isSimulationMode, setIsSimulationMode] = useState(false);

  // State name to code mapping for impact tracker clicks
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
    'AL': 'AL', 'AK': 'AK', 'AZ': 'AZ', 'AR': 'AR', 'CA': 'CA', 'CO': 'CO',
    'CT': 'CT', 'DE': 'DE', 'FL': 'FL', 'GA': 'GA', 'HI': 'HI', 'ID': 'ID',
    'IL': 'IL', 'IN': 'IN', 'IA': 'IA', 'KS': 'KS', 'KY': 'KY', 'LA': 'LA',
    'ME': 'ME', 'MD': 'MD', 'MA': 'MA', 'MI': 'MI', 'MN': 'MN', 'MS': 'MS',
    'MO': 'MO', 'MT': 'MT', 'NE': 'NE', 'NV': 'NV', 'NH': 'NH', 'NJ': 'NJ',
    'NM': 'NM', 'NY': 'NY', 'NC': 'NC', 'ND': 'ND', 'OH': 'OH', 'OK': 'OK',
    'OR': 'OR', 'PA': 'PA', 'RI': 'RI', 'SC': 'SC', 'SD': 'SD', 'TN': 'TN',
    'TX': 'TX', 'UT': 'UT', 'VT': 'VT', 'VA': 'VA', 'WA': 'WA', 'WV': 'WV',
    'WI': 'WI', 'WY': 'WY'
  };

  // Handle showing provider on map from Directory
  const handleShowOnMap = (provider) => {
    // Switch to Map view
    setActiveNav('Map');

    // Set the state from provider's state (this will be handled by MapView)
    // We'll need to pass the provider data to MapView
    // For now, just switch to map - we'll enhance MapView to handle this
    console.log('Show provider on map:', provider);
  };

  // Handle clicking on a location in the impact tracker
  const handleImpactLocationClick = (impact) => {
    // Switch to Map view if not already there
    if (activeNav !== 'Map') {
      setActiveNav('Map');
    }

    // Extract state code from location string
    // Location format: "Los Angeles County, CA" or "CA state-wide" or "CA"
    const location = impact.location;
    let stateCode = null;

    // Try to extract state from various formats
    if (location.includes('state-wide')) {
      stateCode = location.split(' ')[0]; // "CA state-wide" -> "CA"
    } else if (location.includes(',')) {
      const parts = location.split(',');
      const statePart = parts[parts.length - 1].trim(); // Get last part after comma
      stateCode = stateNameToCode[statePart] || statePart;
    } else {
      stateCode = stateNameToCode[location] || location;
    }

    // Set the selected state if we found a valid code
    if (stateCode && stateCode.length === 2) {
      setSelectedState(stateCode);
    }
  };

  useEffect(() => {
    // Reset animation when Dashboard is viewed
    if (activeNav === 'Dashboard') {
      setAnimated(false);
      setTimeout(() => setAnimated(true), 100);
    }
  }, [activeNav]);

  const overallScore = 87;
  const accuracyScore = 82;
  const adequacyScore = 91;

  // Network Adequacy Metrics
  const adequacyMetrics = {
    driveTime: { avg: 12.4, target: 15, unit: 'min', status: 'ok', trend: -2.1 },
    providerRatio: { avg: 1, per: 1500, target: 2000, unit: 'beneficiaries', status: 'ok', trend: +0.3 },
    gaps: [
      { specialty: 'Psychiatry', metric: 'driveTime', value: 34, target: 30, county: 'Rural TX', severity: 'high' },
      { specialty: 'Primary Care', metric: 'providerRatio', value: 1, per: 2800, target: 2000, county: 'Harris, TX', severity: 'high' },
      { specialty: 'Dermatology', metric: 'driveTime', value: 28, target: 20, county: 'Kern, CA', severity: 'medium' },
      { specialty: 'Cardiology', metric: 'providerRatio', value: 1, per: 2200, target: 2000, county: 'Cook, IL', severity: 'medium' },
    ]
  };

  const criticalIssues = [
    { id: 1, type: 'accuracy', severity: 'high', title: 'Invalid addresses detected', count: 47, specialty: 'Primary Care', county: 'Los Angeles, CA' },
    { id: 2, type: 'adequacy', severity: 'high', title: 'Drive time exceeds 30 min', count: 3, specialty: 'Psychiatry', county: 'Rural Counties, TX' },
    { id: 3, type: 'accuracy', severity: 'medium', title: 'Missing NPI numbers', count: 23, specialty: 'Cardiology', county: 'Multiple' },
    { id: 4, type: 'adequacy', severity: 'medium', title: 'Provider ratio below threshold', count: 2, specialty: 'Dermatology', county: 'Harris County, TX' },
  ];

  const specialtyData = [
    { name: 'Primary Care', adequacy: 95, accuracy: 78, providers: 1247, driveTime: 8, ratio: 1200, status: 'review' },
    { name: 'Cardiology', adequacy: 92, accuracy: 85, providers: 342, driveTime: 14, ratio: 1800, status: 'ok' },
    { name: 'Psychiatry', adequacy: 76, accuracy: 88, providers: 189, driveTime: 28, ratio: 2400, status: 'critical' },
    { name: 'Dermatology', adequacy: 84, accuracy: 91, providers: 156, driveTime: 18, ratio: 1900, status: 'review' },
    { name: 'Orthopedics', adequacy: 89, accuracy: 82, providers: 203, driveTime: 15, ratio: 1650, status: 'review' },
  ];

  const ModernDonut = ({ score, size = 140, color, gradientId, label, sublabel, delay = 0 }) => {
    const [displayScore, setDisplayScore] = useState(0);
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = animated ? circumference - (score / 100) * circumference : circumference;
    const gradients = { teal: ['#14b8a6', '#06b6d4', '#22d3ee'], purple: ['#a855f7', '#c084fc', '#e879f9'], cyan: ['#06b6d4', '#22d3ee', '#67e8f9'] };
    const colors = gradients[color] || gradients.teal;

    useEffect(() => {
      if (animated) {
        let start = 0;
        const duration = 1500;
        const startTime = Date.now() + delay;

        const animate = () => {
          const now = Date.now();
          const elapsed = now - startTime;

          if (elapsed < 0) {
            requestAnimationFrame(animate);
            return;
          }

          const progress = Math.min(elapsed / duration, 1);
          const eased = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

          setDisplayScore(Math.floor(eased * score));

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
      } else {
        setDisplayScore(0);
      }
    }, [animated, score, delay]);

    return (
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg className="transform -rotate-90" width={size} height={size}>
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors[0]} /><stop offset="50%" stopColor={colors[1]} /><stop offset="100%" stopColor={colors[2]} />
              </linearGradient>
              <filter id={`glow-${gradientId}`}><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} />
            <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={`url(#${gradientId})`} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" filter={`url(#glow-${gradientId})`} style={{ transition: `stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms` }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{displayScore}</span>
          </div>
        </div>
        <span className="mt-3 text-sm font-medium text-slate-300">{label}</span>
        {sublabel && <span className="text-xs text-slate-500">{sublabel}</span>}
      </div>
    );
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

  const getSeverityStyles = (severity) => ({ high: { dot: 'bg-rose-500', glow: 'shadow-rose-500/50' }, medium: { dot: 'bg-amber-500', glow: 'shadow-amber-500/50' }, low: { dot: 'bg-sky-500', glow: 'shadow-sky-500/50' } }[severity]);

  const navItems = [
    { name: 'Dashboard', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z' },
    { name: 'Directory', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { name: 'Map', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
    { name: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ];


  const DashboardView = () => (
    <>
      {/* Top Row - Scores + Adequacy Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-span-2 bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 transform transition-all duration-500 hover:scale-[1.01] hover:border-teal-500/30" style={{ animation: animated ? 'slideInLeft 0.6s ease-out' : 'none' }}>
          <div className="flex items-center justify-between gap-6">
            <div className="flex-shrink-0">
              <ModernDonut score={overallScore} size={150} color="teal" gradientId="grad1" label="Overall" sublabel="+2.3%" delay={0} />
            </div>
            <div className="w-px h-36 bg-gradient-to-b from-transparent via-slate-700 to-transparent flex-shrink-0"></div>
            <div className="flex-shrink-0">
              <ModernDonut score={accuracyScore} size={130} color="purple" gradientId="grad2" label="Accuracy" sublabel="226 issues" delay={200} />
            </div>
            <div className="w-px h-36 bg-gradient-to-b from-transparent via-slate-700 to-transparent flex-shrink-0"></div>
            <div className="flex-shrink-0">
              <ModernDonut score={adequacyScore} size={130} color="cyan" gradientId="grad3" label="Adequacy" sublabel="5 gaps" delay={400} />
            </div>
            <div className="w-px h-36 bg-gradient-to-b from-transparent via-slate-700 to-transparent flex-shrink-0"></div>
            <div className="grid grid-cols-2 gap-3 flex-shrink-0">
              {[
                { v: 12800, suffix: 'K', l: 'Providers' },
                { v: 247, suffix: '', l: 'Counties' },
                { v: 1400, suffix: 'K', l: 'Facilities' },
                { v: 89, suffix: '', l: 'Review', c: 'text-amber-400' }
              ].map((s, i) => {
                const [displayValue, setDisplayValue] = useState(0);

                useEffect(() => {
                  if (animated) {
                    let start = 0;
                    const duration = 1200;
                    const startTime = Date.now() + (600 + i * 100);

                    const animate = () => {
                      const now = Date.now();
                      const elapsed = now - startTime;

                      if (elapsed < 0) {
                        requestAnimationFrame(animate);
                        return;
                      }

                      const progress = Math.min(elapsed / duration, 1);
                      const eased = progress < 0.5
                        ? 2 * progress * progress
                        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                      setDisplayValue(Math.floor(eased * s.v));

                      if (progress < 1) {
                        requestAnimationFrame(animate);
                      }
                    };

                    requestAnimationFrame(animate);
                  } else {
                    setDisplayValue(0);
                  }
                }, [animated]);

                const formattedValue = s.suffix === 'K'
                  ? `${(displayValue / 1000).toFixed(1)}K`
                  : displayValue.toString();

                return (
                  <div key={i} className="text-center p-4 bg-slate-800/30 rounded-lg transform transition-all hover:scale-105 hover:bg-slate-800/50 min-w-[90px]" style={{ animation: animated ? `fadeInUp 0.6s ease-out ${i * 0.1}s both` : 'none' }}>
                    <p className={`text-2xl font-bold ${s.c || 'text-white'}`}>{formattedValue}</p>
                    <p className="text-xs text-slate-500 mt-1">{s.l}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Adequacy Metrics Cards */}
        <div className="space-y-3" style={{ animation: animated ? 'slideInRight 0.6s ease-out' : 'none' }}>
          <div className="transform transition-all hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/10" style={{ animation: animated ? 'fadeInUp 0.6s ease-out 0.2s both' : 'none' }}>
            <MetricCard
              icon={<svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              title="Avg. Drive Time" value={adequacyMetrics.driveTime.avg} unit="min" target="≤15 min"
              status={adequacyMetrics.driveTime.status} trend={adequacyMetrics.driveTime.trend} subtitle="To nearest provider" />
          </div>
          <div className="transform transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10" style={{ animation: animated ? 'fadeInUp 0.6s ease-out 0.3s both' : 'none' }}>
            <MetricCard
              icon={<svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              title="Provider Ratio" value={`1:${adequacyMetrics.providerRatio.per}`} unit="" target="≤1:2000"
              status={adequacyMetrics.providerRatio.status} trend={adequacyMetrics.providerRatio.trend} subtitle="Per beneficiaries" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Issues */}
        <div className="col-span-3 bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-4 transform transition-all hover:border-rose-500/30" style={{ animation: animated ? 'fadeInUp 0.6s ease-out 0.4s both' : 'none' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Priority Issues</h2>
            <div className="flex gap-2 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>High</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>Med</span>
            </div>
          </div>
          <div className="space-y-2">
            {criticalIssues.map((issue, idx) => {
              const s = getSeverityStyles(issue.severity);
              return (
                <div key={issue.id} className="group flex items-center gap-3 p-2.5 bg-slate-800/30 hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer hover:scale-[1.02] hover:shadow-lg" style={{ animation: animated ? `slideInLeft 0.5s ease-out ${0.5 + idx * 0.1}s both` : 'none' }}>
                  <div className={`w-1 h-8 rounded-full ${s.dot} transition-all group-hover:h-10 group-hover:shadow-lg ${s.glow}`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-white group-hover:text-teal-400 transition-colors">{issue.title}</p>
                      <span className={`px-1.5 py-0.5 text-xs rounded transition-all group-hover:scale-110 ${issue.type === 'accuracy' ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'}`}>{issue.type}</span>
                    </div>
                    <p className="text-xs text-slate-500">{issue.specialty} · {issue.county}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-white group-hover:scale-110 transition-transform">{issue.count}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Specialty with adequacy metrics */}
        <div className="col-span-2 bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-4 transform transition-all hover:border-cyan-500/30" style={{ animation: animated ? 'fadeInUp 0.6s ease-out 0.5s both' : 'none' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">By Specialty</h2>
            <div className="flex gap-2 text-xs text-slate-400">
              <span>Drive</span><span>|</span><span>Ratio</span>
            </div>
          </div>
          <div className="space-y-2">
            {specialtyData.map((spec, idx) => (
              <div key={idx} className="group cursor-pointer p-2 rounded-lg hover:bg-slate-800/30 transition-all hover:scale-[1.02] hover:shadow-md" style={{ animation: animated ? `slideInRight 0.5s ease-out ${0.6 + idx * 0.1}s both` : 'none' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-white group-hover:text-teal-400 transition-colors">{spec.name}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs transition-all group-hover:scale-110 ${spec.driveTime > 20 ? 'text-rose-400' : spec.driveTime > 15 ? 'text-amber-400' : 'text-emerald-400'}`}>{spec.driveTime}m</span>
                    <span className={`text-xs transition-all group-hover:scale-110 ${spec.ratio > 2000 ? 'text-rose-400' : spec.ratio > 1500 ? 'text-amber-400' : 'text-emerald-400'}`}>1:{spec.ratio}</span>
                    <span className={`w-2 h-2 rounded-full transition-all group-hover:scale-150 ${spec.status === 'critical' ? 'bg-rose-500 animate-pulse' : spec.status === 'review' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                  </div>
                </div>
                <div className="flex gap-1 h-1.5 group-hover:h-2 transition-all">
                  <div className="flex-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all group-hover:shadow-lg group-hover:shadow-purple-500/50"
                      style={{
                        width: animated ? `${spec.accuracy}%` : '0%',
                        transition: `width 1.2s cubic-bezier(0.4, 0, 0.2, 1) ${0.7 + idx * 0.1}s`
                      }}
                    ></div>
                  </div>
                  <div className="flex-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all group-hover:shadow-lg group-hover:shadow-cyan-500/50"
                      style={{
                        width: animated ? `${spec.adequacy}%` : '0%',
                        transition: `width 1.2s cubic-bezier(0.4, 0, 0.2, 1) ${0.7 + idx * 0.1}s`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-auto">
      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-48 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/50 p-3 flex flex-col z-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/30">
            <span className="text-xs font-bold text-slate-900">H1</span>
          </div>
          <div><span className="text-white text-sm font-semibold">Network</span><span className="text-teal-400 text-sm font-bold">IQ</span></div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button key={item.name} onClick={() => { setActiveNav(item.name); if (item.name !== 'Map') { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); setSelectedState(null); } }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeNav === item.name ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/10 text-white border border-teal-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
              <svg className={`w-4 h-4 ${activeNav === item.name ? 'text-teal-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
              </svg>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="pt-3 border-t border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-semibold">AR</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">Arthur Raess</p>
              <p className="text-xs text-slate-500 truncate">arthur@h1.co</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="ml-48 p-4 relative h-screen flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-white">
              {activeNav === 'Map' ? 'Map' : activeNav === 'Directory' ? 'Provider Directory' : activeNav === 'Reports' ? 'Reports & Exports' : 'Network Health'}
            </h1>
            <p className="text-slate-500 text-xs">Last sync: Today at 9:42 AM</p>
          </div>
          {activeNav !== 'Directory' && (
            <select value={selectedNetwork} onChange={(e) => setSelectedNetwork(e.target.value)} className="px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs text-white">
              <option value="all">All Networks</option>
              <option value="ma">Medicare Advantage</option>
              <option value="medicaid">Medicaid</option>
            </select>
          )}
        </div>

        {/* Impact Tracker - Shows when simulation is active in Dashboard, Map or Directory views */}
        {(activeNav === 'Dashboard' || activeNav === 'Map' || activeNav === 'Directory') && (
          <ImpactTracker
            removedProviders={removedProviders}
            isVisible={isSimulationMode}
            onLocationClick={handleImpactLocationClick}
          />
        )}

        {activeNav === 'Map' ? (
          <MapView
            hoveredState={hoveredState}
            setHoveredState={setHoveredState}
            selectedState={selectedState}
            setSelectedState={setSelectedState}
            isSimulationMode={isSimulationMode}
            removedProviders={removedProviders}
            setRemovedProviders={setRemovedProviders}
          />
        ) : activeNav === 'Directory' ? (
          <ProviderDirectory
            removedProviders={removedProviders}
            setRemovedProviders={setRemovedProviders}
            onSimulationChange={setIsSimulationMode}
            onShowOnMap={handleShowOnMap}
          />
        ) : activeNav === 'Reports' ? (
          <Reports
            removedProviders={removedProviders}
            isSimulationMode={isSimulationMode}
          />
        ) : (
          <DashboardView />
        )}
      </div>
    </div>
  );
}
