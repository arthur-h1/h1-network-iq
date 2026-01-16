import { useState } from 'react';
import { exportProviderDirectory, exportAdequacyResults, exportKPIs, exportImpactReport, exportAllReports } from '../utils/exportUtils';

export default function Reports({ removedProviders, isSimulationMode }) {
  const [exportStatus, setExportStatus] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (exportType) => {
    setIsExporting(true);
    setExportStatus(null);

    try {
      let count = 0;
      let message = '';

      switch (exportType) {
        case 'directory':
          count = exportProviderDirectory(removedProviders);
          message = `Successfully exported ${count.toLocaleString()} providers`;
          break;
        case 'adequacy':
          count = exportAdequacyResults(removedProviders);
          message = `Successfully exported adequacy results for ${count} states`;
          break;
        case 'kpis':
          count = exportKPIs(removedProviders);
          message = `Successfully exported ${count} KPI metrics`;
          break;
        case 'impacts':
          count = exportImpactReport(removedProviders);
          message = count > 0 ? `Successfully exported ${count} impact records` : 'No impacts to export (no providers removed)';
          break;
        case 'all':
          const results = await exportAllReports(removedProviders);
          message = `Successfully exported all reports: ${results.providers.toLocaleString()} providers, ${results.adequacy} states, ${results.kpis} KPIs`;
          if (results.impacts > 0) {
            message += `, ${results.impacts} impacts`;
          }
          break;
        default:
          break;
      }

      setExportStatus({ type: 'success', message });
    } catch (error) {
      setExportStatus({ type: 'error', message: `Export failed: ${error.message}` });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 pb-20">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reports & Exports</h1>
          <p className="text-slate-400">
            Export network adequacy data, provider directories, and simulation results
          </p>
        </div>

        {/* Simulation Mode Indicator */}
        {isSimulationMode && (
          <div className="mb-6 p-4 bg-teal-500/10 border-2 border-teal-500/30 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
              <div>
                <p className="text-teal-400 font-semibold text-sm">Simulation Mode Active</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  {removedProviders.size} provider{removedProviders.size !== 1 ? 's' : ''} removed • Exports will include simulation data
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Export Status */}
        {exportStatus && (
          <div className={`mb-6 p-4 rounded-xl border-2 ${
            exportStatus.type === 'success'
              ? 'bg-teal-500/10 border-teal-500/30'
              : 'bg-rose-500/10 border-rose-500/30'
          }`}>
            <div className="flex items-center gap-3">
              {exportStatus.type === 'success' ? (
                <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <p className={`text-sm font-medium ${
                exportStatus.type === 'success' ? 'text-teal-400' : 'text-rose-400'
              }`}>
                {exportStatus.message}
              </p>
            </div>
          </div>
        )}

        {/* Export All Button */}
        <div className="mb-8">
          <button
            onClick={() => handleExport('all')}
            disabled={isExporting}
            className="w-full bg-gradient-to-br from-teal-500 to-blue-500 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export All Reports
              </>
            )}
          </button>
        </div>

        {/* Individual Export Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Provider Directory Export */}
          <div className="bg-slate-800/50 backdrop-blur-xl border-2 border-slate-700/50 rounded-2xl p-6 hover:border-teal-500/30 transition-all">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-teal-500/10 rounded-xl">
                <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-1">Provider Directory</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Complete provider list with NPI, specialty, state, confidence ratings, and status
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                  <span className="px-2 py-1 bg-slate-700/30 rounded">CSV Format</span>
                  <span className="px-2 py-1 bg-slate-700/30 rounded">~50,000 providers</span>
                  {isSimulationMode && (
                    <span className="px-2 py-1 bg-teal-500/20 text-teal-400 rounded">Simulation data included</span>
                  )}
                </div>
                <button
                  onClick={() => handleExport('directory')}
                  disabled={isExporting}
                  className="w-full bg-slate-700/50 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Directory
                </button>
              </div>
            </div>
          </div>

          {/* Adequacy Results Export */}
          <div className="bg-slate-800/50 backdrop-blur-xl border-2 border-slate-700/50 rounded-2xl p-6 hover:border-teal-500/30 transition-all">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-1">Adequacy Results</h3>
                <p className="text-slate-400 text-sm mb-4">
                  State-by-state network adequacy metrics with baseline vs current comparison
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                  <span className="px-2 py-1 bg-slate-700/30 rounded">CSV Format</span>
                  <span className="px-2 py-1 bg-slate-700/30 rounded">50 states</span>
                  {isSimulationMode && (
                    <span className="px-2 py-1 bg-teal-500/20 text-teal-400 rounded">Shows impact</span>
                  )}
                </div>
                <button
                  onClick={() => handleExport('adequacy')}
                  disabled={isExporting}
                  className="w-full bg-slate-700/50 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Adequacy
                </button>
              </div>
            </div>
          </div>

          {/* KPI Summary Export */}
          <div className="bg-slate-800/50 backdrop-blur-xl border-2 border-slate-700/50 rounded-2xl p-6 hover:border-teal-500/30 transition-all">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-1">KPI Summary</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Key performance indicators across network, adequacy, and compliance metrics
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                  <span className="px-2 py-1 bg-slate-700/30 rounded">CSV Format</span>
                  <span className="px-2 py-1 bg-slate-700/30 rounded">18 metrics</span>
                  {isSimulationMode && (
                    <span className="px-2 py-1 bg-teal-500/20 text-teal-400 rounded">Includes impact summary</span>
                  )}
                </div>
                <button
                  onClick={() => handleExport('kpis')}
                  disabled={isExporting}
                  className="w-full bg-slate-700/50 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export KPIs
                </button>
              </div>
            </div>
          </div>

          {/* Impact Report Export */}
          <div className={`bg-slate-800/50 backdrop-blur-xl border-2 rounded-2xl p-6 transition-all ${
            isSimulationMode && removedProviders.size > 0
              ? 'border-slate-700/50 hover:border-teal-500/30'
              : 'border-slate-700/30 opacity-50'
          }`}>
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-rose-500/10 rounded-xl">
                <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-1">Impact Report</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Detailed simulation results showing cascading effects of provider removals
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                  <span className="px-2 py-1 bg-slate-700/30 rounded">CSV Format</span>
                  {isSimulationMode && removedProviders.size > 0 ? (
                    <span className="px-2 py-1 bg-teal-500/20 text-teal-400 rounded">Simulation active</span>
                  ) : (
                    <span className="px-2 py-1 bg-slate-700/30 rounded">Requires simulation mode</span>
                  )}
                </div>
                <button
                  onClick={() => handleExport('impacts')}
                  disabled={isExporting || !isSimulationMode || removedProviders.size === 0}
                  className="w-full bg-slate-700/50 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Impacts
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-slate-800/30 border border-slate-700/30 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-slate-400">
              <p className="mb-2">
                <strong className="text-white">Export Information:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>All exports are in CSV format and timestamped with the current date</li>
                <li>Provider directory exports are limited to 50,000 providers for performance</li>
                <li>Impact reports are only available when simulation mode is active</li>
                <li>Use "Export All" to download a complete bundle of all available reports</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
