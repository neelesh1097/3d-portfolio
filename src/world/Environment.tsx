import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Fluffy 3D Cartoon Cloud composed of multiple overlapping matte spheres
const CartoonCloud: React.FC<{ position: [number, number, number]; scale?: number; speed?: number }> = ({
  position,
  scale = 1,
  speed = 0.2,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const initialX = position[0];

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.x += delta * speed;
    if (groupRef.current.position.x > 110) {
      groupRef.current.position.x = -110;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Central sphere */}
      <mesh castShadow>
        <sphereGeometry args={[2.4, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} flatShading />
      </mesh>
      {/* Side spheres */}
      <mesh position={[-1.8, -0.4, 0.2]} castShadow>
        <sphereGeometry args={[1.7, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[1.8, -0.3, -0.2]} castShadow>
        <sphereGeometry args={[1.6, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0.4, 1.1, 0]} castShadow>
        <sphereGeometry args={[1.8, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[-0.8, 0.9, -0.3]} castShadow>
        <sphereGeometry args={[1.4, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
};

// Puffy Bulbous Cartoon Tree (like Image 1)
const BulbousCartoonTree: React.FC<{ position: [number, number, number]; scale?: number }> = ({
  position,
  scale = 1,
}) => {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Curved wooden trunk */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.6, 2.8, 8]} />
        <meshStandardMaterial color="#854d0e" roughness={0.8} flatShading />
      </mesh>
      {/* Fluffy canopy clumps */}
      <mesh position={[0, 3.2, 0]} castShadow>
        <sphereGeometry args={[2.0, 12, 12]} />
        <meshStandardMaterial color="#65a30d" roughness={0.6} flatShading />
      </mesh>
      <mesh position={[-1.1, 3.7, 0.6]} castShadow>
        <sphereGeometry args={[1.4, 10, 10]} />
        <meshStandardMaterial color="#84cc16" roughness={0.6} flatShading />
      </mesh>
      <mesh position={[1.1, 3.5, -0.5]} castShadow>
        <sphereGeometry args={[1.3, 10, 10]} />
        <meshStandardMaterial color="#4ade80" roughness={0.6} flatShading />
      </mesh>
    </group>
  );
};

// Conical Pine Tree (like Image 2)
const ConicalPineTree: React.FC<{ position: [number, number, number]; scale?: number }> = ({
  position,
  scale = 1,
}) => {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.35, 1.4, 6]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      {/* Tier 1 Cone */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <coneGeometry args={[1.6, 2.0, 6]} />
        <meshStandardMaterial color="#15803d" roughness={0.7} flatShading />
      </mesh>
      {/* Tier 2 Cone */}
      <mesh position={[0, 2.9, 0]} castShadow>
        <coneGeometry args={[1.2, 1.6, 6]} />
        <meshStandardMaterial color="#16a34a" roughness={0.7} flatShading />
      </mesh>
      {/* Tier 3 Cone */}
      <mesh position={[0, 3.8, 0]} castShadow>
        <coneGeometry args={[0.8, 1.2, 6]} />
        <meshStandardMaterial color="#22c55e" roughness={0.7} flatShading />
      </mesh>
    </group>
  );
};

// Wooden Telephone / Power Pole with crossbar (like Image 2)
const TelephonePole: React.FC<{ position: [number, number, number]; rotationY?: number }> = ({
  position,
  rotationY = 0,
}) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Main vertical wooden mast */}
      <mesh position={[0, 3.8, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.24, 7.6, 8]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>
      {/* Crossbar 1 (Upper) */}
      <mesh position={[0, 6.6, 0]} castShadow>
        <boxGeometry args={[3.2, 0.2, 0.2]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>
      {/* Crossbar 2 (Lower) */}
      <mesh position={[0, 5.4, 0]} castShadow>
        <boxGeometry args={[2.4, 0.18, 0.18]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>
      {/* Ceramic insulators */}
      {[-1.3, 0, 1.3].map((x, i) => (
        <mesh key={`ins-${i}`} position={[x, 6.85, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.3, 8]} />
          <meshStandardMaterial color="#0284c7" metalness={0.2} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
};

// Stunt Jump Ramp
const JumpRamp: React.FC<{ position: [number, number, number]; rotationY?: number }> = ({
  position,
  rotationY = 0,
}) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Wedge Ramp */}
      <mesh position={[0, 0.8, 0]} rotation={[0.26, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.8, 0.3, 4.6]} />
        <meshStandardMaterial color="#d97706" roughness={0.6} />
      </mesh>
      {/* Yellow/Black hazard stripes */}
      <mesh position={[0, 0.96, -1.3]} rotation={[0.26, 0, 0]}>
        <boxGeometry args={[4.4, 0.06, 0.5]} />
        <meshBasicMaterial color="#facc15" />
      </mesh>
      {/* Support Rails */}
      <mesh position={[-2.3, 0.9, 0]} rotation={[0.26, 0, 0]}>
        <boxGeometry args={[0.25, 0.6, 4.6]} />
        <meshStandardMaterial color="#b45309" />
      </mesh>
      <mesh position={[2.3, 0.9, 0]} rotation={[0.26, 0, 0]}>
        <boxGeometry args={[0.25, 0.6, 4.6]} />
        <meshStandardMaterial color="#b45309" />
      </mesh>
    </group>
  );
};

export const Environment: React.FC = () => {
  // Tree positions
  const trees = useMemo(() => {
    const list: Array<{ type: 'bulbous' | 'pine'; pos: [number, number, number]; scale: number }> = [];

    // Pines along roads and hills
    const pineCoords: [number, number][] = [
      [-16, -12], [-22, -18], [-18, -32], [-28, -6],
      [16, -12], [22, -18], [18, -32], [28, -6],
      [-16, 12], [-22, 18], [-18, 32], [-28, 6],
      [16, 12], [22, 18], [18, 32], [28, 6],
      [-32, -45], [32, -45], [-35, 38], [35, 38],
      [-52, -12], [52, -12], [-52, 12], [52, 12],
    ];
    pineCoords.forEach(([x, z], i) => {
      list.push({ type: 'pine', pos: [x, 0, z], scale: 0.9 + (i % 4) * 0.2 });
    });

    // Puffy bulbous cartoon trees in clusters
    const bulbousCoords: [number, number][] = [
      [-26, -26], [26, -26], [-28, 22], [28, 22],
      [-8, -75], [8, -75], [0, 72], [-14, 65], [14, 65],
      [-56, 0], [56, 0]
    ];
    bulbousCoords.forEach(([x, z], i) => {
      list.push({ type: 'bulbous', pos: [x, 0, z], scale: 1.0 + (i % 3) * 0.25 });
    });

    return list;
  }, []);

  // Wildflower tufts
  const flowers = useMemo(() => {
    const list: Array<{ pos: [number, number, number]; color: string }> = [];
    const colors = ['#f43f5e', '#facc15', '#a855f7', '#38bdf8', '#ffffff'];
    for (let i = 0; i < 45; i++) {
      const angle = (i / 45) * Math.PI * 2;
      const radius = 15 + (i * 7) % 40;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      list.push({
        pos: [x, 0.1, z],
        color: colors[i % colors.length],
      });
    }
    return list;
  }, []);

  return (
    <>
      {/* Soft atmospheric sun fog */}
      <fog attach="fog" args={['#a5f3fc', 40, 160]} />

      {/* Warm Sunny Key Light */}
      <directionalLight
        position={[45, 55, 30]}
        intensity={2.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={160}
        shadow-camera-left={-75}
        shadow-camera-right={75}
        shadow-camera-top={75}
        shadow-camera-bottom={-75}
        color="#fffbeb"
      />

      {/* Vibrant Cyan Ambient Sky Fill */}
      <ambientLight intensity={0.9} color="#bae6fd" />

      {/* Subtle Warm Bounce Light from Ground */}
      <directionalLight position={[-30, -10, -20]} intensity={0.4} color="#fef08a" />

      {/* ========================================================
          1. OCEAN BASE (Surrounding the Floating Island)
         ======================================================== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
        <cylinderGeometry args={[140, 140, 4, 48]} />
        <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Ocean Foam Rings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]}>
        <ringGeometry args={[78, 83, 48]} />
        <meshBasicMaterial color="#e0f2fe" transparent opacity={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.44, 0]}>
        <ringGeometry args={[95, 98, 48]} />
        <meshBasicMaterial color="#e0f2fe" transparent opacity={0.35} />
      </mesh>

      {/* ========================================================
          2. MINIATURE DIORAMA ISLAND (Terracotta Cliffs + Lush Grass)
         ======================================================== */}
      {/* Terracotta Cliff Underbody (Sculpted Island Base) */}
      <mesh position={[0, -1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[78, 62, 2.4, 48]} />
        <meshStandardMaterial color="#c2410c" roughness={0.8} flatShading />
      </mesh>

      {/* Lush Green Island Top Grass Surface */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[78.2, 78.2, 0.2, 48]} />
        <meshStandardMaterial color="#65a30d" roughness={0.65} flatShading />
      </mesh>

      {/* Terraced Rolling Hill Top 1 (North-West) */}
      <mesh position={[-30, 1.2, -40]} castShadow receiveShadow>
        <cylinderGeometry args={[18, 22, 2.4, 16]} />
        <meshStandardMaterial color="#84cc16" roughness={0.7} flatShading />
      </mesh>
      <mesh position={[-30, 0.1, -40]} castShadow receiveShadow>
        <cylinderGeometry args={[22, 25, 2.4, 16]} />
        <meshStandardMaterial color="#b45309" roughness={0.8} flatShading />
      </mesh>

      {/* Terraced Rolling Hill Top 2 (North-East) */}
      <mesh position={[30, 1.2, -40]} castShadow receiveShadow>
        <cylinderGeometry args={[18, 22, 2.4, 16]} />
        <meshStandardMaterial color="#84cc16" roughness={0.7} flatShading />
      </mesh>
      <mesh position={[30, 0.1, -40]} castShadow receiveShadow>
        <cylinderGeometry args={[22, 25, 2.4, 16]} />
        <meshStandardMaterial color="#b45309" roughness={0.8} flatShading />
      </mesh>

      {/* Cute Sunken Swimming Pool / Pond (like in Image 1!) */}
      <group position={[-16, 0.1, 16]}>
        {/* Stone Basin Ring */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[5.2, 5.8, 0.3, 24]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
        </mesh>
        {/* Sparkling Blue Water */}
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[4.8, 4.8, 0.1, 24]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.2} transparent opacity={0.85} />
        </mesh>
      </group>

      {/* ========================================================
          3. SCENIC ASPHALT ROAD NETWORK (with Painted White Stripes)
         ======================================================== */}
      {/* Central Plaza Roundabout Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.16, 0]} receiveShadow>
        <ringGeometry args={[7.5, 12.5, 48]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      {/* Roundabout White Dashes */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.18, 0]}>
        <ringGeometry args={[9.8, 10.2, 48]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>

      {/* Plaza Center Lawn Patch */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.19, 0]}>
        <circleGeometry args={[7.2, 32]} />
        <meshStandardMaterial color="#84cc16" roughness={0.6} />
      </mesh>

      {/* North Road: Plaza -> Project Arena */}
      <mesh position={[0, 0.17, -28]} receiveShadow>
        <boxGeometry args={[5.8, 0.05, 42]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      {/* White Center Line (Dashes) */}
      {[-12, -20, -28, -36, -44].map((z, i) => (
        <mesh key={`dash-n-${i}`} position={[0, 0.21, z]}>
          <boxGeometry args={[0.25, 0.02, 4.0]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
      ))}

      {/* South Road: Plaza -> Comms Station */}
      <mesh position={[0, 0.17, 28]} receiveShadow>
        <boxGeometry args={[5.8, 0.05, 42]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      {[12, 20, 28, 36, 44].map((z, i) => (
        <mesh key={`dash-s-${i}`} position={[0, 0.21, z]}>
          <boxGeometry args={[0.25, 0.02, 4.0]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
      ))}

      {/* East-West Highway */}
      <mesh position={[0, 0.17, 0]} receiveShadow>
        <boxGeometry args={[78, 0.05, 5.8]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      {[-32, -24, -16, 16, 24, 32].map((x, i) => (
        <mesh key={`dash-ew-${i}`} position={[x, 0.21, 0]}>
          <boxGeometry args={[4.0, 0.02, 0.25]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
      ))}

      {/* Diagonal Road to About Studio */}
      <mesh position={[-19, 0.17, -14]} rotation={[0, Math.PI / 5, 0]} receiveShadow>
        <boxGeometry args={[4.5, 0.05, 28]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* Diagonal Road to Skills Lab */}
      <mesh position={[19, 0.17, -14]} rotation={[0, -Math.PI / 5, 0]} receiveShadow>
        <boxGeometry args={[4.5, 0.05, 28]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* ========================================================
          4. WOODEN TELEPHONE / POWER POLES (like Image 2!)
         ======================================================== */}
      {[-42, -26, -10, 10, 26, 42].map((z, i) => (
        <TelephonePole key={`pole-right-${i}`} position={[4.2, 0.1, z]} rotationY={0} />
      ))}
      {[-42, -26, -10, 10, 26, 42].map((z, i) => (
        <TelephonePole key={`pole-left-${i}`} position={[-4.2, 0.1, z]} rotationY={Math.PI} />
      ))}

      {/* ========================================================
          5. STUNT JUMP RAMPS
         ======================================================== */}
      <JumpRamp position={[14, 0.1, 0]} rotationY={Math.PI / 2} />
      <JumpRamp position={[-14, 0.1, 0]} rotationY={-Math.PI / 2} />
      <JumpRamp position={[0, 0.1, -15]} rotationY={Math.PI} />

      {/* ========================================================
          6. VEGETATION: CARTOON TREES & CONICAL PINES
         ======================================================== */}
      {trees.map((t, idx) =>
        t.type === 'bulbous' ? (
          <BulbousCartoonTree key={`tree-${idx}`} position={t.pos} scale={t.scale} />
        ) : (
          <ConicalPineTree key={`tree-${idx}`} position={t.pos} scale={t.scale} />
        )
      )}

      {/* Wildflowers scattered across grass */}
      {flowers.map((f, idx) => (
        <mesh key={`flw-${idx}`} position={f.pos}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 6]} />
          <meshBasicMaterial color={f.color} />
        </mesh>
      ))}

      {/* ========================================================
          7. FLUFFY VOLUMETRIC 3D CLOUDS IN SKY
         ======================================================== */}
      <CartoonCloud position={[-35, 22, -45]} scale={1.8} speed={0.4} />
      <CartoonCloud position={[45, 25, -20]} scale={2.2} speed={0.3} />
      <CartoonCloud position={[-50, 20, 25]} scale={1.6} speed={0.5} />
      <CartoonCloud position={[30, 24, 45]} scale={2.0} speed={0.35} />
      <CartoonCloud position={[0, 28, -75]} scale={2.4} speed={0.25} />
    </>
  );
};
