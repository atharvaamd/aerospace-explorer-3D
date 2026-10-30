import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Compass,
  Box,
  MoveHorizontal,
  RotateCcw,
  Maximize2,
} from 'lucide-react';
import { useSpaceStore } from '../../store/useSpaceStore';

export default function CameraControlsWidget() {
  const resetView = useSpaceStore((state) => state.resetView);
  const setCameraAngle = useSpaceStore((state) => state.setCameraAngle);
  const zoomCamera = useSpaceStore((state) => state.zoomCamera);
  const selectedPlanet = useSpaceStore((state) => state.selectedPlanet);

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-1.5 p-2 bg-slate-900/85 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl shadow-2xl pointer-events-auto">
      {/* Zoom In Button */}
      <button
        onClick={() => zoomCamera(1)}
        className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-400/50 transition-all shadow-md group"
        title="Zoom In closer (+)"
      >
        <ZoomIn className="w-4 h-4 group-hover:scale-110 transition-transform" />
      </button>

      {/* Zoom Out Button */}
      <button
        onClick={() => zoomCamera(-1)}
        className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-400/50 transition-all shadow-md group"
        title="Zoom Out wider (-)"
      >
        <ZoomOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
      </button>

      <div className="w-5 h-[1px] bg-slate-700/80 my-1" />

      {/* Top View (90 deg orbital plane) */}
      <button
        onClick={() => setCameraAngle('top')}
        className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-400/50 transition-all shadow-md group"
        title="Top-Down View (Orbital Map)"
      >
        <Compass className="w-4 h-4 group-hover:scale-110 transition-transform" />
      </button>

      {/* 3D Isometric / Angled View */}
      <button
        onClick={() => setCameraAngle('isometric')}
        className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-400/50 transition-all shadow-md group"
        title="3D Angled Perspective View"
      >
        <Box className="w-4 h-4 group-hover:scale-110 transition-transform" />
      </button>

      {/* Side Edge-on Orbital Plane View */}
      <button
        onClick={() => setCameraAngle('side')}
        className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-400/50 transition-all shadow-md group"
        title="Edge-on Side View (Planar Alignment)"
      >
        <MoveHorizontal className="w-4 h-4 group-hover:scale-110 transition-transform" />
      </button>

      <div className="w-5 h-[1px] bg-slate-700/80 my-1" />

      {/* Reset Camera to Solar Overview */}
      <button
        onClick={resetView}
        className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 border border-slate-700/60 hover:border-amber-400/50 transition-all shadow-md group"
        title="Reset Camera to Overview"
      >
        <RotateCcw className="w-4 h-4 group-hover:-rotate-90 transition-transform" />
      </button>
    </div>
  );
}
