import { useState, useEffect, useMemo } from 'react';
import {
  searchProviders,
  getTotalProviderCount,
  getProviderCountByState,
  getProvidersByConfidence,
  specialties
} from '../utils/providerGenerator';

export default function ProviderDirectory({
  removedProviders,
  setRemovedProviders,
  onSimulationChange
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [providers, setProviders] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isSimulationMode, setIsSimulationMode] = useState(false);

  const totalProviders = getTotalProviderCount();
  const activeProviders = totalProviders - removedProviders.size;

  // Load providers based on filters (don't exclude removed ones, we'll grey them out)
  useEffect(() => {
    const result = searchProviders({
      page: currentPage,
      pageSize: 50,
      searchTerm,
      state: stateFilter || null,
      specialty: specialtyFilter || null,
      confidence: confidenceFilter || null,
      removedProviderIds: new Set() // Don't filter removed providers
    });

    setProviders(result.providers);
    setHasMore(result.hasMore);
  }, [currentPage, searchTerm, stateFilter, specialtyFilter, confidenceFilter]);

  // Confidence distribution
  const confidenceStats = useMemo(() => {
    return getProvidersByConfidence(removedProviders);
  }, [removedProviders]);

  const handleRemoveProvider = (providerId) => {
    const newRemoved = new Set(removedProviders);
    newRemoved.add(providerId);
    setRemovedProviders(newRemoved);
    setIsSimulationMode(true);
    onSimulationChange(true);
  };

  const handleRestoreProvider = (providerId) => {
    const newRemoved = new Set(removedProviders);
    newRemoved.delete(providerId);
    setRemovedProviders(newRemoved);

    // If no providers removed, exit simulation mode
    if (newRemoved.size === 0) {
      setIsSimulationMode(false);
      onSimulationChange(false);
    }
  };

  const handleResetSimulation = () => {
    setRemovedProviders(new Set());
    setIsSimulationMode(false);
    onSimulationChange(false);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(0);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Provider Directory</h2>
            <p className="text-xs text-slate-400">
              {activeProviders.toLocaleString()} of {totalProviders.toLocaleString()} providers
              {isSimulationMode && (
                <span className="ml-2 text-amber-400">• Simulation Mode Active</span>
              )}
            </p>
          </div>
          {isSimulationMode && (
            <button
              onClick={handleResetSimulation}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Simulation
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search by name or NPI..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="col-span-2 px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
          />

          <select
            value={confidenceFilter}
            onChange={(e) => { setConfidenceFilter(e.target.value); setCurrentPage(0); }}
            className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs text-white"
          >
            <option value="">All Confidence Levels</option>
            <option value="High">High Confidence</option>
            <option value="Mid">Mid Confidence</option>
            <option value="Low">Low Confidence</option>
          </select>

          <select
            value={specialtyFilter}
            onChange={(e) => { setSpecialtyFilter(e.target.value); setCurrentPage(0); }}
            className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs text-white"
          >
            <option value="">All Specialties</option>
            {specialties.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

        {/* Confidence Stats */}
        <div className="flex items-center gap-4 mt-3 text-xs">
          <span className="text-slate-400">Confidence Distribution:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-white">{confidenceStats.High.toLocaleString()}</span>
            <span className="text-slate-400">High</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-white">{confidenceStats.Mid.toLocaleString()}</span>
            <span className="text-slate-400">Mid</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span className="text-white">{confidenceStats.Low.toLocaleString()}</span>
            <span className="text-slate-400">Low</span>
          </span>
        </div>
      </div>

      {/* Provider List */}
      <div className="flex-1 bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-2xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50">
              <tr>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Provider</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">NPI</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Specialty</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">State</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Confidence</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((provider) => {
                const isRemoved = removedProviders.has(provider.id);
                return (
                  <tr
                    key={provider.id}
                    className={`border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors cursor-pointer ${
                      selectedProvider?.id === provider.id ? 'bg-slate-800/50' : ''
                    } ${isRemoved ? 'opacity-40' : ''}`}
                    onClick={() => setSelectedProvider(provider)}
                  >
                    <td className={`px-4 py-3 ${isRemoved ? 'text-slate-500 line-through' : 'text-white'}`}>
                      {provider.name}
                    </td>
                    <td className={`px-4 py-3 font-mono ${isRemoved ? 'text-slate-600 line-through' : 'text-slate-400'}`}>
                      {provider.npi}
                    </td>
                    <td className={`px-4 py-3 ${isRemoved ? 'text-slate-600 line-through' : 'text-slate-300'}`}>
                      {provider.specialty}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded ${isRemoved ? 'bg-slate-700/20 text-slate-600 line-through' : 'bg-slate-700/30 text-slate-300'}`}>
                        {provider.state}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        isRemoved ? 'bg-slate-700/20 text-slate-600 line-through' :
                        provider.confidence === 'High' ? 'bg-emerald-500/20 text-emerald-400' :
                        provider.confidence === 'Mid' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-rose-500/20 text-rose-400'
                      }`}>
                        {provider.confidence}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isRemoved ? (
                        <span className="text-slate-600 text-xs line-through">Removed</span>
                      ) : provider.acceptingPatients ? (
                        <span className="text-emerald-400 text-xs">Accepting</span>
                      ) : (
                        <span className="text-slate-500 text-xs">Not Accepting</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isRemoved ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestoreProvider(provider.id);
                          }}
                          className="px-3 py-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 rounded text-xs transition-colors"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveProvider(provider.id);
                          }}
                          className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded text-xs transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {providers.length === 0 && (
            <div className="flex items-center justify-center h-64 text-slate-400">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">No providers found</p>
                <p className="text-xs mt-1">Try adjusting your filters</p>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {providers.length > 0 && (
          <div className="border-t border-slate-800/50 bg-slate-800/30 px-4 py-3 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Page {currentPage + 1} • Showing {providers.length} providers
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-white text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!hasMore}
                className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-white text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Provider Detail Panel */}
      {selectedProvider && (() => {
        const isRemoved = removedProviders.has(selectedProvider.id);
        return (
          <div className="fixed right-4 top-20 w-80 bg-slate-800/95 backdrop-blur-lg border border-teal-500/30 rounded-xl p-4 shadow-2xl z-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">Provider Details</h3>
                {isRemoved && (
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-xs rounded-full">
                    Removed
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedProvider(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-400 mb-1">Name</p>
                <p className="text-white font-medium">{selectedProvider.name}</p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">NPI</p>
                <p className="text-white font-mono">{selectedProvider.npi}</p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Specialty</p>
                <p className="text-white">{selectedProvider.specialty}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-slate-400 mb-1">State</p>
                  <p className="text-white">{selectedProvider.state}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">Years in Practice</p>
                  <p className="text-white">{selectedProvider.yearsInPractice}</p>
                </div>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Confidence Rating</p>
                <span className={`px-2 py-1 rounded-full text-xs inline-block ${
                  selectedProvider.confidence === 'High' ? 'bg-emerald-500/20 text-emerald-400' :
                  selectedProvider.confidence === 'Mid' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-rose-500/20 text-rose-400'
                }`}>
                  {selectedProvider.confidence}
                </span>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Accepting Patients</p>
                <p className={selectedProvider.acceptingPatients ? 'text-emerald-400' : 'text-slate-500'}>
                  {selectedProvider.acceptingPatients ? 'Yes' : 'No'}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700/50">
              {isRemoved ? (
                <button
                  onClick={() => {
                    handleRestoreProvider(selectedProvider.id);
                    setSelectedProvider(null);
                  }}
                  className="w-full px-3 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 rounded text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Restore to Network
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleRemoveProvider(selectedProvider.id);
                    setSelectedProvider(null);
                  }}
                  className="w-full px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove from Network (What-If)
                </button>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
