import { PLANETS_DATA } from '../data/planets';

// Baseline reference epoch: Jan 1, 2026, 00:00:00 UTC
export const BASE_EPOCH = new Date('2026-01-01T00:00:00Z').getTime();

// Canonical initial angular positions (radians) at baseline epoch
export const PLANET_BASE_ANGLES = {
  sun: 0,
  mercury: 0.45,
  venus: 1.82,
  earth: 0.0,      // Defined on positive X axis at baseline
  mars: 2.65,
  jupiter: 4.10,
  saturn: 5.20,
  uranus: 1.15,
  neptune: 3.80,
};

// Convert simulated elapsed days to a JavaScript Date
export function daysToDate(simulatedDays) {
  return new Date(BASE_EPOCH + simulatedDays * 86400000);
}

// Convert a JavaScript Date to simulated elapsed days from baseline
export function dateToDays(date) {
  const time = date instanceof Date ? date.getTime() : new Date(date).getTime();
  return (time - BASE_EPOCH) / 86400000;
}

// Format simulated days into a human-readable calendar date string
export function formatSimulatedDate(simulatedDays) {
  const date = daysToDate(simulatedDays);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const formatted = date.toLocaleDateString('en-US', options);

  const yearsDiff = Math.round(simulatedDays / 365.25);
  if (Math.abs(yearsDiff) >= 1) {
    const sign = yearsDiff > 0 ? '+' : '';
    return `${formatted} (${sign}${yearsDiff}y)`;
  }
  return formatted;
}

// Get the current orbital angle (in radians) for a celestial body at a given day
export function getPlanetOrbitalAngle(planetId, simulatedDays) {
  const planet = PLANETS_DATA.find((p) => p.id === planetId);
  if (!planet || planet.orbitalPeriod <= 0) return 0;

  const baseAngle = PLANET_BASE_ANGLES[planetId] || 0;
  const angularSpeed = (Math.PI * 2) / planet.orbitalPeriod;
  return (baseAngle + angularSpeed * simulatedDays) % (Math.PI * 2);
}

// Get the current orbital angle in degrees (0 to 360)
export function getPlanetDegree(planetId, simulatedDays) {
  const rad = getPlanetOrbitalAngle(planetId, simulatedDays);
  let deg = (rad * 180) / Math.PI;
  if (deg < 0) deg += 360;
  return deg % 360;
}

// Detect planetary conjunctions and alignments within a threshold (default 20 degrees)
export function detectPlanetaryAlignments(simulatedDays, thresholdDeg = 22) {
  const orbitalPlanets = PLANETS_DATA.filter((p) => p.id !== 'sun');

  const positions = orbitalPlanets.map((p) => ({
    ...p,
    degree: getPlanetDegree(p.id, simulatedDays),
  }));

  const alignments = [];

  // Check each pair for angular proximity
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const p1 = positions[i];
      const p2 = positions[j];

      let diff = Math.abs(p1.degree - p2.degree);
      if (diff > 180) diff = 360 - diff;

      if (diff <= thresholdDeg) {
        alignments.push({
          planetA: p1,
          planetB: p2,
          separationDeg: diff.toFixed(1),
          type: diff <= 10 ? 'Tight Conjunction' : 'Planetary Alignment',
        });
      }
    }
  }

  return {
    positions,
    alignments,
  };
}
