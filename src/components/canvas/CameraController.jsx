import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSpaceStore } from '../../store/useSpaceStore';
import { getPlanetPosition } from '../../utils/planetRegistry';

export default function CameraController({ controlsRef }) {
  const { camera } = useThree();
  const selectedPlanet = useSpaceStore((state) => state.selectedPlanet);
  const resetCameraCounter = useSpaceStore((state) => state.resetCameraCounter);

  const prevPlanetId = useRef(null);
  const isResetting = useRef(false);
  const defaultCamPos = useRef(new THREE.Vector3(0, 50, 90));
  const defaultTarget = useRef(new THREE.Vector3(0, 0, 0));

  // Listen for reset camera counter
  useEffect(() => {
    if (resetCameraCounter > 0) {
      isResetting.current = true;
    }
  }, [resetCameraCounter]);

  // When selected planet changes
  useEffect(() => {
    if (selectedPlanet?.id !== prevPlanetId.current) {
      prevPlanetId.current = selectedPlanet?.id || null;
      isResetting.current = false;
    }
  }, [selectedPlanet]);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    const lerpFactor = Math.min(delta * 4, 0.1);

    // 1. Handling Reset to Solar Overview
    if (isResetting.current || !selectedPlanet) {
      controlsRef.current.target.lerp(defaultTarget.current, lerpFactor);
      camera.position.lerp(defaultCamPos.current, lerpFactor);
      controlsRef.current.update();

      if (
        camera.position.distanceTo(defaultCamPos.current) < 0.5 &&
        controlsRef.current.target.distanceTo(defaultTarget.current) < 0.2
      ) {
        isResetting.current = false;
      }
      return;
    }

    // 2. Handling Selected Celestial Body Focus
    const currentPlanetPos = getPlanetPosition(selectedPlanet.id);
    if (currentPlanetPos) {
      // Lerp orbit control target to the planet center
      controlsRef.current.target.lerp(currentPlanetPos, lerpFactor);

      // Desired camera offset relative to the planet size
      const offsetDistance = Math.max(selectedPlanet.size * 3.8, 4.5);
      const desiredPos = new THREE.Vector3(
        currentPlanetPos.x + offsetDistance * 0.7,
        currentPlanetPos.y + offsetDistance * 0.5,
        currentPlanetPos.z + offsetDistance * 0.7
      );

      // Smoothly approach the planet
      camera.position.lerp(desiredPos, lerpFactor);
      controlsRef.current.update();
    }
  });

  return null;
}
