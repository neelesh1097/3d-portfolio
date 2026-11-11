import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { liveCar } from '../store/liveTelemetry';
import { DEVELOPER_TOKENS } from '../data/portfolio';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

const PICKUP_RADIUS_SQ = 2.5 * 2.5;

export const Collectibles: React.FC = React.memo(() => {
  const collectedTokens = useStore((state) => state.collectedTokens);
  const collectToken = useStore((state) => state.collectToken);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const t = state.clock.elapsedTime;
    const children = groupRef.current.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      child.rotation.y += delta * 1.6;
      child.position.y = 1.2 + Math.sin(t * 3 + i) * 0.22;
    }

    for (let i = 0; i < DEVELOPER_TOKENS.length; i++) {
      const token = DEVELOPER_TOKENS[i];
      if (collectedTokens[token.id]) continue;
      const dx = liveCar.x - token.position[0];
      const dz = liveCar.z - token.position[2];
      if (dx * dx + dz * dz < PICKUP_RADIUS_SQ) {
        collectToken(token.id);
        soundManager.playCollect();
        confetti({
          particleCount: 24,
          spread: 45,
          origin: { y: 0.6 },
          colors: [token.color, '#ffffff', '#38bdf8'],
        });
      }
    }
  });

  return (
    <group ref={groupRef}>
      {DEVELOPER_TOKENS.map((token) => {
        if (collectedTokens[token.id]) return null;

        return (
          <group key={token.id} position={token.position}>
            <mesh>
              <octahedronGeometry args={[0.58, 0]} />
              <meshStandardMaterial
                color={token.color}
                emissive={token.color}
                emissiveIntensity={0.65}
                metalness={0.35}
                roughness={0.2}
              />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.82, 0.055, 6, 18]} />
              <meshBasicMaterial color={token.color} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
});
