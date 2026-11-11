import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { liveCar } from '../store/liveTelemetry';
import { soundManager } from '../utils/audio';

interface PinState {
  id: number;
  initialPos: [number, number, number];
  pos: [number, number, number];
  rot: [number, number, number];
  isFallen: boolean;
  vx: number;
  vz: number;
}

const PIN_HIT_RADIUS_SQ = 1.65 * 1.65;

export const InteractivePins: React.FC = React.memo(() => {
  const unlockAchievement = useStore((state) => state.unlockAchievement);

  const pinsRef = useRef<PinState[]>([
    [0, 0],
    [-0.6, -1.0],
    [0.6, -1.0],
    [-1.2, -2.0],
    [0, -2.0],
    [1.2, -2.0],
  ].map(([dx, dz], idx) => {
    const pos: [number, number, number] = [10 + dx, 0.6, 10 + dz];
    return {
      id: idx,
      initialPos: pos,
      pos: [...pos] as [number, number, number],
      rot: [0, 0, 0] as [number, number, number],
      isFallen: false,
      vx: 0,
      vz: 0,
    };
  }));

  const pinMeshRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame((_, delta) => {
    const pins = pinsRef.current;
    for (let idx = 0; idx < pins.length; idx++) {
      const pin = pins[idx];
      const currentMesh = pinMeshRefs.current[idx];
      if (!currentMesh) continue;

      if (!pin.isFallen) {
        const dx = pin.pos[0] - liveCar.x;
        const dz = pin.pos[2] - liveCar.z;
        const distSq = dx * dx + dz * dz;
        if (distSq < PIN_HIT_RADIUS_SQ && distSq > 0.0001) {
          pin.isFallen = true;
          const invLen = 1 / Math.sqrt(distSq);
          pin.vx = dx * invLen * 4.5;
          pin.vz = dz * invLen * 4.5;
          soundManager.playClick();
          unlockAchievement('pin_striker');
        }
      } else if (pin.vx * pin.vx + pin.vz * pin.vz > 0.005 || pin.rot[0] < Math.PI / 2 - 0.05) {
        pin.pos[0] += pin.vx * delta;
        pin.pos[2] += pin.vz * delta;
        pin.rot[0] = THREE.MathUtils.lerp(pin.rot[0], Math.PI / 2, 0.15);
        pin.rot[2] = THREE.MathUtils.lerp(pin.rot[2], Math.PI / 4, 0.15);
        pin.vx *= 0.92;
        pin.vz *= 0.92;

        currentMesh.position.set(pin.pos[0], pin.pos[1], pin.pos[2]);
        currentMesh.rotation.set(pin.rot[0], pin.rot[1], pin.rot[2]);
      }
    }
  });

  return (
    <group>
      {pinsRef.current.map((pin, idx) => (
        <group
          key={`pin-${pin.id}`}
          ref={(el) => (pinMeshRefs.current[idx] = el)}
          position={pin.initialPos}
        >
          <mesh>
            <cylinderGeometry args={[0.18, 0.28, 1.2, 10]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.08, 10]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      ))}
    </group>
  );
});
