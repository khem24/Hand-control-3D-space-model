
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { ParticleShape, HandData } from '../types';
import { PARTICLE_COUNT, LERP_SPEED, ROTATION_SPEED } from '../constants';
import { generateShapePositions } from '../utils/math';
import { audioEngine } from '../services/AudioEngine';

interface VisualizerProps {
  activeShape: ParticleShape;
  handData: HandData;
  mousePos: { x: number; y: number };
  isMouseDown: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ activeShape, handData, mousePos, isMouseDown }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const targetPositionsRef = useRef<Float32Array>(generateShapePositions(activeShape, PARTICLE_COUNT));
  
  // Track shape changes to play audio FX
  const prevShapeRef = useRef(activeShape);

  useEffect(() => {
    if (activeShape !== prevShapeRef.current) {
      targetPositionsRef.current = generateShapePositions(activeShape, PARTICLE_COUNT);
      audioEngine.triggerWhoosh();
      prevShapeRef.current = activeShape;
    }
  }, [activeShape]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Geometry
    const geometry = new THREE.BufferGeometry();
    const initialPositions = generateShapePositions(activeShape, PARTICLE_COUNT);
    geometry.setAttribute('position', new THREE.BufferAttribute(initialPositions, 3));
    
    // Colors
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const color = new THREE.Color();
      color.setHSL(Math.random(), 0.8, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Material
    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.8,
      sizeAttenuation: true
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    pointsRef.current = points;

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (pointsRef.current) {
        const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
        const targets = targetPositionsRef.current;
        
        // Interaction Logic
        const isInteracting = handData.detected || isMouseDown;
        const interactionX = handData.detected ? handData.x : mousePos.x;
        const interactionY = handData.detected ? handData.y : mousePos.y;
        const isPinching = handData.detected ? handData.pinch > 0.5 : isMouseDown;

        // Update Audio
        audioEngine.update(isPinching ? 1.0 : (isInteracting ? 0.2 : 0));

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const ix = i * 3;
          const iy = i * 3 + 1;
          const iz = i * 3 + 2;

          // Lerp to target shape
          positions[ix] += (targets[ix] - positions[ix]) * LERP_SPEED;
          positions[iy] += (targets[iy] - positions[iy]) * LERP_SPEED;
          positions[iz] += (targets[iz] - positions[iz]) * LERP_SPEED;

          // Influence from hand/mouse
          if (isInteracting) {
            const dx = interactionX - positions[ix];
            const dy = interactionY - positions[iy];
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq);

            if (isPinching) {
              // Attract
              const force = Math.max(0, (10 - dist) / 100);
              positions[ix] += dx * force;
              positions[iy] += dy * force;
            } else {
              // Gentle Swirl
              if (dist < 3) {
                positions[ix] += Math.cos(Date.now() * 0.001 + i) * 0.02;
                positions[iy] += Math.sin(Date.now() * 0.001 + i) * 0.02;
              }
            }
          }
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
        
        // Global Rotation
        pointsRef.current.rotation.y += ROTATION_SPEED;
        pointsRef.current.rotation.x += ROTATION_SPEED * 0.5;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 z-0 bg-black" />;
};

export default Visualizer;
