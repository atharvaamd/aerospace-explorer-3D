import React from 'react';
import * as THREE from 'three';

export default function OrbitLine({ radius, isSelected }) {
  if (!radius || radius <= 0) return null;

  // Adaptive ring thickness proportional to distance
  const halfWidth = Math.max(0.04, radius * 0.0016);

  return (
    <group rotation-x={Math.PI / 2}>
      {/* Primary Orbit Trajectory */}
      <mesh>
        <ringGeometry args={[radius - halfWidth, radius + halfWidth, 180]} />
        <meshBasicMaterial
          color={isSelected ? '#38bdf8' : '#475569'}
          opacity={isSelected ? 0.85 : 0.22}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Radiant glow ribbon when selected */}
      {isSelected && (
        <mesh>
          <ringGeometry args={[radius - halfWidth * 4.5, radius + halfWidth * 4.5, 180]} />
          <meshBasicMaterial
            color="#38bdf8"
            opacity={0.2}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
