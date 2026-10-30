import React from 'react';
import * as THREE from 'three';

export default function OrbitLine({ radius, isSelected }) {
  if (!radius || radius <= 0) return null;

  return (
    <mesh rotation-x={Math.PI / 2}>
      <ringGeometry args={[radius - 0.05, radius + 0.05, 128]} />
      <meshBasicMaterial
        color={isSelected ? '#38bdf8' : '#94a3b8'}
        opacity={isSelected ? 0.7 : 0.15}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
