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
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(-vPosition);
    // Strictly clamp dot product to prevent any NaN values in pow()
    float dotVal = clamp(dot(normal, viewDir), -1.0, 1.0);
    float edge = clamp(1.0 - abs(dotVal), 0.0, 1.0);
    float intensity = pow(edge, uPower);
    gl_FragColor = vec4(uColor, clamp(intensity * 0.7, 0.0, 1.0));
  }
`;

export default function AtmosphereGlow({ radius, color = '#38bdf8', power = 3.2, scale = 1.15 }) {
  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Color(color) },
    uPower: { value: power },
  }), [color, power]);

  return (
    <mesh scale={[scale, scale, scale]} renderOrder={10}>
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
