import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSpaceStore } from '../../store/useSpaceStore';
import { setPlanetPosition } from '../../utils/planetRegistry';
import OrbitLine from './OrbitLine';

export default function CelestialBody({ planet }) {
  const planetGroupRef = useRef();
  const meshRef = useRef();
  const moonGroupRef = useRef();
  const cloudsRef = useRef();

  // Initial random orbit offset so all planets don't start in a straight line
  const orbitAngle = useRef(
    useMemo(() => (planet.distanceFromSun === 0 ? 0 : Math.random() * Math.PI * 2), [planet.distanceFromSun])
  );

  const {
    isPaused,
    speedFactor,
    selectedPlanet,
    setSelectedPlanet,
    hoveredPlanet,
    setHoveredPlanet,
    showOrbits,
    showLabels,
    incrementDays,
    isCompareOpen,
  } = useSpaceStore();

  const isSelected = selectedPlanet?.id === planet.id;
  const isHovered = hoveredPlanet?.id === planet.id;

  useFrame((state, delta) => {
    // 1. Orbital motion
    if (!isPaused && planet.orbitalSpeed > 0) {
      orbitAngle.current += delta * planet.orbitalSpeed * speedFactor * 0.8;
      
      // If this is Earth, increment simulated Earth days
      if (planet.id === 'earth') {
        incrementDays(delta * speedFactor * 2.5);
      }
    }

    const x = Math.cos(orbitAngle.current) * planet.distanceFromSun;
    const z = Math.sin(orbitAngle.current) * planet.distanceFromSun;

    if (planetGroupRef.current) {
      planetGroupRef.current.position.set(x, 0, z);
      // Register world position for camera tracking
      setPlanetPosition(planet.id, x, 0, z);
    }

    // 2. Axial rotation
    if (!isPaused && meshRef.current && planet.rotationSpeed) {
      meshRef.current.rotation.y += delta * planet.rotationSpeed * speedFactor;
    }

    // 3. Clouds rotation (Earth)
    if (!isPaused && cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.08 * speedFactor;
    }

    // 4. Moon orbit (Earth)
    if (!isPaused && moonGroupRef.current) {
      moonGroupRef.current.rotation.y += delta * 0.5 * speedFactor;
    }
  });

  return (
    <>
      {/* 2D Orbital Trajectory */}
      {showOrbits && planet.distanceFromSun > 0 && (
        <OrbitLine radius={planet.distanceFromSun} isSelected={isSelected} />
      )}

      {/* Planet Dynamic Group */}
      <group ref={planetGroupRef}>
        {/* Planet Core Sphere */}
        <mesh
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPlanet(planet);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredPlanet(planet);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHoveredPlanet(null);
            document.body.style.cursor = 'auto';
          }}
        >
          <sphereGeometry args={[planet.size, 48, 48]} />
          {planet.id === 'sun' ? (
            <meshBasicMaterial color={planet.color} />
          ) : (
            <meshStandardMaterial
              color={planet.color}
              roughness={0.7}
              metalness={0.15}
              emissive={planet.emissiveColor}
              emissiveIntensity={0.25}
            />
          )}

          {/* Earth Clouds Layer */}
          {planet.hasClouds && (
            <mesh ref={cloudsRef}>
              <sphereGeometry args={[planet.size * 1.025, 32, 32]} />
              <meshStandardMaterial
                color="#ffffff"
                transparent
                opacity={0.35}
                roughness={1}
                depthWrite={false}
              />
            </mesh>
          )}

          {/* Saturn Rings */}
          {planet.hasRings && (
            <mesh rotation-x={Math.PI / 2.8} rotation-y={Math.PI / 12}>
              <ringGeometry args={[planet.ringInnerRadius, planet.ringOuterRadius, 64]} />
              <meshStandardMaterial
                color="#e5c185"
                opacity={0.88}
                transparent
                roughness={0.5}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}

          {/* Uranus Faint Ice Rings */}
          {planet.hasFaintRing && (
            <mesh rotation-x={Math.PI / 1.15}>
              <ringGeometry args={[planet.ringInnerRadius, planet.ringOuterRadius, 48]} />
              <meshStandardMaterial
                color="#a5f3fc"
                opacity={0.35}
                transparent
                roughness={0.8}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
        </mesh>

        {/* Sun Corona Glow Sphere */}
        {planet.id === 'sun' && (
          <>
            <mesh>
              <sphereGeometry args={[planet.size * 1.18, 32, 32]} />
              <meshBasicMaterial
                color="#ffaa00"
                transparent
                opacity={0.25}
                side={THREE.BackSide}
              />
            </mesh>
            <mesh>
              <sphereGeometry args={[planet.size * 1.35, 32, 32]} />
              <meshBasicMaterial
                color="#ff5500"
                transparent
                opacity={0.12}
                side={THREE.BackSide}
              />
            </mesh>
          </>
        )}

        {/* Earth's Moon */}
        {planet.id === 'earth' && (
          <group ref={moonGroupRef}>
            <mesh position={[2.6, 0.4, 0]}>
              <sphereGeometry args={[0.26, 24, 24]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
            </mesh>
          </group>
        )}

        {/* Selection / Target Ring */}
        {(isSelected || isHovered) && (
          <mesh rotation-x={Math.PI / 2}>
            <ringGeometry args={[planet.size * 1.4, planet.size * 1.48, 48]} />
            <meshBasicMaterial
              color={isSelected ? '#38bdf8' : '#a855f7'}
              transparent
              opacity={isSelected ? 0.9 : 0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Floating 2D HUD Label (hidden during comparison modal) */}
        {showLabels && !isCompareOpen && (
          <Html
            position={[0, planet.size + 1.2, 0]}
            center
            distanceFactor={50}
            zIndexRange={[10, 0]}
            className="pointer-events-auto"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPlanet(planet);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-200 shadow-lg border ${
                isSelected
                  ? 'bg-cyan-500/80 text-white border-cyan-300 ring-2 ring-cyan-400/50 scale-110'
                  : isHovered
                  ? 'bg-purple-600/70 text-white border-purple-400'
                  : 'bg-slate-900/75 text-slate-200 border-slate-700 hover:bg-slate-800/90'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full inline-block shadow-sm"
                style={{ backgroundColor: planet.color }}
              />
              <span className="tracking-wide">{planet.name}</span>
            </button>
          </Html>
        )}
      </group>
    </>
  );
}
