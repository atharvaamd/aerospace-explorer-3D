import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSpaceStore } from '../../store/useSpaceStore';
import { setPlanetPosition } from '../../utils/planetRegistry';
import OrbitLine from './OrbitLine';
import AtmosphereGlow from './AtmosphereGlow';
import {
  getSunTexture,
  getMercuryTexture,
  getMercuryBump,
  getVenusTexture,
  getEarthTexture,
  getEarthNightTexture,
  getEarthCloudsTexture,
  getMoonTexture,
  getMarsTexture,
  getJupiterTexture,
  getSaturnTexture,
  getSaturnRingTexture,
  getUranusTexture,
  getNeptuneTexture,
} from '../../utils/textureGenerator';

export default function CelestialBody({ planet }) {
  const planetOrbitGroupRef = useRef();
  const tiltGroupRef = useRef();
  const meshRef = useRef();
  const moonGroupRef = useRef();
  const cloudsRef = useRef();
  const innerCoronaRef = useRef();
  const outerCoronaRef = useRef();

  // Initial random orbit offset so planets don't start in a straight line
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

  // Retrieve procedural photorealistic textures
  const textures = useMemo(() => {
    switch (planet.id) {
      case 'sun':
        return { map: getSunTexture() };
      case 'mercury':
        return { map: getMercuryTexture(), bump: getMercuryBump() };
      case 'venus':
        return { map: getVenusTexture() };
      case 'earth':
        return {
          map: getEarthTexture(),
          night: getEarthNightTexture(),
          clouds: getEarthCloudsTexture(),
          moon: getMoonTexture(),
        };
      case 'mars':
        return { map: getMarsTexture() };
      case 'jupiter':
        return { map: getJupiterTexture() };
      case 'saturn':
        return {
          map: getSaturnTexture(),
          ring: getSaturnRingTexture(),
        };
      case 'uranus':
        return { map: getUranusTexture() };
      case 'neptune':
        return { map: getNeptuneTexture() };
      default:
        return {};
    }
  }, [planet.id]);

  const axialTiltRad = useMemo(() => {
    return THREE.MathUtils.degToRad(planet.axialTilt || 0);
  }, [planet.axialTilt]);

  useFrame((state, delta) => {
    // 1. Orbital motion around Sun
    if (!isPaused && planet.orbitalSpeed > 0) {
      orbitAngle.current += delta * planet.orbitalSpeed * speedFactor * 0.8;

      if (planet.id === 'earth') {
        incrementDays(delta * speedFactor * 2.5);
      }
    }

    const x = Math.cos(orbitAngle.current) * planet.distanceFromSun;
    const z = Math.sin(orbitAngle.current) * planet.distanceFromSun;

    if (planetOrbitGroupRef.current) {
      planetOrbitGroupRef.current.position.set(x, 0, z);
      setPlanetPosition(planet.id, x, 0, z);
    }

    // 2. Axial rotation
    if (!isPaused && meshRef.current && planet.rotationSpeed) {
      meshRef.current.rotation.y += delta * planet.rotationSpeed * speedFactor;
    }

    // 3. Earth Clouds differential rotation
    if (!isPaused && cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * (planet.rotationSpeed * 1.15) * speedFactor;
    }

    // 4. Moon orbit around Earth
    if (!isPaused && moonGroupRef.current) {
      moonGroupRef.current.rotation.y += delta * 0.45 * speedFactor;
    }

    // 5. Sun pulsating corona animation
    if (planet.id === 'sun' && innerCoronaRef.current && outerCoronaRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2.5) * 0.035;
      innerCoronaRef.current.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
      outerCoronaRef.current.scale.set(1 - pulse * 0.7, 1 - pulse * 0.7, 1 - pulse * 0.7);
    }
  });

  return (
    <>
      {/* 2D Orbital Trajectory Track */}
      {showOrbits && planet.distanceFromSun > 0 && (
        <OrbitLine radius={planet.distanceFromSun} isSelected={isSelected} />
      )}

      {/* Planet Dynamic Orbit Group */}
      <group ref={planetOrbitGroupRef}>
        
        {/* Axial Tilt Group: Tilts the planet and its rings on their true scientific axis */}
        <group ref={tiltGroupRef} rotation={[0, 0, axialTiltRad]}>
          
          {/* Main Planet Sphere */}
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
            <sphereGeometry args={[planet.size, 64, 64]} />

            {planet.id === 'sun' ? (
              // Sun emitting fiery plasma material
              <meshBasicMaterial
                map={textures.map}
                color="#ffffff"
              />
            ) : planet.id === 'earth' ? (
              // Earth with Day map, Mountain bump, and Night city lights
              <meshStandardMaterial
                map={textures.map}
                roughness={0.65}
                metalness={0.12}
                emissiveMap={textures.night}
                emissive={new THREE.Color('#ffdf99')}
                emissiveIntensity={0.7}
              />
            ) : planet.bumpScale && textures.bump ? (
              // Terrestrial planet with surface bump (Mercury, Mars)
              <meshStandardMaterial
                map={textures.map}
                bumpMap={textures.bump}
                bumpScale={planet.bumpScale}
                roughness={0.8}
                metalness={0.1}
              />
            ) : (
              // Gas / Ice Giants (Venus, Jupiter, Saturn, Uranus, Neptune)
              <meshStandardMaterial
                map={textures.map}
                roughness={0.6}
                metalness={0.08}
              />
            )}

            {/* Earth Rotating Clouds Layer */}
            {planet.id === 'earth' && textures.clouds && (
              <mesh ref={cloudsRef}>
                <sphereGeometry args={[planet.size * 1.022, 48, 48]} />
                <meshStandardMaterial
                  map={textures.clouds}
                  transparent
                  opacity={0.55}
                  roughness={1}
                  depthWrite={false}
                />
              </mesh>
            )}

            {/* Saturn Rings with Cassini Division */}
            {planet.hasRings && textures.ring && (
              <mesh rotation-x={Math.PI / 2}>
                <ringGeometry args={[planet.ringInnerRadius, planet.ringOuterRadius, 128]} />
                <meshStandardMaterial
                  map={textures.ring}
                  transparent
                  roughness={0.4}
                  metalness={0.1}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}

            {/* Uranus Ice Ring */}
            {planet.hasFaintRing && (
              <mesh rotation-x={Math.PI / 2}>
                <ringGeometry args={[planet.ringInnerRadius, planet.ringOuterRadius, 64]} />
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

          {/* Atmospheric Fresnel Limb Glow */}
          {planet.atmosphereGlow && (
            <AtmosphereGlow
              radius={planet.size}
              color={planet.atmosphereGlow}
              power={planet.id === 'earth' ? 3.0 : 3.5}
              scale={planet.id === 'earth' ? 1.15 : 1.12}
            />
          )}

          {/* Sun Multi-Layer Radiant Corona */}
          {planet.id === 'sun' && (
            <>
              {/* Inner golden flare corona */}
              <mesh ref={innerCoronaRef}>
                <sphereGeometry args={[planet.size * 1.14, 32, 32]} />
                <meshBasicMaterial
                  color="#ffaa00"
                  transparent
                  opacity={0.32}
                  blending={THREE.AdditiveBlending}
                  side={THREE.BackSide}
                  depthWrite={false}
                />
              </mesh>

              {/* Mid orange radiant corona */}
              <mesh ref={outerCoronaRef}>
                <sphereGeometry args={[planet.size * 1.32, 32, 32]} />
                <meshBasicMaterial
                  color="#ff5500"
                  transparent
                  opacity={0.18}
                  blending={THREE.AdditiveBlending}
                  side={THREE.BackSide}
                  depthWrite={false}
                />
              </mesh>

              {/* Outer soft solar wind aura */}
              <mesh>
                <sphereGeometry args={[planet.size * 1.6, 32, 32]} />
                <meshBasicMaterial
                  color="#cc2200"
                  transparent
                  opacity={0.08}
                  blending={THREE.AdditiveBlending}
                  side={THREE.BackSide}
                  depthWrite={false}
                />
              </mesh>
            </>
          )}

          {/* Earth Moon with cratered surface */}
          {planet.id === 'earth' && (
            <group ref={moonGroupRef}>
              <mesh position={[2.7, 0.4, 0]}>
                <sphereGeometry args={[0.27, 24, 24]} />
                <meshStandardMaterial
                  map={textures.moon}
                  roughness={0.9}
                  metalness={0.05}
                />
              </mesh>
            </group>
          )}
        </group>

        {/* 3D Targeting / Selection Reticle */}
        {(isSelected || isHovered) && (
          <mesh rotation-x={Math.PI / 2}>
            <ringGeometry args={[planet.size * 1.45, planet.size * 1.54, 64]} />
            <meshBasicMaterial
              color={isSelected ? '#38bdf8' : '#c084fc'}
              transparent
              opacity={isSelected ? 0.95 : 0.65}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Floating 2D HUD Billboard Label */}
        {showLabels && !isCompareOpen && (
          <Html
            position={[0, planet.size + 1.35, 0]}
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
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-200 shadow-xl border ${
                isSelected
                  ? 'bg-cyan-500/90 text-white border-cyan-300 ring-2 ring-cyan-400/50 scale-110'
                  : isHovered
                  ? 'bg-purple-600/80 text-white border-purple-400'
                  : 'bg-slate-900/80 text-slate-200 border-slate-700/80 hover:bg-slate-800'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full inline-block shadow-sm"
                style={{ backgroundColor: planet.color }}
              />
              <span className="tracking-wide font-medium">{planet.name}</span>
            </button>
          </Html>
        )}
      </group>
    </>
  );
}
