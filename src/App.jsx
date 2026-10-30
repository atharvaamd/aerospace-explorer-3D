import React from 'react';
import Solarsystem from './components/canvas/Solarsystem';
import Navbar from './components/ui/Navbar';
import ControlsOverLay from './components/ui/ControlsOverLay';
import InfoPanel from './components/ui/InfoPanel';
import CompareModal from './components/ui/CompareModal';
import CameraControlsWidget from './components/ui/CameraControlsWidget';
import TimeTravelModal from './components/ui/TimeTravelModal';

export default function App() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#030712] select-none text-slate-100 font-sans">
      {/* 3D WebGL Space Canvas */}
      <Solarsystem />

      {/* Top Navbar: Branding, Search, Filters, Orbit/Label Toggles, Compare Launch */}
      <Navbar />

      {/* Dynamic Right Info HUD Panel for Selected Planet */}
      <InfoPanel />

      {/* Left Floating Camera Angles & Zoom Controls Dock */}
      <CameraControlsWidget />

      {/* Bottom Floating Playback & Speed Controls Dock */}
      <ControlsOverLay />

      {/* Side-by-Side Planet Comparison Modal with Recharts Visual Charts */}
      <CompareModal />

      {/* Time Travel & Planetary Alignment Modal */}
      <TimeTravelModal />
    </main>
  );
}
