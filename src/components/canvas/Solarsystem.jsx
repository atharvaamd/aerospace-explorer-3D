import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import CelestialBody from './CelestialBody';
import CameraController from './CameraController';
import { PLANETS_DATA } from '../../data/planets';
import { useSpaceStore } from '../../store/useSpaceStore';
import { getNebulaTexture } from '../../utils/textureGenerator';

// Dynamic, slowly rotating Asteroid Belt with 2,000 irregular particles
function AsteroidBelt() {
  const beltRef = useRef();
  const speedFactor = useSpaceStore((state) => state.speedFactor);
  const isPaused = useSpaceStore((state) => state.isPaused);

  const { positions, colors } = useMemo(() => {
    const coords = [];
    const colorArr = [];
    const colorPalette = [
      new THREE.Color('#55504a'), // Carbonaceous dark rock
      new THREE.Color('#8c7f70'), // Silicate stony grey-tan
      new THREE.Color('#c2b29f'), // Bright metallic silicate
      new THREE.Color('#403933'), // Basaltic mineral
    ];

    const beltSemiMajor = 33.5;
    const beltEccentricity = 0.06;

    for (let i = 0; i < 2000; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spread = (Math.random() - 0.5) * 3.5;
      const a = beltSemiMajor + spread;
      const b = a * Math.sqrt(1 - beltEccentricity * beltEccentricity);

      // Elliptical coordinates with focal Sun offset
      const x = a * (Math.cos(angle) - beltEccentricity);
      const z = b * Math.sin(angle);
      const y = (Math.random() - 0.5) * 1.6;
      coords.push(x, y, z);

      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colorArr.push(col.r, col.g, col.b);
    }

    return {
      positions: new Float32Array(coords),
      colors: new Float32Array(colorArr),
    };
  }, []);

  useFrame((_, delta) => {
    if (!isPaused && beltRef.current) {
      beltRef.current.rotation.y += delta * 0.006 * speedFactor;
    }
  });

  return (
    <points ref={beltRef} renderOrder={1}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.17}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

// Deep Space Cosmic Nebula Sphere (Drawn first at renderOrder 0)
function CosmicNebula() {
  const nebulaTexture = useMemo(() => getNebulaTexture(), []);
  return (
    <mesh renderOrder={0}>
      <sphereGeometry args={[480, 32, 32]} />
      <meshBasicMaterial
        map={nebulaTexture}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// Master simulation timeline clock
function SimulationClock() {
  const isPaused = useSpaceStore((state) => state.isPaused);
  const speedFactor = useSpaceStore((state) => state.speedFactor);
  const incrementDays = useSpaceStore((state) => state.incrementDays);

  useFrame((_, delta) => {
    if (!isPaused) {
      // 1 real second = 12 simulated Earth days at 1x speed
      incrementDays(delta * speedFactor * 12);
    }
  });

  return null;
}

export default function Solarsystem() {
  const controlsRef = useRef();
  const resetView = useSpaceStore((state) => state.resetView);

  return (
    <div className="w-full h-full absolute inset-0 bg-[#030712]">
      <Canvas
        camera={{ position: [0, 50, 90], fov: 50, near: 0.1, far: 1200 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        onPointerMissed={(e) => {
          if (e.detail === 2) {
            resetView();
          }
        }}
      >
        {/* Soft cosmic fill light */}
        <ambientLight intensity={0.28} />

        {/* Primary Sun point light emitting outward from (0,0,0) */}
        <pointLight
          position={[0, 0, 0]}
          intensity={8.5}
          distance={500}
          decay={0.12}
          color="#fffcf2"
        />

        {/* Secondary soft solar fill */}
        <pointLight
          position={[0, 0, 0]}
          intensity={3}
          distance={200}
          decay={0}
          color="#ffeedd"
        />

        {/* Orbit and Camera Controls */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enablePan
          enableZoom
          enableRotate
          enableDamping
          dampingFactor={0.07}
          minDistance={1.0}
          maxDistance={600}
        />

        {/* Dynamic camera focusing logic */}
        <CameraController controlsRef={controlsRef} />

        {/* Master simulation timeline clock */}
        <SimulationClock />

        {/* Deep space cosmic nebula backdrop */}
        <CosmicNebula />

        {/* Foreground glittering outer space starfield */}
        <Stars
          radius={350}
          depth={80}
          count={7500}
          factor={6}
          saturation={0.1}
          fade
          speed={0.4}
        />

        {/* Realistic orbiting Asteroid Belt */}
        <AsteroidBelt />

        {/* Render all celestial bodies with photorealistic textures */}
        {PLANETS_DATA.map((planet) => (
          <CelestialBody key={planet.id} planet={planet} />
        ))}

        {/* Post-processing Bloom for glowing sun & selection reticles */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.55}
            luminanceSmoothing={0.75}
            intensity={1.25}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
