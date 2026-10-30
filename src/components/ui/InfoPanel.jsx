import React from 'react';
import {
  X,
  Compass,
  Thermometer,
  Weight,
  Globe2,
  Clock,
  Sparkles,
  BarChart2,
  Moon,
  Wind,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useSpaceStore } from '../../store/useSpaceStore';

export default function InfoPanel() {
  const { selectedPlanet, setSelectedPlanet, resetView, openCompare } = useSpaceStore();

  if (!selectedPlanet) return null;

  return (
    <aside className="fixed top-20 right-4 bottom-24 z-30 w-84 sm:w-96 max-w-[calc(100vw-2rem)] flex flex-col bg-slate-900/90 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-right-8 pointer-events-auto">
      
      {/* Panel Header */}
      <div className="relative p-5 pb-4 border-b border-slate-800 bg-gradient-to-b from-slate-850 to-slate-900">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg border border-white/20"
              style={{
                backgroundColor: selectedPlanet.color,
                boxShadow: `0 0 20px ${selectedPlanet.color}55`,
              }}
            >
              <Globe2 className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-wide text-white">
                  {selectedPlanet.name}
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-700/50">
                  {selectedPlanet.type}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedPlanet.id === 'sun' ? 'Central Star' : `Orbit #${PLANETS_DATA_INDEX(selectedPlanet.id)}`}
              </p>
            </div>
          </div>

          {/* Close Panel Button */}
          <button
            onClick={() => setSelectedPlanet(null)}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-400 hover:text-white border border-slate-700/60 transition-colors"
            title="Close Info Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Diameter */}
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Diameter</span>
            </div>
            <p className="text-sm font-bold text-white font-mono">
              {selectedPlanet.diameter.toLocaleString()} km
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {(selectedPlanet.diameter / 12742).toFixed(2)}x Earth
            </p>
          </div>

          {/* Distance from Sun */}
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Distance to Sun</span>
            </div>
            <p className="text-sm font-bold text-white font-mono">
              {selectedPlanet.distanceKm === 0 ? '0 km' : `${selectedPlanet.distanceKm}M km`}
            </p>
            <p className="text-[10px] text-cyan-400 mt-0.5">
              {selectedPlanet.distanceAU} AU
            </p>
          </div>

          {/* Orbital Period */}
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Orbital Period</span>
            </div>
            <p className="text-sm font-bold text-white font-mono">
              {selectedPlanet.orbitalPeriod === 0
                ? 'N/A (Center)'
                : `${selectedPlanet.orbitalPeriod} Days`}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {selectedPlanet.orbitalPeriod > 0
                ? `${(selectedPlanet.orbitalPeriod / 365.25).toFixed(2)} Earth Yrs`
                : 'Stationary'}
            </p>
          </div>

          {/* Day Length & Axial Tilt */}
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Day & Tilt</span>
            </div>
            <p className="text-sm font-bold text-white font-mono">
              {selectedPlanet.rotationPeriod}
            </p>
            <p className="text-[10px] text-cyan-300 mt-0.5">
              {selectedPlanet.axialTilt !== undefined ? `${selectedPlanet.axialTilt}° axial tilt` : 'Axial rotation'}
            </p>
          </div>

          {/* Surface Temperature */}
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span>Temperature</span>
            </div>
            <p className="text-xs font-bold text-white">
              {selectedPlanet.surfaceTemp}
            </p>
          </div>

          {/* Gravity & Moons */}
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Weight className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gravity & Moons</span>
            </div>
            <p className="text-sm font-bold text-white font-mono">
              {selectedPlanet.gravity} m/s²
            </p>
            <p className="text-[10px] text-cyan-300 mt-0.5 flex items-center gap-1">
              <Moon className="w-3 h-3 inline" /> {selectedPlanet.moons} Moons
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
            Overview
          </h3>
          <p className="text-xs leading-relaxed text-slate-300">
            {selectedPlanet.description}
          </p>
        </div>

        {/* Fun Astronomical Fact */}
        {selectedPlanet.funFact && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 border border-cyan-500/30">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cosmic Fact</span>
            </div>
            <p className="text-xs text-cyan-100 leading-relaxed italic">
              "{selectedPlanet.funFact}"
            </p>
          </div>
        )}

        {/* Atmospheric Composition */}
        {selectedPlanet.atmosphere && selectedPlanet.atmosphere.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-slate-300 text-xs font-bold mb-2.5">
              <Wind className="w-3.5 h-3.5 text-sky-400" />
              <span>Atmospheric Composition</span>
            </div>
            <div className="space-y-2">
              {selectedPlanet.atmosphere.map((gas) => (
                <div key={gas.element}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-300">{gas.element}</span>
                    <span className="text-cyan-400 font-mono font-medium">{gas.percent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      style={{ width: `${Math.min(gas.percent, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex gap-2">
        <button
          onClick={() => openCompare(selectedPlanet)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
        >
          <BarChart2 className="w-4 h-4" />
          <span>Compare Body</span>
        </button>

        <button
          onClick={resetView}
          className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          title="Return to Solar Overview"
        >
          Reset View
        </button>
      </div>
    </aside>
  );
}

function PLANETS_DATA_INDEX(id) {
  const order = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
  const idx = order.indexOf(id);
  return idx >= 0 ? idx + 1 : '1';
}
