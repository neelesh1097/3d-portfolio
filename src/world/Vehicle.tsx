import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { soundManager } from '../utils/audio';

const CONFIG = {
  maxSpeed: 0.9,
  boostMultiplier: 1.6,
  acceleration: 0.026,
  deceleration: 0.018,
  reverseSpeed: 0.38,
  turnSpeed: 0.045,
  gravity: 0.026,
  jumpStrength: 0.48,
};

export const Vehicle: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<(THREE.Group | null)[]>([]);
  const wheelRotateRef = useRef<number>(0);
  const smokeParticlesRef = useRef<THREE.Group>(null);

  const controls = useStore((state) => state.controls);
  const setCarState = useStore((state) => state.setCarState);
  const shouldResetCar = useStore((state) => state.shouldResetCar);
  const clearResetCar = useStore((state) => state.clearResetCar);
  const teleportTarget = useStore((state) => state.teleportTarget);
  const clearTeleport = useStore((state) => state.clearTeleport);
  const unlockAchievement = useStore((state) => state.unlockAchievement);

  // Physics simulation state
  const physics = useRef({
    position: new THREE.Vector3(0, 0.55, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    speed: 0,
    angle: 0,
    verticalVelocity: 0,
    isGrounded: true,
    suspensionPitch: 0,
    suspensionRoll: 0,
  });

  const boostDuration = useRef<number>(0);

  // Create pool of tire smoke particles
  const smokeParticles = useMemo(() => {
    const list: Array<{ x: number; y: number; z: number; life: number; scale: number }> = [];
    for (let i = 0; i < 16; i++) {
      list.push({ x: 0, y: -99, z: 0, life: 0, scale: 0.2 });
    }
    return list;
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const p = physics.current;

    // Handle Teleport
    if (teleportTarget) {
      p.position.set(teleportTarget[0], teleportTarget[1] + 0.6, teleportTarget[2]);
      p.velocity.set(0, 0, 0);
      p.speed = 0;
      p.verticalVelocity = 0;
      clearTeleport();
    }

    // Handle Reset Car
    if (shouldResetCar || p.position.y < -4 || Math.abs(p.position.x) > 85 || Math.abs(p.position.z) > 85) {
      p.position.set(0, 0.9, 0);
      p.velocity.set(0, 0, 0);
      p.speed = 0;
      p.angle = 0;
      p.verticalVelocity = 0;
      clearResetCar();
    }

    // Acceleration & Boost
    const topSpeed = controls.boost ? CONFIG.maxSpeed * CONFIG.boostMultiplier : CONFIG.maxSpeed;

    if (controls.boost && (controls.forward || Math.abs(p.speed) > 0.1)) {
      boostDuration.current += delta;
      if (boostDuration.current >= 2.0) {
        unlockAchievement('nitro_boost');
      }
    } else {
      boostDuration.current = 0;
    }

    if (controls.forward) {
      p.speed = Math.min(p.speed + CONFIG.acceleration, topSpeed);
      p.suspensionPitch = THREE.MathUtils.lerp(p.suspensionPitch, -0.08, 0.1);
    } else if (controls.backward) {
      p.speed = Math.max(p.speed - CONFIG.acceleration, -CONFIG.reverseSpeed);
      p.suspensionPitch = THREE.MathUtils.lerp(p.suspensionPitch, 0.08, 0.1);
    } else {
      // Natural rolling friction
      if (p.speed > 0) {
        p.speed = Math.max(p.speed - CONFIG.deceleration, 0);
      } else if (p.speed < 0) {
        p.speed = Math.min(p.speed + CONFIG.deceleration, 0);
      }
      p.suspensionPitch = THREE.MathUtils.lerp(p.suspensionPitch, 0, 0.1);
    }

    // Handbrake
    if (controls.handbrake) {
      p.speed *= 0.91;
    }

    // Interactive Road Speed Boost Pads
    const boostPads = [
      [0, -8],
      [8, 0],
      [-8, 0],
    ];
    boostPads.forEach(([bx, bz]) => {
      const d = Math.hypot(p.position.x - bx, p.position.z - bz);
      if (d < 1.8 && Math.abs(p.speed) > 0.05) {
        p.speed = Math.min(p.speed * 1.25, CONFIG.maxSpeed * CONFIG.boostMultiplier);
        soundManager.playBoost();
      }
    });

    // Steering
    const effectiveSpeed = Math.abs(p.speed);
    if (effectiveSpeed > 0.01) {
      const turnFactor = Math.min(effectiveSpeed / (CONFIG.maxSpeed * 0.45), 1.0);
      const dir = p.speed >= 0 ? 1 : -1;
      if (controls.left) {
        p.angle += CONFIG.turnSpeed * turnFactor * dir;
        p.suspensionRoll = THREE.MathUtils.lerp(p.suspensionRoll, 0.12, 0.15);
      } else if (controls.right) {
        p.angle -= CONFIG.turnSpeed * turnFactor * dir;
        p.suspensionRoll = THREE.MathUtils.lerp(p.suspensionRoll, -0.12, 0.15);
      } else {
        p.suspensionRoll = THREE.MathUtils.lerp(p.suspensionRoll, 0, 0.15);
      }
    } else {
      p.suspensionRoll = THREE.MathUtils.lerp(p.suspensionRoll, 0, 0.15);
    }

    // Jumping & Gravity
    if (controls.jump && p.isGrounded) {
      p.verticalVelocity = CONFIG.jumpStrength;
      p.isGrounded = false;
      unlockAchievement('stunt_jumper');
    }

    if (!p.isGrounded) {
      p.verticalVelocity -= CONFIG.gravity;
      p.position.y += p.verticalVelocity;
      if (p.position.y <= 0.55) {
        p.position.y = 0.55;
        p.verticalVelocity = 0;
        p.isGrounded = true;
      }
    }

    // Move forward in facing direction
    const forwardX = Math.sin(p.angle);
    const forwardZ = Math.cos(p.angle);

    p.position.x += forwardX * p.speed;
    p.position.z += forwardZ * p.speed;

    // Apply to 3D group
    groupRef.current.position.copy(p.position);
    groupRef.current.rotation.y = p.angle;
    groupRef.current.rotation.z = p.suspensionRoll;
    groupRef.current.rotation.x = p.suspensionPitch;

    // Rotate Wheels
    wheelRotateRef.current += p.speed * 2.8;
    wheelsRef.current.forEach((wheelGroup, index) => {
      if (wheelGroup) {
        const tireMesh = wheelGroup.children[0] as THREE.Mesh;
        if (tireMesh) {
          tireMesh.rotation.x = wheelRotateRef.current;
        }
        // Front wheels turn with steering
        if (index < 2) {
          const steerAngle = controls.left ? 0.38 : controls.right ? -0.38 : 0;
          wheelGroup.rotation.y = THREE.MathUtils.lerp(wheelGroup.rotation.y, steerAngle, 0.25);
        }
      }
    });

    // Dynamic Tire Smoke when accelerating, braking or boosting
    if (smokeParticlesRef.current && (controls.boost || Math.abs(p.speed) > 0.4)) {
      const activeIdx = Math.floor(Math.random() * smokeParticles.length);
      const sp = smokeParticles[activeIdx];
      if (sp.life <= 0) {
        sp.x = p.position.x - forwardX * 1.2 + (Math.random() - 0.5) * 0.6;
        sp.y = p.position.y - 0.2;
        sp.z = p.position.z - forwardZ * 1.2 + (Math.random() - 0.5) * 0.6;
        sp.life = 1.0;
        sp.scale = 0.2;
      }
    }

    // Animate Smoke Particles
    if (smokeParticlesRef.current) {
      smokeParticles.forEach((sp, i) => {
        const mesh = smokeParticlesRef.current!.children[i] as THREE.Mesh;
        if (mesh) {
          if (sp.life > 0) {
            sp.life -= delta * 2.5;
            sp.y += delta * 0.4;
            sp.scale += delta * 0.8;
            mesh.position.set(sp.x, sp.y, sp.z);
            mesh.scale.setScalar(sp.scale);
            (mesh.material as THREE.MeshBasicMaterial).opacity = sp.life * 0.6;
          } else {
            mesh.position.set(0, -99, 0);
          }
        }
      });
    }

    // Camera follow (Third-Person Country Road Chase Camera like Image 2)
    const camDistance = 14;
    const camHeight = 9.5;
    const camOffset = new THREE.Vector3(
      p.position.x - forwardX * camDistance,
      p.position.y + camHeight,
      p.position.z - forwardZ * camDistance
    );
    state.camera.position.lerp(camOffset, 0.08);

    const targetLook = new THREE.Vector3(
      p.position.x + forwardX * 4,
      p.position.y + 1.2,
      p.position.z + forwardZ * 4
    );
    state.camera.lookAt(targetLook);

    // Audio sync
    const normalizedSpeed = p.speed / CONFIG.maxSpeed;
    soundManager.updateEnginePitch(normalizedSpeed);

    setCarState(
      [p.position.x, p.position.y, p.position.z],
      p.angle,
      Math.round(Math.abs(p.speed) * 110),
      controls.boost
    );
  });

  return (
    <>
      {/* ========================================================
          CHUNKY RED OFF-ROAD BUGGY / MONSTER TRUCK (like Image 2!)
         ======================================================== */}
      <group ref={groupRef} position={[0, 0.55, 0]}>
        {/* Main Chunky Body (Charming Red Off-Roader) */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[1.5, 0.5, 2.6]} />
          <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Flared Wheel Mudguard Arches */}
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[1.75, 0.25, 2.7]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>

        {/* Cabin Glass & Roof */}
        <mesh position={[0, 0.72, -0.1]} castShadow>
          <boxGeometry args={[1.25, 0.42, 1.4]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.2} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, 0.95, -0.1]} castShadow>
          <boxGeometry args={[1.3, 0.08, 1.45]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} />
        </mesh>

        {/* Black Tubular Roof Rack / Luggage Basket (like Image 2!) */}
        <group position={[0, 1.05, -0.1]}>
          <mesh castShadow>
            <boxGeometry args={[1.15, 0.12, 1.25]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          {/* Luggage box on roof */}
          <mesh position={[0, 0.15, 0]} castShadow>
            <boxGeometry args={[0.8, 0.2, 0.9]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.5} />
          </mesh>
        </group>

        {/* Front Radiator Grille & Bullbar */}
        <mesh position={[0, 0.32, -1.35]} castShadow>
          <boxGeometry args={[1.3, 0.35, 0.15]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>

        {/* Chunky Round Headlights */}
        <mesh position={[-0.45, 0.38, -1.42]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        <mesh position={[0.45, 0.38, -1.42]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        <pointLight position={[0, 0.4, -2.2]} intensity={2.8} distance={15} color="#fffbeb" />

        {/* Dual Rear Taillights */}
        <mesh position={[-0.5, 0.38, 1.32]}>
          <boxGeometry args={[0.25, 0.12, 0.06]} />
          <meshBasicMaterial color="#f43f5e" />
        </mesh>
        <mesh position={[0.5, 0.38, 1.32]}>
          <boxGeometry args={[0.25, 0.12, 0.06]} />
          <meshBasicMaterial color="#f43f5e" />
        </mesh>

        {/* 4 Chunky Off-Road Monster Tires */}
        {/* Front Left */}
        <group position={[-0.95, 0.18, -0.75]} ref={(el) => (wheelsRef.current[0] = el)}>
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.38, 0.38, 0.32, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh position={[-0.17, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.04, 16]} />
            <meshStandardMaterial color="#facc15" roughness={0.4} />
          </mesh>
        </group>

        {/* Front Right */}
        <group position={[0.95, 0.18, -0.75]} ref={(el) => (wheelsRef.current[1] = el)}>
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.38, 0.38, 0.32, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh position={[0.17, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.04, 16]} />
            <meshStandardMaterial color="#facc15" roughness={0.4} />
          </mesh>
        </group>

        {/* Rear Left */}
        <group position={[-0.95, 0.18, 0.8]} ref={(el) => (wheelsRef.current[2] = el)}>
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.42, 0.42, 0.36, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh position={[-0.19, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
            <meshStandardMaterial color="#facc15" roughness={0.4} />
          </mesh>
        </group>

        {/* Rear Right */}
        <group position={[0.95, 0.18, 0.8]} ref={(el) => (wheelsRef.current[3] = el)}>
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.42, 0.42, 0.36, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh position={[0.19, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
            <meshStandardMaterial color="#facc15" roughness={0.4} />
          </mesh>
        </group>

        {/* Nitro Boost Blue Jet Flame */}
        {controls.boost && (
          <group position={[0, 0.28, 1.5]}>
            <pointLight color="#38bdf8" intensity={4} distance={7} />
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.28, 1.1, 12]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
            </mesh>
          </group>
        )}
      </group>

      {/* Dynamic Tire Smoke Particles */}
      <group ref={smokeParticlesRef}>
        {smokeParticles.map((_, i) => (
          <mesh key={`smoke-${i}`} position={[0, -99, 0]}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshBasicMaterial color="#f1f5f9" transparent opacity={0.5} />
          </mesh>
        ))}
      </group>
    </>
  );
};
