import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { COLLECTIBLES } from '../data/portfolio';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

export const Collectibles: React.FC = () => {
  const carPosition = useStore((state) => state.carPosition);
  const collectibles = useStore((state) => state.collectibles);
  const collectItem = useStore((state) => state.collectItem);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Bobbing & rotating crystals
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      child.rotation.y += delta * 1.5;
      child.position.y = COLLECTIBLES[i].position[1] + Math.sin(t * 3 + i) * 0.25;
    });

    // Check distance between car and uncollected crystals
    const carPos = new THREE.Vector3(...carPosition);
    COLLECTIBLES.forEach((c) => {
      if (!collectibles[c.id]) {
        const crystalPos = new THREE.Vector3(...c.position);
        if (carPos.distanceTo(crystalPos) < 2.5) {
          collectItem(c.id);
          soundManager.playCollect();
          confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.6 },
            colors: [c.color, '#ffffff', '#38bdf8'],
          });
        }
      }
    });
  });

  return (
    <group ref={groupRef}>
      {COLLECTIBLES.map((c) => {
        const isCollected = collectibles[c.id];
        if (isCollected) return null;

        return (
          <group key={c.id} position={c.position}>
            {/* Glowing Octahedron Crystal */}
            <mesh castShadow>
              <octahedronGeometry args={[0.6, 0]} />
              <meshStandardMaterial
                color={c.color}
                emissive={c.color}
                emissiveIntensity={0.8}
                metalness={0.2}
                roughness={0.1}
              />
            </mesh>
            {/* Outer wireframe shell */}
            <mesh scale={[1.3, 1.3, 1.3]}>
              <octahedronGeometry args={[0.6, 0]} />
              <meshBasicMaterial color={c.color} wireframe transparent opacity={0.6} />
            </mesh>
            {/* Radial glow light */}
            <pointLight color={c.color} intensity={2.5} distance={5} />
          </group>
        );
      })}
    </group>
  );
};
