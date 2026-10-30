import React, { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import CelestialBody from './CelestialBody';
import CameraController from './CameraController';
import { PLANETS_DATA } from '../../data/planets';
import { useSpaceStore } from '../../store/useSpaceStore';

function AsteroidBelt() {
  const points = useMemo(() => {
    const coords = [];
    for (let i = 0; i < 750; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 27.5 + Math.random() * 3.8;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      const y = (Math.random() - 0.5) * 1.6;
      coords.push(x, y, z);
    }
    return new Float32Array(coords);
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        color="#a1a1aa"
        transparent
        opacity={0.65}
        sizeAttenuation
      />
    </points>
  );
}

export default function Solarsystem() {
  const controlsRef = useRef();
  const resetView = useSpaceStore((state) => state.resetView);

  return (
    <div className="w-full h-full absolute inset-0 bg-[#030712]">
      <Canvas
        camera={{ position: [0, 50, 90], fov: 50, near: 0.1, far: 1000 }}
        onPointerMissed={(e) => {
          // If clicked empty space, do not abruptly clear unless double click
          if (e.detail === 2) {
            resetView();
          }
        }}
      >
        {/* Ambient illumination */}
        <ambientLight intensity={0.22} />

        {/* Sun central point light */}
        <pointLight
          position={[0, 0, 0]}
          intensity={5}
          distance={400}
          decay={0}
          color="#fffaed"
        />

        {/* Orbit and Camera Controls */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enablePan
          enableZoom
          enableRotate
          dampingFactor={0.06}
          minDistance={3}
          maxDistance={320}
        />

        {/* Dynamic camera focusing logic */}
        <CameraController controlsRef={controlsRef} />

        {/* Outer space starfield */}
        <Stars
          radius={300}
          depth={70}
          count={8000}
          factor={7}
          saturation={0}
          fade
          speed={0.5}
        />

        {/* Main asteroid belt between Mars & Jupiter */}
        <AsteroidBelt />

        {/* Render all celestial bodies */}
        {PLANETS_DATA.map((planet) => (
          <CelestialBody key={planet.id} planet={planet} />
        ))}

        {/* Post-processing Bloom for glowing sun & selection highlights */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.5}
            luminanceSmoothing={0.8}
            intensity={1.1}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
