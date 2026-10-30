import React, { useMemo } from 'react';
import {
  X,
  FastForward,
  RotateCcw,
  Compass,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  Eye,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useSpaceStore } from '../../store/useSpaceStore';
import {
  daysToDate,
  dateToDays,
  formatSimulatedDate,
  detectPlanetaryAlignments,
} from '../../utils/astronomy';

export default function TimeTravelModal() {
  const isTimeTravelOpen = useSpaceStore((state) => state.isTimeTravelOpen);
  const closeTimeTravel = useSpaceStore((state) => state.closeTimeTravel);
  const simulatedDays = useSpaceStore((state) => state.simulatedDays);
  const setSimulatedDays = useSpaceStore((state) => state.setSimulatedDays);
  const jumpYears = useSpaceStore((state) => state.jumpYears);
  const setCameraAngle = useSpaceStore((state) => state.setCameraAngle);

  // Current calendar date
  const currentDate = useMemo(() => daysToDate(simulatedDays), [simulatedDays]);
  const currentYear = currentDate.getUTCFullYear();
  const dateInputVal = currentDate.toISOString().split('T')[0];

  // Detect alignments at current date
  const { positions, alignments } = useMemo(
    () => detectPlanetaryAlignments(simulatedDays),
    [simulatedDays]
  );

  if (!isTimeTravelOpen) return null;

  const quickJumps = [
    { label: 'Reset to 2026', years: 0, isReset: true },
    { label: '+5 Years', years: 5 },
    { label: '+10 Years', years: 10 },
    { label: '+20 Years', years: 20 },
    { label: '+30 Years', years: 30 },
    { label: '+50 Years', years: 50 },
    { label: '+100 Years', years: 100 },
  ];

  const handleDateChange = (e) => {
    if (!e.target.value) return;
    const pickedDate = new Date(e.target.value + 'T00:00:00Z');
    setSimulatedDays(dateToDays(pickedDate));
  };

  const handleYearSlider = (e) => {
    const year = parseInt(e.target.value, 10);
    const date = new Date(Date.UTC(year, currentDate.getUTCMonth(), currentDate.getUTCDate()));
    setSimulatedDays(dateToDays(date));
  };

  const inspectIn3D = () => {
    setCameraAngle('top');
    closeTimeTravel();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-850/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <FastForward className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Temporal Navigation & Planetary Alignment
              </h2>
              <p className="text-xs text-slate-400">
                Jump forward 10–50+ years to observe orbital positions, Keplerian dynamics, and celestial alignments
              </p>
            </div>
          </div>

          <button
            onClick={closeTimeTravel}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Main Date Display Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-800/80 via-slate-800/50 to-cyan-950/40 border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shrink-0 shadow-lg shadow-cyan-500/20">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider">
                  Current Simulation Epoch
                </span>
                <p className="text-2xl font-black text-white font-mono tracking-tight mt-0.5">
                  {formatSimulatedDate(simulatedDays)}
                </p>
                <p className="text-xs text-slate-400">
                  {Math.floor(simulatedDays).toLocaleString()} days elapsed from Jan 1, 2026 baseline
                </p>
              </div>
            </div>

            {/* Quick reset button if shifted */}
            {Math.abs(simulatedDays) > 1 && (
              <button
                onClick={() => setSimulatedDays(0)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to 2026</span>
              </button>
            )}
          </div>

          {/* Quick Future Jump Presets */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
              Quick Future Jumps
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {quickJumps.map((q) => (
                <button
                  key={q.label}
                  onClick={() => {
                    if (q.isReset) {
                      setSimulatedDays(0);
                    } else {
                      jumpYears(q.years);
                    }
                  }}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
                    q.isReset
                      ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                      : 'bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-300 hover:text-white border-cyan-500/30 shadow-sm'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Year Scrubber & Date Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Year Slider */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Scrub Year Slider</span>
                </span>
                <span className="text-sm font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  {currentYear}
                </span>
              </div>
              <input
                type="range"
                min="1980"
                max="2100"
                value={currentYear}
                onChange={handleYearSlider}
                className="w-full accent-cyan-400 h-2 bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>1980</span>
                <span>2026 (Today)</span>
                <span>2050</span>
                <span>2076 (+50y)</span>
                <span>2100</span>
              </div>
            </div>

            {/* Direct Date Picker */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Jump to Specific Calendar Date</span>
              </span>
              <input
                type="date"
                value={dateInputVal}
                onChange={handleDateChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Pick historical launch dates or future mission milestones
              </span>
            </div>
          </div>

          {/* Planetary Alignment & Conjunctions Section */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Planetary Alignment & Conjunction Analysis
                </h3>
              </div>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                alignments.length > 0
                  ? 'bg-amber-950/80 text-amber-300 border-amber-600/50 animate-pulse'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {alignments.length > 0 ? `${alignments.length} Conjunction(s) Detected` : 'Dispersed Orbits'}
              </span>
            </div>

            {/* Conjunction Alert Cards */}
            {alignments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                {alignments.slice(0, 4).map((align, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center -space-x-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full ring-2 ring-slate-900 shadow"
                          style={{ backgroundColor: align.planetA.color }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full ring-2 ring-slate-900 shadow"
                          style={{ backgroundColor: align.planetB.color }}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">
                          {align.planetA.name} & {align.planetB.name}
                        </p>
                        <p className="text-[10px] text-amber-300">{align.type}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                      {align.separationDeg}° sep
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 mb-4 italic">
                No tight conjunctions under 22° on this date. Planets are distributed across their Keplerian orbits.
              </p>
            )}

            {/* Live Orbital Longitudes Bar */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1">
                Orbital Longitude Positions (0° – 360°):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {positions.map((p) => (
                  <div
                    key={p.id}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shadow-sm"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="text-xs text-slate-200 font-medium">{p.name}</span>
                    </div>
                    <span className="text-xs font-mono text-cyan-400 font-bold">
                      {Math.round(p.degree)}°
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={inspectIn3D}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Inspect Alignment in 3D (Top View)</span>
          </button>

          <button
            onClick={closeTimeTravel}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
          >
            Resume Simulation
          </button>
        </div>
      </div>
    </div>
  );
}
