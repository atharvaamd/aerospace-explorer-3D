import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSpaceStore } from '../../store/useSpaceStore';
import { getPlanetPosition } from '../../utils/planetRegistry';

export default function CameraController({ controlsRef }) {
  const { camera } = useThree();
  const selectedPlanet = useSpaceStore((state) => state.selectedPlanet);
  const resetCameraCounter = useSpaceStore((state) => state.resetCameraCounter);
  const cameraAngleTrigger = useSpaceStore((state) => state.cameraAngleTrigger);
  const zoomTrigger = useSpaceStore((state) => state.zoomTrigger);

  const prevPlanetId = useRef(null);
  const isTransitioning = useRef(false);
  const isResetting = useRef(false);
  const targetCamPos = useRef(null);
  const prevPlanetPos = useRef(new THREE.Vector3());

  const defaultCamPos = useRef(new THREE.Vector3(0, 50, 95));
  const defaultTarget = useRef(new THREE.Vector3(0, 0, 0));

  // 1. Listen for Reset View trigger
  useEffect(() => {
    if (resetCameraCounter > 0) {
      isResetting.current = true;
      isTransitioning.current = false;
      targetCamPos.current = null;
    }
  }, [resetCameraCounter]);

  // 2. Listen for Planet Selection changes
  useEffect(() => {
    if (selectedPlanet?.id !== prevPlanetId.current) {
      prevPlanetId.current = selectedPlanet?.id || null;
      if (selectedPlanet) {
        isTransitioning.current = true;
        isResetting.current = false;
        targetCamPos.current = null;
      }
    }
  }, [selectedPlanet]);

  // 3. Listen for View Angle Presets (Top, Side, 3D Isometric)
  useEffect(() => {
    if (!cameraAngleTrigger || !controlsRef.current) return;
    const { type } = cameraAngleTrigger;
    const target = controlsRef.current.target;
    const currentDist = camera.position.distanceTo(target) || 80;

    let newPos = new THREE.Vector3();
    if (type === 'top') {
      // Top-down 90° view
      newPos.set(target.x, target.y + currentDist * 1.1, target.z + 0.001);
    } else if (type === 'side') {
      // Edge-on orbital plane view
      newPos.set(target.x, target.y + currentDist * 0.08, target.z + currentDist);
    } else if (type === 'isometric') {
      // 3D angled perspective
      newPos.set(
        target.x + currentDist * 0.65,
        target.y + currentDist * 0.55,
        target.z + currentDist * 0.65
      );
    }

    targetCamPos.current = newPos;
  }, [cameraAngleTrigger]);

  // 4. Listen for Zoom In / Zoom Out button clicks
  useEffect(() => {
    if (!zoomTrigger || !controlsRef.current) return;
    const { dir } = zoomTrigger;
    const target = controlsRef.current.target;
    const dirVec = new THREE.Vector3().subVectors(camera.position, target);
    
    // Zoom in = 0.72x distance, Zoom out = 1.35x distance
    const factor = dir > 0 ? 0.72 : 1.38;
    dirVec.multiplyScalar(factor);

    // Clamp distance between 1.5 and 450
    const newDist = Math.max(1.5, Math.min(450, dirVec.length()));
    dirVec.setLength(newDist);

    camera.position.copy(target).add(dirVec);
    controlsRef.current.update();
  }, [zoomTrigger]);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    const lerpSpeed = Math.min(delta * 4.5, 0.12);

    // A. Smoothly Transitioning to an Angle Preset
    if (targetCamPos.current) {
      camera.position.lerp(targetCamPos.current, lerpSpeed);
      controlsRef.current.update();
      if (camera.position.distanceTo(targetCamPos.current) < 0.3) {
        targetCamPos.current = null;
      }
      return;
    }

    // B. Resetting back to Solar System Overview
    if (isResetting.current) {
      controlsRef.current.target.lerp(defaultTarget.current, lerpSpeed);
      camera.position.lerp(defaultCamPos.current, lerpSpeed);
      controlsRef.current.update();

      if (
        camera.position.distanceTo(defaultCamPos.current) < 0.6 &&
        controlsRef.current.target.distanceTo(defaultTarget.current) < 0.3
      ) {
        isResetting.current = false;
      }
      return;
    }

    // C. Overview Mode (No planet selected):
    // Full unrestricted freedom for user mouse orbit, pitch, pan, and zoom!
    if (!selectedPlanet) {
      return;
    }

    // D. Focused Planet Mode:
    const currentPlanetPos = getPlanetPosition(selectedPlanet.id);
    if (!currentPlanetPos) return;

    if (isTransitioning.current) {
      // Initial smooth glide toward the newly selected body
      controlsRef.current.target.lerp(currentPlanetPos, lerpSpeed);

      const offsetDist = Math.max(selectedPlanet.size * 3.2, 3.6);
      const desiredPos = new THREE.Vector3(
        currentPlanetPos.x + offsetDist * 0.75,
        currentPlanetPos.y + offsetDist * 0.45,
        currentPlanetPos.z + offsetDist * 0.75
      );
      camera.position.lerp(desiredPos, lerpSpeed);
      controlsRef.current.update();

      if (
        controlsRef.current.target.distanceTo(currentPlanetPos) < 0.25 &&
        camera.position.distanceTo(desiredPos) < 0.5
      ) {
        isTransitioning.current = false;
        prevPlanetPos.current.copy(currentPlanetPos);
      }
    } else {
      // Continuous orbital tracking while fully allowing user mouse rotation, tilt, and zoom!
      const displacement = new THREE.Vector3().subVectors(currentPlanetPos, prevPlanetPos.current);

      camera.position.add(displacement);
      controlsRef.current.target.add(displacement);
      controlsRef.current.update();

      prevPlanetPos.current.copy(currentPlanetPos);
    }
  });

  return null;
}
