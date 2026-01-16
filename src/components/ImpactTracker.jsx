import { useState, useEffect, useMemo } from 'react';
import { calculateAllImpacts, getImpactSummary } from '../utils/impactCalculator';

export default function ImpactTracker({ removedProviders, isVisible, onLocationClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculate all impacts when providers are removed
  const impacts = useMemo(() => {
    if (removedProviders.size === 0) return [];
    return calculateAllImpacts(removedProviders);
  }, [removedProviders]);

  const summary = useMemo(() => {
    return getImpactSummary(impacts);
  }, [impacts]);

  // Reset to first impact when new changes occur
  useEffect(() => {
    if (impacts.length > 0) {
      setCurrentIndex(0);
    }
  }, [impacts.length]);

  const handleNext = () => {
    if (currentIndex < impacts.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  if (!isVisible || impacts.length === 0) {
    return null;
  }

  const currentImpact = impacts[currentIndex];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'border-rose-500/50 bg-rose-500/10';
      case 'warning':
        return 'border-amber-500/50 bg-amber-500/10';
      default:
        return 'border-teal-500/50 bg-teal-500/10';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return (
          <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-xs rounded-full font-medium">Critical</span>;
      case 'warning':
        return <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full font-medium">Warning</span>;
      default:
        return <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded-full font-medium">Info</span>;
    }
  };

  return (
    <div className={`mb-4 transition-all duration-300 ${isAnimating ? 'opacity-50 scale-98' : 'opacity-100 scale-100'}`}>
      <div className={`border-2 rounded-2xl p-4 backdrop-blur-xl ${getSeverityColor(currentImpact.severity)}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {getSeverityIcon(currentImpact.severity)}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-semibold text-sm">Impact Analysis</h3>
                {getSeverityBadge(currentImpact.severity)}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Change {currentIndex + 1} of {impacts.length} • {summary.critical} critical, {summary.warning} warnings
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === impacts.length - 1}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Impact Content */}
        <div className="grid grid-cols-12 gap-4">
          {/* Location */}
          <div className="col-span-3">
            <p className="text-xs text-slate-400 mb-1">Location</p>
            <button
              onClick={() => onLocationClick && onLocationClick(currentImpact)}
              className="text-white text-sm font-medium flex items-center gap-1.5 hover:text-teal-400 transition-colors cursor-pointer group"
            >
              <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="underline decoration-dotted decoration-slate-600 group-hover:decoration-teal-400">
                {currentImpact.location}
              </span>
              <svg className="w-3 h-3 text-slate-500 group-hover:text-teal-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </div>

          {/* Metric */}
          <div className="col-span-2">
            <p className="text-xs text-slate-400 mb-1">Metric</p>
            <p className="text-white text-sm font-medium">{currentImpact.metric}</p>
          </div>

          {/* Change */}
          <div className="col-span-2">
            <p className="text-xs text-slate-400 mb-1">Change</p>
            <p className={`text-sm font-bold ${
              currentImpact.severity === 'critical' ? 'text-rose-400' :
              currentImpact.severity === 'warning' ? 'text-amber-400' :
              'text-teal-400'
            }`}>
              {currentImpact.change}
            </p>
          </div>

          {/* Description */}
          <div className="col-span-5">
            <p className="text-xs text-slate-400 mb-1">Details</p>
            <p className="text-white text-sm">{currentImpact.description}</p>
          </div>
        </div>

        {/* Provider Info */}
        {currentImpact.details && (
          <div className="mt-3 pt-3 border-t border-slate-700/30">
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-400">
                Affected by removal of:
              </span>
              <span className="text-white font-medium">
                {currentImpact.details.provider}
              </span>
              <span className="px-2 py-0.5 bg-slate-700/30 text-slate-300 rounded text-xs">
                {currentImpact.details.specialty}
              </span>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="mt-3">
          <div className="flex gap-1">
            {impacts.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-white' :
                  idx < currentIndex ? 'bg-slate-600' :
                  'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
