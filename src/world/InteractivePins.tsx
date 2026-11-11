import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { soundManager } from '../utils/audio';

interface PinState {
  id: number;
  initialPos: [number, number, number];
  pos: [number, number, number];
  rot: [number, number, number];
  isFallen: boolean;
  velocity: THREE.Vector3;
}

export const InteractivePins: React.FC = () => {
  const carPosition = useStore((state) => state.carPosition);
  const unlockAchievement = useStore((state) => state.unlockAchievement);

  // 6 Bowling Pins placed in triangle formation at [22, 0, -5]
  const baseCenter = [22, 0, -5];
  const [pins, setPins] = useState<PinState[]>(() => {
    const list: PinState[] = [];
    const offsets: [number, number][] = [
      [0, 0],
      [-0.6, -1.0], [0.6, -1.0],
      [-1.2, -2.0], [0, -2.0], [1.2, -2.0]
    ];
    offsets.forEach(([dx, dz], idx) => {
      const pos: [number, number, number] = [baseCenter[0] + dx, 0.6, baseCenter[2] + dz];
      list.push({
        id: idx,
        initialPos: pos,
        pos: [...pos],
        rot: [0, 0, 0],
        isFallen: false,
        velocity: new THREE.Vector3(),
      });
    });
    return list;
  });

  const pinRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame((_, delta) => {
    const carPos = new THREE.Vector3(...carPosition);

    pins.forEach((pin, idx) => {
      const currentMesh = pinRefs.current[idx];
      if (!currentMesh) return;

      if (!pin.isFallen) {
        const pinPos = new THREE.Vector3(...pin.pos);
        if (carPos.distanceTo(pinPos) < 1.6) {
          // Knock down pin!
          pin.isFallen = true;
          const hitDir = new THREE.Vector3().subVectors(pinPos, carPos).normalize();
          pin.velocity.set(hitDir.x * 4, 2, hitDir.z * 4);
          soundManager.playClick();
          unlockAchievement('pin_striker');
        }
      } else {
        // Simple pin physics tumble
        pin.pos[0] += pin.velocity.x * delta;
        pin.pos[2] += pin.velocity.z * delta;
        pin.rot[0] = THREE.MathUtils.lerp(pin.rot[0], Math.PI / 2, 0.15);
        pin.rot[2] = THREE.MathUtils.lerp(pin.rot[2], Math.PI / 4, 0.15);
        pin.velocity.multiplyScalar(0.92);

        currentMesh.position.set(pin.pos[0], pin.pos[1], pin.pos[2]);
        currentMesh.rotation.set(pin.rot[0], pin.rot[1], pin.rot[2]);
      }
    });
  });

  return (
    <group>
      {pins.map((pin, idx) => (
        <group
          key={`pin-${pin.id}`}
          ref={(el) => (pinRefs.current[idx] = el)}
          position={pin.initialPos}
        >
          {/* Bowling Pin Mesh */}
          <mesh castShadow>
            <cylinderGeometry args={[0.18, 0.28, 1.2, 16]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
          {/* Red Stripes on Neck */}
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.08, 16]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      ))}
    </group>
  );
};
