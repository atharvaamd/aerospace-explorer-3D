import React, { useState } from 'react';
import {
  X,
  Scale,
  ArrowRightLeft,
  Globe2,
  Compass,
  Clock,
  Weight,
  Thermometer,
  Moon,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { PLANETS_DATA } from '../../data/planets';
import { useSpaceStore } from '../../store/useSpaceStore';

export default function CompareModal() {
  const {
    isCompareOpen,
    closeCompare,
    planetA,
    planetB,
    setPlanetA,
    setPlanetB,
    setSelectedPlanet,
  } = useSpaceStore();

  const [activeMetricTab, setActiveMetricTab] = useState('all');

  if (!isCompareOpen) return null;

  // Comparison metrics calculations
  const diameterRatio = (planetA.diameter / (planetB.diameter || 1)).toFixed(2);
  const gravityRatio = (planetA.gravity / (planetB.gravity || 1)).toFixed(2);
  const periodDiff = Math.abs(planetA.orbitalPeriod - planetB.orbitalPeriod);

  // Chart datasets
  // 1. Normalized comparison (percentage relative to larger of the two)
  const normalizedChartData = [
    {
      metric: 'Diameter',
      unit: 'km',
      [planetA.name]: planetA.diameter,
      [planetB.name]: planetB.diameter,
    },
    {
      metric: 'Distance (M km)',
      unit: 'Million km',
      [planetA.name]: planetA.distanceKm,
      [planetB.name]: planetB.distanceKm,
    },
    {
      metric: 'Orbital Period',
      unit: 'Days',
      [planetA.name]: planetA.orbitalPeriod,
      [planetB.name]: planetB.orbitalPeriod,
    },
    {
      metric: 'Gravity (x10)',
      unit: 'm/s² x10',
      [planetA.name]: Math.round(planetA.gravity * 10),
      [planetB.name]: Math.round(planetB.gravity * 10),
    },
  ];

  // Specific single metric charts if selected
  const diameterChartData = [
    { name: planetA.name, value: planetA.diameter, fill: planetA.color },
    { name: planetB.name, value: planetB.diameter, fill: planetB.color },
  ];

  const periodChartData = [
    { name: planetA.name, value: planetA.orbitalPeriod, fill: planetA.color },
    { name: planetB.name, value: planetB.orbitalPeriod, fill: planetB.color },
  ];

  const focusPlanet = (planet) => {
    setSelectedPlanet(planet);
    closeCompare();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-850/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Celestial Body Comparison
              </h2>
              <p className="text-xs text-slate-400">
                Compare orbital parameters, physical dimensions, and atmospheric conditions
              </p>
            </div>
          </div>

          <button
            onClick={closeCompare}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Planet Selectors Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Planet A Selector */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-cyan-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Target Body A
                </span>
                <button
                  onClick={() => focusPlanet(planetA)}
                  className="text-[11px] text-cyan-300 hover:text-white flex items-center gap-1 hover:underline"
                >
                  <span>Focus in 3D</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-full shrink-0 shadow-md"
                  style={{ backgroundColor: planetA.color }}
                />
                <select
                  value={planetA.id}
                  onChange={(e) => {
                    const found = PLANETS_DATA.find((p) => p.id === e.target.value);
                    if (found) setPlanetA(found);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-cyan-400"
                >
                  {PLANETS_DATA.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Planet B Selector */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-amber-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Target Body B
                </span>
                <button
                  onClick={() => focusPlanet(planetB)}
                  className="text-[11px] text-amber-300 hover:text-white flex items-center gap-1 hover:underline"
                >
                  <span>Focus in 3D</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-full shrink-0 shadow-md"
                  style={{ backgroundColor: planetB.color }}
                />
                <select
                  value={planetB.id}
                  onChange={(e) => {
                    const found = PLANETS_DATA.find((p) => p.id === e.target.value);
                    if (found) setPlanetB(found);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-amber-400"
                >
                  {PLANETS_DATA.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Insights Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-700/50 text-center">
              <span className="text-[11px] text-slate-400">Diameter Difference</span>
              <p className="text-sm font-bold text-white mt-1">
                {planetA.name} is <span className="text-cyan-400">{diameterRatio}x</span> {planetB.name}
              </p>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-700/50 text-center">
              <span className="text-[11px] text-slate-400">Orbital Span Difference</span>
              <p className="text-sm font-bold text-white mt-1">
                <span className="text-cyan-400">{periodDiff.toLocaleString()}</span> Earth Days
              </p>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-700/50 text-center">
              <span className="text-[11px] text-slate-400">Relative Surface Gravity</span>
              <p className="text-sm font-bold text-white mt-1">
                {planetA.name} is <span className="text-amber-400">{gravityRatio}x</span> {planetB.name}
              </p>
            </div>
          </div>

          {/* Visual Comparison Chart Section */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Visual Parameter Comparison</h3>
                <p className="text-xs text-slate-400">
                  Direct comparison across astronomical measurements
                </p>
              </div>

              {/* Metric filter buttons */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveMetricTab('all')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                    activeMetricTab === 'all'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Multi-Param
                </button>
                <button
                  onClick={() => setActiveMetricTab('diameter')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                    activeMetricTab === 'diameter'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Diameter
                </button>
                <button
                  onClick={() => setActiveMetricTab('period')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                    activeMetricTab === 'period'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Orbit Days
                </button>
              </div>
            </div>

            {/* Recharts Chart Container */}
            <div className="h-64 w-full">
              {activeMetricTab === 'all' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={normalizedChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                    <XAxis dataKey="metric" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey={planetA.name}
                      fill={planetA.color || '#38bdf8'}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey={planetB.name}
                      fill={planetB.color || '#f59e0b'}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : activeMetricTab === 'diameter' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={diameterChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      formatter={(val) => [`${val.toLocaleString()} km`, 'Diameter']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#f8fafc',
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={periodChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      formatter={(val) => [`${val.toLocaleString()} days`, 'Orbital Period']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#f8fafc',
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Side-by-Side Detailed Parameter Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                <tr>
                  <th className="p-3 font-semibold">Parameter</th>
                  <th className="p-3 font-semibold text-cyan-400">{planetA.name}</th>
                  <th className="p-3 font-semibold text-amber-400">{planetB.name}</th>
                  <th className="p-3 font-semibold text-slate-400">Comparison</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                <tr>
                  <td className="p-3 text-slate-300 font-medium">Diameter</td>
                  <td className="p-3 font-mono font-semibold text-white">{planetA.diameter.toLocaleString()} km</td>
                  <td className="p-3 font-mono font-semibold text-white">{planetB.diameter.toLocaleString()} km</td>
                  <td className="p-3 text-cyan-300">{diameterRatio}x ratio</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-300 font-medium">Distance from Sun</td>
                  <td className="p-3 font-mono font-semibold text-white">
                    {planetA.distanceKm === 0 ? '0 km' : `${planetA.distanceKm}M km (${planetA.distanceAU} AU)`}
                  </td>
                  <td className="p-3 font-mono font-semibold text-white">
                    {planetB.distanceKm === 0 ? '0 km' : `${planetB.distanceKm}M km (${planetB.distanceAU} AU)`}
                  </td>
                  <td className="p-3 text-slate-300">
                    {Math.abs(planetA.distanceKm - planetB.distanceKm).toFixed(1)}M km diff
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-300 font-medium">Orbital Period</td>
                  <td className="p-3 font-mono font-semibold text-white">
                    {planetA.orbitalPeriod === 0 ? 'N/A' : `${planetA.orbitalPeriod} Earth Days`}
                  </td>
                  <td className="p-3 font-mono font-semibold text-white">
                    {planetB.orbitalPeriod === 0 ? 'N/A' : `${planetB.orbitalPeriod} Earth Days`}
                  </td>
                  <td className="p-3 text-slate-300">{periodDiff.toLocaleString()} Days diff</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-300 font-medium">Surface Gravity</td>
                  <td className="p-3 font-mono font-semibold text-white">{planetA.gravity} m/s²</td>
                  <td className="p-3 font-mono font-semibold text-white">{planetB.gravity} m/s²</td>
                  <td className="p-3 text-amber-300">{gravityRatio}x ratio</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-300 font-medium">Surface Temperature</td>
                  <td className="p-3 font-medium text-white">{planetA.surfaceTemp}</td>
                  <td className="p-3 font-medium text-white">{planetB.surfaceTemp}</td>
                  <td className="p-3 text-slate-300">-</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-300 font-medium">Known Moons</td>
                  <td className="p-3 font-mono font-semibold text-white">{planetA.moons}</td>
                  <td className="p-3 font-mono font-semibold text-white">{planetB.moons}</td>
                  <td className="p-3 text-slate-300">{Math.abs(planetA.moons - planetB.moons)} diff</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-300 font-medium">Axial Tilt</td>
                  <td className="p-3 font-mono font-semibold text-white">{planetA.axialTilt}°</td>
                  <td className="p-3 font-mono font-semibold text-white">{planetB.axialTilt}°</td>
                  <td className="p-3 text-cyan-300">{Math.abs((planetA.axialTilt || 0) - (planetB.axialTilt || 0)).toFixed(1)}° diff</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex justify-end gap-3">
          <button
            onClick={closeCompare}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-cyan-500/20"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
