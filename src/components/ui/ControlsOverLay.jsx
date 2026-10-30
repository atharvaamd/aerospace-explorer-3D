import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Gauge,
  Calendar,
  FastForward,
  Sparkles,
} from 'lucide-react';
import { useSpaceStore } from '../../store/useSpaceStore';
import { PLANETS_DATA } from '../../data/planets';
import { formatSimulatedDate } from '../../utils/astronomy';

export default function ControlsOverLay() {
  const {
    isPaused,
    togglePause,
    speedFactor,
    setSpeedFactor,
    simulatedDays,
    resetView,
    selectedPlanet,
    setSelectedPlanet,
    openTimeTravel,
    jumpYears,
  } = useSpaceStore();

  const speedPresets = [0.25, 0.5, 1, 2, 5, 10];

  return (
    <div className="fixed bottom-4 left-0 right-0 z-30 px-4 pointer-events-none">
      <div className="max-w-5xl mx-auto flex flex-col gap-2.5 items-center pointer-events-auto">
        
        {/* Planet Quick-Select Ribbon */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl max-w-full overflow-x-auto">
          {PLANETS_DATA.map((planet) => {
            const isSelected = selectedPlanet?.id === planet.id;
            return (
              <button
                key={planet.id}
                onClick={() => setSelectedPlanet(planet)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500/80 to-blue-600/80 text-white border-cyan-400 shadow-md shadow-cyan-500/30 scale-105'
                    : 'bg-slate-800/50 hover:bg-slate-700/60 text-slate-300 border-transparent hover:border-slate-600'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: planet.color }}
                />
                <span>{planet.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main Playback & Speed Controls Dock */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-4 px-4 py-2.5 bg-slate-900/90 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl shadow-2xl">
          {/* Play / Pause Toggle */}
          <button
            onClick={togglePause}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
              isPaused
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/30 animate-pulse'
            }`}
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            )}
          </button>

          {/* Speed Presets Buttons */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <Gauge className="w-3.5 h-3.5 text-cyan-400 ml-1.5 mr-1 shrink-0" />
            {speedPresets.map((speed) => (
              <button
                key={speed}
                onClick={() => setSpeedFactor(speed)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  speedFactor === speed
                    ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Speed Slider */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Speed:</span>
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={speedFactor}
              onChange={(e) => setSpeedFactor(parseFloat(e.target.value))}
              className="w-20 accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Calendar Date & Time Travel Launcher */}
          <button
            onClick={openTimeTravel}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-slate-800 to-cyan-950/60 hover:from-slate-750 hover:to-cyan-900/70 rounded-xl border border-cyan-500/40 text-slate-200 transition-all shadow-md group"
            title="Open Temporal Navigation & Planetary Alignment"
          >
            <Calendar className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <div className="text-left text-xs">
              <span className="font-mono font-bold text-white tracking-tight">
                {formatSimulatedDate(simulatedDays)}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 ml-1">
              Jump Date
            </span>
          </button>

          {/* Quick Jump Buttons (+10y, +50y) */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => jumpYears(10)}
              className="px-2 py-1 rounded-lg text-xs font-bold text-cyan-300 hover:text-white hover:bg-cyan-500/20 transition-all"
              title="Jump 10 years forward"
            >
              +10y
            </button>
            <button
              onClick={() => jumpYears(50)}
              className="px-2 py-1 rounded-lg text-xs font-bold text-cyan-300 hover:text-white hover:bg-cyan-500/20 transition-all"
              title="Jump 50 years forward"
            >
              +50y
            </button>
          </div>

          {/* Reset Camera Button */}
          <button
            onClick={resetView}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 hover:border-slate-500 transition-all"
            title="Reset to Solar System view"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
