import { create } from 'zustand';
import { PLANETS_DATA } from '../data/planets';

export const useSpaceStore = create((set) => ({
  // Planet selection
  selectedPlanet: null,
  hoveredPlanet: null,

  // Animation & simulation controls
  isPaused: false,
  speedFactor: 1,
  simulatedDays: 0,

  // Display toggles
  showOrbits: true,
  showLabels: true,

  // Search & Filtering
  searchQuery: '',
  filterCategory: 'all', // 'all' | 'terrestrial' | 'gas_giant' | 'ice_giant' | 'star'

  // Comparison
  isCompareOpen: false,
  planetA: PLANETS_DATA.find((p) => p.id === 'earth') || PLANETS_DATA[3],
  planetB: PLANETS_DATA.find((p) => p.id === 'mars') || PLANETS_DATA[4],

  // Camera triggers
  resetCameraCounter: 0,
  cameraAngleTrigger: null, // { type: 'top' | 'side' | 'isometric', id: timestamp }
  zoomTrigger: null,         // { dir: 1 (in) | -1 (out), id: timestamp }

  // Actions
  setSelectedPlanet: (planet) => set({ selectedPlanet: planet }),
  setHoveredPlanet: (planet) => set({ hoveredPlanet: planet }),
  
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  setPaused: (isPaused) => set({ isPaused }),
  
  setSpeedFactor: (speedFactor) => set({ speedFactor }),
  
  incrementDays: (amount) => set((state) => ({ 
    simulatedDays: state.simulatedDays + amount 
  })),

  toggleOrbits: () => set((state) => ({ showOrbits: !state.showOrbits })),
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilterCategory: (filterCategory) => set({ filterCategory }),

  openCompare: (planetA, planetB) => set((state) => ({
    isCompareOpen: true,
    planetA: planetA || state.selectedPlanet || state.planetA,
    planetB: planetB || state.planetB,
  })),
  closeCompare: () => set({ isCompareOpen: false }),
  setPlanetA: (planet) => set({ planetA: planet }),
  setPlanetB: (planet) => set({ planetB: planet }),

  resetView: () => set((state) => ({
    selectedPlanet: null,
    resetCameraCounter: state.resetCameraCounter + 1,
  })),

  setCameraAngle: (angle) => set({
    cameraAngleTrigger: { type: angle, id: Date.now() },
  }),

  zoomCamera: (dir) => set({
    zoomTrigger: { dir, id: Date.now() },
  }),
}));
