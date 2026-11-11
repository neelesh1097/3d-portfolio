import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { liveCar } from '../store/liveTelemetry';
import { soundManager } from '../utils/audio';
import { getIslandShoreRadius, getTerrainHeight } from './terrainBuilder';
import { createSculptedSportsCoupe } from './vehicleBuilder';

const CONFIG = {
  maxSpeed: 0.72,
  boostMultiplier: 1.55,
  acceleration: 0.024,
  deceleration: 0.018,
  reverseSpeed: 0.32,
  turnSpeed: 0.048,
  gravity: 0.024,
  jumpStrength: 0.44,
};

const BUILDING_COLLIDERS: Array<{ x: number; z: number; r: number }> = [
  { x: -23, z: -23, r: 5.0 },
  { x: 0, z: -32, r: 5.2 },
  { x: 23, z: -23, r: 5.0 },
  { x: 32, z: 0, r: 4.8 },
  { x: 23, z: 23, r: 5.0 },
  { x: 0, z: 32, r: 6.4 },
  { x: -23, z: 23, r: 4.9 },
  { x: -32, z: 0, r: 4.8 },
];

const RAMP_POSITIONS: Array<[number, number]> = [
  [12.5, 0],
  [-12.5, 0],
];

const _desiredCamPos = new THREE.Vector3();
const _desiredLookAt = new THREE.Vector3();

const CoupeWheel: React.FC<{
  position: [number, number, number];
  isRight: boolean;
  scale?: number;
  tireGeo: THREE.BufferGeometry;
  wheelRef: (el: THREE.Group | null) => void;
}> = ({ position, isRight, scale = 1, tireGeo, wheelRef }) => {
  const dir = isRight ? -1 : 1;
  return (
    <group position={position} ref={wheelRef} scale={scale}>
      <group>
        {/* Sculpted Rubber Tire */}
        <mesh geometry={tireGeo} castShadow>
          <meshStandardMaterial color="#181a1e" roughness={0.86} metalness={0.04} />
        </mesh>
        {/* Dark Recessed Wheel Barrel & Brake Rotor */}
        <mesh position={[dir * 0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.14, 18]} />
          <meshStandardMaterial color="#30363f" metalness={0.75} roughness={0.35} />
        </mesh>
        {/* Concave Brushed Graphite Alloy Outer Rim */}
        <mesh position={[dir * 0.115, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.205, 0.205, 0.035, 18]} />
          <meshStandardMaterial color="#424a54" metalness={0.78} roughness={0.28} />
        </mesh>
        {/* 5-Spoke Split Metallic Spokes */}
        {[0, 1, 2, 3, 4].map((sp) => (
          <mesh
            key={sp}
            position={[dir * 0.135, 0, 0]}
            rotation={[(sp * Math.PI * 2) / 5, 0, 0]}
          >
            <boxGeometry args={[0.025, 0.18, 0.042]} />
            <meshStandardMaterial color="#cfd5dc" metalness={0.82} roughness={0.22} />
          </mesh>
        ))}
        {/* Center Lock Hub */}
        <mesh position={[dir * 0.145, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.055, 0.055, 0.03, 12]} />
          <meshStandardMaterial color="#cf562e" metalness={0.45} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
};

export const Vehicle: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const wheelsRef = useRef<(THREE.Group | null)[]>([]);
  const wheelRotateRef = useRef<number>(0);
  const smokeParticlesRef = useRef<THREE.Group>(null);

  const isBoosting = useStore((state) => state.controls.boost);
  const isReversing = useStore((state) => state.controls.backward);
  const qualityLevel = useStore((state) => state.qualityLevel);
  const hudTimerRef = useRef<number>(0);

  const { bodyGeo, cabinGeo, roofGeo, tireGeo } = useMemo(createSculptedSportsCoupe, []);

  // Mouse-wheel camera zoom
  const zoomRef = useRef<number>(1.0);
  const lookAtTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.0, 2.5));

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const state = useStore.getState();
      if (state.activeModal || state.isMinimapOpen || state.is2DView || !state.hasStarted) return;
      zoomRef.current = THREE.MathUtils.clamp(zoomRef.current + e.deltaY * 0.0007, 0.72, 1.48);
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      bodyGeo.dispose();
      cabinGeo.dispose();
      roofGeo.dispose();
      tireGeo.dispose();
    };
  }, [bodyGeo, cabinGeo, roofGeo, tireGeo]);

  // Physics state (isolated from visual model!)
  const physics = useRef({
    position: new THREE.Vector3(0, 0.37, 0),
    speed: 0,
    angle: 0,
    verticalVelocity: 0,
    isGrounded: true,
    suspensionPitch: 0,
    suspensionRoll: 0,
  });

  const boostDuration = useRef<number>(0);

  const smokeParticles = useMemo(() => {
    const list: Array<{ x: number; y: number; z: number; life: number; scale: number }> = [];
    for (let i = 0; i < 12; i++) {
      list.push({ x: 0, y: -99, z: 0, life: 0, scale: 0.2 });
    }
    return list;
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const {
      controls,
      shouldResetCar,
      clearResetCar,
      teleportTarget,
      clearTeleport,
      setHudTelemetry,
      unlockAchievement,
    } = useStore.getState();
    const p = physics.current;
    const dt = Math.min(delta, 0.05);

    if (teleportTarget) {
      const tx = teleportTarget[0];
      const tz = teleportTarget[2];
      const dist = Math.hypot(tx, tz);
      if (dist > 2) {
        const approachScale = (dist - 7.5) / dist;
        const ax = tx * approachScale;
        const az = tz * approachScale;
        const surfY = Math.max(0.17, getTerrainHeight(ax, az));
        p.position.set(ax, surfY + 0.2, az);
        p.angle = Math.atan2(tx, tz);
      } else {
        p.position.set(0, 0.38, 0);
        p.angle = 0;
      }
      p.speed = 0;
      p.verticalVelocity = 0;
      p.isGrounded = true;
      clearTeleport();
    }

    if (shouldResetCar || p.position.y < -4) {
      p.position.set(0, 0.45, 0);
      p.speed = 0;
      p.angle = 0;
      p.verticalVelocity = 0;
      p.isGrounded = true;
      clearResetCar();
    }

    const topSpeed = controls.boost ? CONFIG.maxSpeed * CONFIG.boostMultiplier : CONFIG.maxSpeed;

    if (controls.boost && (controls.forward || Math.abs(p.speed) > 0.1)) {
      boostDuration.current += dt;
      if (boostDuration.current >= 1.5) {
        unlockAchievement('nitro_boost');
      }
    } else {
      boostDuration.current = 0;
    }

    if (controls.forward) {
      p.speed = Math.min(p.speed + CONFIG.acceleration, topSpeed);
      p.suspensionPitch = THREE.MathUtils.lerp(p.suspensionPitch, -0.04, 0.12);
    } else if (controls.backward) {
      p.speed = Math.max(p.speed - CONFIG.acceleration, -CONFIG.reverseSpeed);
      p.suspensionPitch = THREE.MathUtils.lerp(p.suspensionPitch, 0.04, 0.12);
    } else {
      if (p.speed > 0) {
        p.speed = Math.max(p.speed - CONFIG.deceleration, 0);
      } else if (p.speed < 0) {
        p.speed = Math.min(p.speed + CONFIG.deceleration, 0);
      }
      p.suspensionPitch = THREE.MathUtils.lerp(p.suspensionPitch, 0, 0.12);
    }

    if (controls.handbrake) {
      p.speed *= 0.91;
    }

    const effectiveSpeed = Math.abs(p.speed);
    if (effectiveSpeed > 0.01) {
      const turnFactor = Math.min(effectiveSpeed / (CONFIG.maxSpeed * 0.45), 1.0);
      const dir = p.speed >= 0 ? 1 : -1;
      if (controls.left) {
        p.angle += CONFIG.turnSpeed * turnFactor * dir;
        p.suspensionRoll = THREE.MathUtils.lerp(p.suspensionRoll, -0.07, 0.15);
      } else if (controls.right) {
        p.angle -= CONFIG.turnSpeed * turnFactor * dir;
        p.suspensionRoll = THREE.MathUtils.lerp(p.suspensionRoll, 0.07, 0.15);
      } else {
        p.suspensionRoll = THREE.MathUtils.lerp(p.suspensionRoll, 0, 0.15);
      }
    } else {
      p.suspensionRoll = THREE.MathUtils.lerp(p.suspensionRoll, 0, 0.15);
    }

    if (p.isGrounded && Math.abs(p.speed) > 0.25) {
      for (const [rx, rz] of RAMP_POSITIONS) {
        if (Math.hypot(p.position.x - rx, p.position.z - rz) < 1.9) {
          p.verticalVelocity = CONFIG.jumpStrength * 1.15;
          p.isGrounded = false;
          soundManager.playJump();
          unlockAchievement('stunt_jumper');
          break;
        }
      }
    }

    if (controls.jump && p.isGrounded) {
      p.verticalVelocity = CONFIG.jumpStrength;
      p.isGrounded = false;
      unlockAchievement('stunt_jumper');
    }

    const forwardX = Math.sin(p.angle);
    const forwardZ = Math.cos(p.angle);

    p.position.x += forwardX * p.speed;
    p.position.z += forwardZ * p.speed;

    for (const col of BUILDING_COLLIDERS) {
      const dx = p.position.x - col.x;
      const dz = p.position.z - col.z;
      const dist = Math.hypot(dx, dz);
      if (dist < col.r && dist > 0.001) {
        const push = col.r - dist;
        p.position.x += (dx / dist) * push;
        p.position.z += (dz / dist) * push;
        p.speed *= 0.65;
      }
    }

    const radialDist = Math.hypot(p.position.x, p.position.z);
    const shoreLimit = getIslandShoreRadius(Math.atan2(p.position.z, p.position.x)) - 2.4;
    if (radialDist > shoreLimit && radialDist > 0.001) {
      const scaleBack = shoreLimit / radialDist;
      p.position.x *= scaleBack;
      p.position.z *= scaleBack;
      p.speed *= 0.4;
    }

    const surfaceY = Math.max(0.17, getTerrainHeight(p.position.x, p.position.z));
    const groundRideY = surfaceY + 0.19;

    if (!p.isGrounded) {
      p.verticalVelocity -= CONFIG.gravity;
      p.position.y += p.verticalVelocity;
      if (p.position.y <= groundRideY) {
        p.position.y = groundRideY;
        p.verticalVelocity = 0;
        p.isGrounded = true;
      }
    } else {
      p.position.y = THREE.MathUtils.lerp(p.position.y, groundRideY, 0.35);
    }

    groupRef.current.position.copy(p.position);
    groupRef.current.rotation.y = p.angle;
    groupRef.current.rotation.z = p.suspensionRoll;
    groupRef.current.rotation.x = p.suspensionPitch;

    if (shadowRef.current) {
      const altitude = Math.max(0, p.position.y - groundRideY);
      const shrink = Math.max(0.45, 1 - altitude * 0.14);
      shadowRef.current.position.set(p.position.x, surfaceY + 0.03, p.position.z);
      shadowRef.current.rotation.z = -p.angle;
      shadowRef.current.scale.set(1.52 * shrink, 2.58 * shrink, 1);
      (shadowRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(
        0.08,
        0.3 - altitude * 0.06
      );
    }

    wheelRotateRef.current += p.speed * 2.8;
    wheelsRef.current.forEach((wheelGroup, index) => {
      if (!wheelGroup) return;
      const spinner = wheelGroup.children[0];
      if (spinner) {
        spinner.rotation.x = wheelRotateRef.current;
      }
      if (index < 2) {
        const steerAngle = controls.left ? 0.36 : controls.right ? -0.36 : 0;
        wheelGroup.rotation.y = THREE.MathUtils.lerp(wheelGroup.rotation.y, steerAngle, 0.25);
      }
    });

    if (smokeParticlesRef.current && (controls.boost || Math.abs(p.speed) > 0.35)) {
      const activeIdx = Math.floor(Math.random() * smokeParticles.length);
      const sp = smokeParticles[activeIdx];
      if (sp.life <= 0) {
        sp.x = p.position.x - forwardX * 1.25 + (Math.random() - 0.5) * 0.38;
        sp.y = p.position.y - 0.08;
        sp.z = p.position.z - forwardZ * 1.25 + (Math.random() - 0.5) * 0.38;
        sp.life = 0.72;
        sp.scale = 0.14;
      }
    }

    if (smokeParticlesRef.current) {
      smokeParticles.forEach((sp, i) => {
        const mesh = smokeParticlesRef.current!.children[i] as THREE.Mesh;
        if (!mesh) return;
        if (sp.life > 0) {
          sp.life -= dt * 2.2;
          sp.y += dt * 0.32;
          sp.scale += dt * 0.5;
          mesh.position.set(sp.x, sp.y, sp.z);
          mesh.scale.setScalar(sp.scale);
          (mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, sp.life * 0.34);
        } else {
          mesh.position.set(0, -99, 0);
        }
      });
    }

    // CINEMATIC THIRD-PERSON EXPLORATION CAMERA
    const zoom = zoomRef.current;
    const followDist = 14.5 * zoom + Math.abs(p.speed) * 2.4;
    const followHeight = 5.9 * zoom;

    _desiredCamPos.set(
      p.position.x - forwardX * followDist,
      p.position.y + followHeight,
      p.position.z - forwardZ * followDist
    );
    const camAlpha = 1 - Math.exp(-5.0 * dt);
    state.camera.position.lerp(_desiredCamPos, camAlpha);

    _desiredLookAt.set(
      p.position.x + forwardX * 5.0,
      p.position.y + 1.1,
      p.position.z + forwardZ * 5.0
    );
    const lookAlpha = 1 - Math.exp(-7.2 * dt);
    lookAtTargetRef.current.lerp(_desiredLookAt, lookAlpha);
    state.camera.lookAt(lookAtTargetRef.current);

    soundManager.updateEnginePitch(p.speed / CONFIG.maxSpeed);

    liveCar.x = p.position.x;
    liveCar.y = p.position.y;
    liveCar.z = p.position.z;
    liveCar.angle = p.angle;
    liveCar.speed = Math.round(Math.abs(p.speed) * 110);
    liveCar.boosting = controls.boost;

    hudTimerRef.current += dt;
    if (hudTimerRef.current >= 0.1) {
      hudTimerRef.current = 0;
      setHudTelemetry(liveCar.speed, liveCar.boosting);
    }
  });

  return (
    <>
      <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
        <circleGeometry args={[0.75, 20]} />
        <meshBasicMaterial color="#0b1420" transparent opacity={0.3} depthWrite={false} />
      </mesh>

      {/* ========================================================
          LOFTED BURNT-ORANGE COMPACT SPORTS COUPE (Faces +Z)
         ======================================================== */}
      <group ref={groupRef} position={[0, 0.37, 0]} scale={[0.92, 0.92, 0.92]}>
        {/* Clearcoat Metallic Burnt-Orange Sculpted Body */}
        <mesh geometry={bodyGeo} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#cf562e"
            roughness={0.24}
            metalness={0.28}
            clearcoat={1.0}
            clearcoatRoughness={0.09}
            envMapIntensity={1.25}
          />
        </mesh>

        {/* Tumblehome Smoked Glass Greenhouse */}
        <mesh geometry={cabinGeo} castShadow>
          <meshPhysicalMaterial
            color="#293d4a"
            roughness={0.06}
            metalness={0.2}
            clearcoat={1.0}
            reflectivity={0.95}
            envMapIntensity={1.4}
          />
        </mesh>

        {/* Painted Roof Panel */}
        <mesh geometry={roofGeo} castShadow>
          <meshPhysicalMaterial
            color="#242930"
            roughness={0.25}
            metalness={0.35}
            clearcoat={0.9}
            clearcoatRoughness={0.12}
          />
        </mesh>

        {/* Graphite Underbody Tray, Front Splitter & Rear Diffuser */}
        <mesh position={[0, 0.16, 0.02]}>
          <boxGeometry args={[1.28, 0.08, 2.52]} />
          <meshStandardMaterial color="#1f2329" roughness={0.72} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.2, 1.38]}>
          <boxGeometry args={[1.08, 0.045, 0.18]} />
          <meshStandardMaterial color="#232830" roughness={0.5} metalness={0.35} />
        </mesh>
        <mesh position={[0, 0.21, -1.36]}>
          <boxGeometry args={[1.16, 0.09, 0.16]} />
          <meshStandardMaterial color="#232830" roughness={0.55} metalness={0.3} />
        </mesh>
        {/* Rear Diffuser Vertical Strakes */}
        {[-0.28, 0, 0.28].map((x, idx) => (
          <mesh key={`strake-${idx}`} position={[x, 0.2, -1.4]}>
            <boxGeometry args={[0.035, 0.08, 0.14]} />
            <meshStandardMaterial color="#181b20" roughness={0.6} />
          </mesh>
        ))}

        {/* Aerodynamic Side Mirrors */}
        <mesh position={[-0.64, 0.64, 0.28]} rotation={[0, 0.2, 0.1]}>
          <boxGeometry args={[0.16, 0.075, 0.1]} />
          <meshStandardMaterial color="#cf562e" roughness={0.28} metalness={0.3} />
        </mesh>
        <mesh position={[0.64, 0.64, 0.28]} rotation={[0, -0.2, -0.1]}>
          <boxGeometry args={[0.16, 0.075, 0.1]} />
          <meshStandardMaterial color="#cf562e" roughness={0.28} metalness={0.3} />
        </mesh>

        {/* Subtle Integrated Rear Ducktail Wing */}
        <mesh position={[0, 0.64, -1.26]} rotation={[-0.2, 0, 0]} castShadow>
          <boxGeometry args={[1.14, 0.045, 0.2]} />
          <meshStandardMaterial color="#242930" roughness={0.38} metalness={0.4} />
        </mesh>

        {/* Front Recessed Intake Grille & Warm Metallic Trim */}
        <mesh position={[0, 0.28, 1.4]}>
          <boxGeometry args={[0.72, 0.11, 0.06]} />
          <meshStandardMaterial color="#16181d" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.23, 1.42]}>
          <boxGeometry args={[0.76, 0.02, 0.04]} />
          <meshStandardMaterial color="#b9bec4" metalness={0.8} roughness={0.25} />
        </mesh>

        {/* Sculpted Angled Headlight Projectors (+Z) */}
        <mesh position={[-0.42, 0.34, 1.33]} rotation={[0.12, -0.24, 0]}>
          <boxGeometry args={[0.22, 0.065, 0.09]} />
          <meshStandardMaterial color="#fff8e0" emissive="#fde69a" emissiveIntensity={1.3} />
        </mesh>
        <mesh position={[0.42, 0.34, 1.33]} rotation={[0.12, 0.24, 0]}>
          <boxGeometry args={[0.22, 0.065, 0.09]} />
          <meshStandardMaterial color="#fff8e0" emissive="#fde69a" emissiveIntensity={1.3} />
        </mesh>

        {/* Full-Width Rear LED Taillight Bar & Dual Exhausts (-Z) */}
        <mesh position={[0, 0.44, -1.36]}>
          <boxGeometry args={[1.08, 0.055, 0.05]} />
          <meshStandardMaterial
            color="#d94646"
            emissive="#ef4444"
            emissiveIntensity={isReversing ? 2.4 : 0.9}
          />
        </mesh>
        <mesh position={[-0.36, 0.2, -1.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.048, 0.048, 0.1, 12]} />
          <meshStandardMaterial color="#cbd2d9" metalness={0.85} roughness={0.22} />
        </mesh>
        <mesh position={[0.36, 0.2, -1.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.048, 0.048, 0.1, 12]} />
          <meshStandardMaterial color="#cbd2d9" metalness={0.85} roughness={0.22} />
        </mesh>

        {/* 4 Concave Alloy Wheels */}
        <CoupeWheel
          position={[0.72, 0.18, 0.76]}
          isRight={false}
          scale={0.96}
          tireGeo={tireGeo}
          wheelRef={(el) => (wheelsRef.current[0] = el)}
        />
        <CoupeWheel
          position={[-0.72, 0.18, 0.76]}
          isRight
          scale={0.96}
          tireGeo={tireGeo}
          wheelRef={(el) => (wheelsRef.current[1] = el)}
        />
        <CoupeWheel
          position={[0.74, 0.19, -0.78]}
          isRight={false}
          scale={1.02}
          tireGeo={tireGeo}
          wheelRef={(el) => (wheelsRef.current[2] = el)}
        />
        <CoupeWheel
          position={[-0.74, 0.19, -0.78]}
          isRight
          scale={1.02}
          tireGeo={tireGeo}
          wheelRef={(el) => (wheelsRef.current[3] = el)}
        />

        {/* Subtle Nitro Flame Cones */}
        {isBoosting && (
          <group position={[0, 0.2, -1.52]}>
            <mesh position={[-0.36, 0, -0.22]} rotation={[-Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.085, 0.5, 10]} />
              <meshBasicMaterial color="#43d9f5" transparent opacity={0.85} />
            </mesh>
            <mesh position={[0.36, 0, -0.22]} rotation={[-Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.085, 0.5, 10]} />
              <meshBasicMaterial color="#43d9f5" transparent opacity={0.85} />
            </mesh>
          </group>
        )}
      </group>

      {qualityLevel !== 'low' && (
        <group ref={smokeParticlesRef}>
          {smokeParticles.map((_, i) => (
            <mesh key={`smoke-${i}`} position={[0, -99, 0]}>
              <sphereGeometry args={[0.2, 6, 6]} />
              <meshBasicMaterial color="#e6e4de" transparent opacity={0.3} />
            </mesh>
          ))}
        </group>
      )}
    </>
  );
};
