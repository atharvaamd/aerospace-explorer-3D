import React, { useMemo } from 'react';
import * as THREE from 'three';
import { getEllipticalOrbitPoints } from '../../utils/astronomy';

export default function OrbitLine({ planet, isSelected }) {
  if (!planet || planet.distanceFromSun <= 0) return null;

  const points = useMemo(() => {
    return getEllipticalOrbitPoints(planet, 240);
  }, [planet]);

  return (
    <group renderOrder={0}>
      {/* Primary Keplerian Elliptical Orbit Track (Sun at Focus) */}
      <lineLoop>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length / 3}
            array={points}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={isSelected ? '#38bdf8' : '#64748b'}
          transparent
          opacity={isSelected ? 0.95 : 0.3}
          depthWrite={false}
        />
      </lineLoop>

      {/* Luminous outer glow ribbon when selected */}
      {isSelected && (
        <lineLoop scale={[1.002, 1, 1.002]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={points.length / 3}
              array={points}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </lineLoop>
      )}
    </group>
  );
}
