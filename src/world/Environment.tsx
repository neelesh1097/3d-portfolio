import React, { useMemo } from 'react';
import * as THREE from 'three';

// Low-poly decorative tree component
const Tree: React.FC<{ position: [number, number, number]; scale?: number }> = ({ position, scale = 1 }) => {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.35, 1.6, 6]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      {/* Foliage Cone 1 */}
      <mesh position={[0, 2.0, 0]} castShadow>
        <coneGeometry args={[1.5, 1.8, 6]} />
        <meshStandardMaterial color="#10b981" roughness={0.7} flatShading />
      </mesh>
      {/* Foliage Cone 2 */}
      <mesh position={[0, 2.9, 0]} castShadow>
        <coneGeometry args={[1.1, 1.4, 6]} />
        <meshStandardMaterial color="#34d399" roughness={0.7} flatShading />
      </mesh>
    </group>
  );
};

// Jump Ramp for Stunt Airtime
const StuntRamp: React.FC<{ position: [number, number, number]; rotationY?: number }> = ({ position, rotationY = 0 }) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Slanted Ramp Wedge */}
      <mesh position={[0, 0.6, 0]} rotation={[0.25, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.5, 0.25, 4.0]} />
        <meshStandardMaterial color="#334155" roughness={0.5} />
      </mesh>
      {/* Yellow Neon Warning Stripes */}
      <mesh position={[0, 0.75, -1.2]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[4.2, 0.05, 0.4]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>
      {/* Side support rails */}
      <mesh position={[-2.2, 0.7, 0]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[0.2, 0.5, 4.0]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
      <mesh position={[2.2, 0.7, 0]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[0.2, 0.5, 4.0]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
    </group>
  );
};

export const Environment: React.FC = () => {
  // Generate random tree positions away from roads
  const trees = useMemo(() => {
    const list: Array<{ pos: [number, number, number]; s: number }> = [];
    const seedPositions: [number, number][] = [
      [-20, -15], [-25, -20], [-15, -35], [-30, -5],
      [20, -15], [25, -20], [15, -35], [30, -5],
      [-20, 15], [-25, 20], [-15, 35], [-30, 5],
      [20, 15], [25, 20], [15, 35], [30, 5],
      [-50, -10], [-55, 10], [50, -10], [55, 10],
      [0, -85], [-15, -80], [15, -80],
      [-10, 75], [10, 75]
    ];

    seedPositions.forEach(([x, z], i) => {
      list.push({ pos: [x, 0, z], s: 0.8 + (i % 5) * 0.15 });
      list.push({ pos: [x + 3.5, 0, z - 2.5], s: 0.7 + (i % 3) * 0.2 });
    });
    return list;
  }, []);

  return (
    <>
      {/* Environmental Fog for depth and atmosphere */}
      <fog attach="fog" args={['#090d16', 30, 120]} />

      {/* Main Directional Sun */}
      <directionalLight
        position={[25, 45, 25]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={120}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        color="#ffffff"
      />

      {/* Soft Ambient Fill */}
      <ambientLight intensity={0.65} color="#cbd5e1" />

      {/* Subtle Blue Rim Light from Opposite Side */}
      <directionalLight position={[-25, 20, -25]} intensity={0.8} color="#38bdf8" />

      {/* Main Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200, 32, 32]} />
        <meshStandardMaterial color="#0f172a" roughness={0.85} metalness={0.1} />
      </mesh>

      {/* Grid Floor Lines (Cyber Aesthetics) */}
      <gridHelper args={[180, 45, '#38bdf8', '#1e293b']} position={[0, 0.02, 0]} />

      {/* Central Plaza Roundabout Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[11.5, 13, 48]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[11, 48]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>

      {/* Main Highway Avenues (Road Network) */}
      {/* North Avenue: Plaza -> Project Arena */}
      <mesh position={[0, 0.04, -30]} receiveShadow>
        <boxGeometry args={[7, 0.02, 45]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
      {/* Road Center Dash Lines (North) */}
      {[-15, -23, -31, -39, -47].map((z, i) => (
        <mesh key={`dash-n-${i}`} position={[0, 0.06, z]}>
          <boxGeometry args={[0.35, 0.02, 4.5]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      ))}

      {/* South Avenue: Plaza -> Comms Station */}
      <mesh position={[0, 0.04, 30]} receiveShadow>
        <boxGeometry args={[7, 0.02, 45]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
      {[15, 23, 31, 39, 47].map((z, i) => (
        <mesh key={`dash-s-${i}`} position={[0, 0.06, z]}>
          <boxGeometry args={[0.35, 0.02, 4.5]} />
          <meshBasicMaterial color="#ec4899" />
        </mesh>
      ))}

      {/* East-West Highway */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[90, 0.02, 7]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* Diagonal Road to About Studio */}
      <mesh position={[-20, 0.04, -15]} rotation={[0, Math.PI / 5, 0]} receiveShadow>
        <boxGeometry args={[5, 0.02, 35]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* Diagonal Road to Skills Lab */}
      <mesh position={[20, 0.04, -15]} rotation={[0, -Math.PI / 5, 0]} receiveShadow>
        <boxGeometry args={[5, 0.02, 35]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* Stunt Ramps */}
      <StuntRamp position={[18, 0, 0]} rotationY={Math.PI / 2} />
      <StuntRamp position={[-18, 0, 0]} rotationY={-Math.PI / 2} />
      <StuntRamp position={[0, 0, -18]} rotationY={Math.PI} />

      {/* Low-Poly Trees Distributed Around World */}
      {trees.map((t, index) => (
        <Tree key={`tree-${index}`} position={t.pos} scale={t.s} />
      ))}

      {/* Island Boundary Curbs (Keeps player on track) */}
      <mesh position={[0, 0.5, -92]}>
        <boxGeometry args={[184, 1.0, 1.5]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, 0.5, 92]}>
        <boxGeometry args={[184, 1.0, 1.5]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[-92, 0.5, 0]}>
        <boxGeometry args={[1.5, 1.0, 184]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[92, 0.5, 0]}>
        <boxGeometry args={[1.5, 1.0, 184]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </>
  );
};
