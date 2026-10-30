import * as THREE from 'three';

// Map of planetId -> THREE.Vector3 current world position
export const planetPositions = new Map();

export function setPlanetPosition(id, x, y, z) {
  let pos = planetPositions.get(id);
  if (!pos) {
    pos = new THREE.Vector3(x, y, z);
    planetPositions.set(id, pos);
  } else {
    pos.set(x, y, z);
  }
}

export function getPlanetPosition(id) {
  return planetPositions.get(id) || null;
}
