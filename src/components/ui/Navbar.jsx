import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  RotateCcw,
  BarChart3,
  Eye,
  EyeOff,
  Compass,
  Sparkles,
  X,
  Orbit,
} from 'lucide-react';
import { useSpaceStore } from '../../store/useSpaceStore';
import { PLANETS_DATA } from '../../data/planets';

export default function Navbar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);

  const {
    searchQuery,
    setSearchQuery,
    filterCategory,
    setFilterCategory,
    setSelectedPlanet,
    resetView,
    openCompare,
    showOrbits,
    toggleOrbits,
    showLabels,
    toggleLabels,
    selectedPlanet,
  } = useSpaceStore();

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter planets based on search query and category
  const filteredPlanets = PLANETS_DATA.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchesQuery && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All Bodies' },
    { id: 'terrestrial', label: 'Terrestrial' },
    { id: 'gas_giant', label: 'Gas Giants' },
    { id: 'ice_giant', label: 'Ice Giants' },
    { id: 'star', label: 'Stars' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 py-3 pointer-events-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 pointer-events-auto">
        
        {/* Brand Logo & Status */}
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 px-4 py-2 rounded-2xl shadow-xl">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Orbit className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '12s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                AEROSPACE
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                3D Explorer
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {selectedPlanet ? `Inspecting: ${selectedPlanet.name}` : 'Solar System Overview'}
            </p>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-lg w-full">
          <div className="relative flex items-center bg-slate-900/85 backdrop-blur-xl border border-slate-700/70 hover:border-cyan-500/50 focus-within:border-cyan-400 rounded-2xl px-3.5 py-2 transition-all shadow-xl">
            <Search className="w-4 h-4 text-cyan-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search celestial bodies (e.g. Earth, Mars, Sun)..."
              className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-white rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Autocomplete & Filter Dropdown */}
          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl p-3 shadow-2xl z-50">
              {/* Category Pills inside dropdown */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 border-b border-slate-800">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCategory(cat.id)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                      filterCategory === cat.id
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Results list */}
              <div className="max-h-56 overflow-y-auto space-y-1">
                {filteredPlanets.length > 0 ? (
                  filteredPlanets.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPlanet(p);
                        setIsSearchFocused(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-cyan-500/15 hover:border-cyan-500/30 border border-transparent transition-all text-left group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-3 rounded-full ring-2 ring-white/20 group-hover:scale-125 transition-transform"
                          style={{ backgroundColor: p.color }}
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-slate-400">{p.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-cyan-400 font-mono">
                          {p.distanceKm === 0 ? '0 km' : `${p.distanceKm}M km`}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-slate-400">
                    No celestial bodies match "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Global Toolbar Action Controls */}
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-xl border border-slate-700/80 p-1.5 rounded-2xl shadow-xl">
          {/* Compare Modal Button */}
          <button
            onClick={() => openCompare()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-500/50 hover:to-blue-500/50 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-semibold transition-all shadow-sm"
            title="Compare two celestial bodies"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Compare</span>
          </button>

          {/* Orbit Lines Toggle */}
          <button
            onClick={toggleOrbits}
            className={`p-2 rounded-xl text-xs font-medium border transition-all ${
              showOrbits
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={showOrbits ? 'Hide Orbit Lines' : 'Show Orbit Lines'}
          >
            <Orbit className="w-4 h-4" />
          </button>

          {/* Labels Toggle */}
          <button
            onClick={toggleLabels}
            className={`p-2 rounded-xl text-xs font-medium border transition-all ${
              showLabels
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={showLabels ? 'Hide Planet Labels' : 'Show Planet Labels'}
          >
            {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Reset View Button */}
          <button
            onClick={resetView}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all hover:border-slate-500"
            title="Reset Camera to Overview"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset View</span>
          </button>
        </div>
      </div>
    </header>
  );
}
