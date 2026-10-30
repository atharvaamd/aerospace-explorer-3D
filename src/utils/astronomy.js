import { PLANETS_DATA } from '../data/planets';

// Baseline reference epoch: Jan 1, 2026, 00:00:00 UTC
export const BASE_EPOCH = new Date('2026-01-01T00:00:00Z').getTime();

// Base mean anomalies M_0 (in radians) at baseline epoch
export const PLANET_BASE_MEAN_ANOMALY = {
  sun: 0,
  mercury: 0.45,
  venus: 1.82,
  earth: 0.0,
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

// Solve Kepler's Equation M = E - e * sin(E) using Newton-Raphson iteration
export function solveKepler(M, e) {
  // Normalize M to [0, 2pi]
  let m = M % (Math.PI * 2);
  if (m < 0) m += Math.PI * 2;

  let E = m;
  for (let i = 0; i < 5; i++) {
    const delta = (E - e * Math.sin(E) - m) / (1 - e * Math.cos(E));
    E -= delta;
    if (Math.abs(delta) < 1e-6) break;
  }
  return E;
}

// Compute exact Keplerian elliptical 3D coordinates (with Sun at one focus at 0,0,0)
export function getEllipticalCoordinates(planet, simulatedDays) {
  if (!planet || planet.distanceFromSun <= 0 || planet.orbitalPeriod <= 0) {
    return { x: 0, z: 0, distanceToSun: 0, trueAnomaly: 0, angleRad: 0 };
  }

  const a = planet.distanceFromSun;
  const e = planet.eccentricity || 0;
  const b = a * Math.sqrt(Math.max(0.001, 1 - e * e));
  const omega = planet.perihelionAngle || 0;

  // Mean anomaly M = M_0 + (2pi / T) * t
  const m0 = PLANET_BASE_MEAN_ANOMALY[planet.id] || 0;
  const meanAnomaly = m0 + ((Math.PI * 2) / planet.orbitalPeriod) * simulatedDays;

  // Eccentric anomaly E
  const E = solveKepler(meanAnomaly, e);

  // Position in ellipse coordinates where Sun is at the origin focus (0, 0)
  // Shifted by -a*e along perihelion axis
  const xPrime = a * (Math.cos(E) - e);
  const zPrime = b * Math.sin(E);

  // Rotate by argument of perihelion (omega)
  const cosOmega = Math.cos(omega);
  const sinOmega = Math.sin(omega);
  const x = xPrime * cosOmega - zPrime * sinOmega;
  const z = xPrime * sinOmega + zPrime * cosOmega;

  const currentDist = Math.hypot(x, z);
  const trueAnomaly = Math.atan2(z, x);

  return {
    x,
    z,
    distanceToSun: currentDist,
    trueAnomaly,
    angleRad: (trueAnomaly + Math.PI * 2) % (Math.PI * 2),
  };
}

// Generate an array of 3D points forming the complete elliptical orbit trajectory (Sun at focus)
export function getEllipticalOrbitPoints(planet, segments = 180) {
  if (!planet || planet.distanceFromSun <= 0) return [];

  const a = planet.distanceFromSun;
  const e = planet.eccentricity || 0;
  const b = a * Math.sqrt(Math.max(0.001, 1 - e * e));
  const omega = planet.perihelionAngle || 0;

  const cosOmega = Math.cos(omega);
  const sinOmega = Math.sin(omega);

  const points = [];
  for (let i = 0; i <= segments; i++) {
    const phi = (i / segments) * Math.PI * 2;
    const xPrime = a * (Math.cos(phi) - e);
    const zPrime = b * Math.sin(phi);

    const x = xPrime * cosOmega - zPrime * sinOmega;
    const z = xPrime * sinOmega + zPrime * cosOmega;

    points.push(x, 0, z);
  }

  return new Float32Array(points);
}

// Get the current orbital angle in degrees (0 to 360)
export function getPlanetDegree(planetId, simulatedDays) {
  const planet = PLANETS_DATA.find((p) => p.id === planetId);
  if (!planet) return 0;
  const coords = getEllipticalCoordinates(planet, simulatedDays);
  let deg = (coords.angleRad * 180) / Math.PI;
  if (deg < 0) deg += 360;
  return deg % 360;
}

// Detect planetary conjunctions and alignments within a threshold (default 22 degrees)
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
