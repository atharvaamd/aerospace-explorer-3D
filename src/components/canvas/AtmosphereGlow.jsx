import React, { useMemo } from 'react';
import * as THREE from 'three';

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  uniform float uPower;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vec3 viewDir = normalize(-vPosition);
    // Limb edge scattering
    float edge = 1.0 - abs(dot(vNormal, viewDir));
    float intensity = pow(edge, uPower);
    gl_FragColor = vec4(uColor, intensity * 0.9);
  }
`;

export default function AtmosphereGlow({ radius, color = '#38bdf8', power = 3.2, scale = 1.16 }) {
  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Color(color) },
    uPower: { value: power },
  }), [color, power]);

  return (
    <mesh scale={[scale, scale, scale]}>
      <sphereGeometry args={[radius, 32, 32]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
