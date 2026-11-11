import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { soundManager } from '../utils/audio';

// Custom physics parameters for agile, arcade Bruno Simon-style driving
const CONFIG = {
  maxSpeed: 0.85,
  boostMultiplier: 1.6,
  acceleration: 0.024,
  deceleration: 0.015,
  reverseSpeed: 0.35,
  turnSpeed: 0.042,
  grip: 0.88,
  gravity: 0.025,
  jumpStrength: 0.45,
};

export const Vehicle: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<(THREE.Mesh | null)[]>([]);
  const wheelRotateRef = useRef<number>(0);

  // Sound & store sync
  const controls = useStore((state) => state.controls);
  const setCarState = useStore((state) => state.setCarState);
  const shouldResetCar = useStore((state) => state.shouldResetCar);
  const clearResetCar = useStore((state) => state.clearResetCar);
  const teleportTarget = useStore((state) => state.teleportTarget);
  const clearTeleport = useStore((state) => state.clearTeleport);
  const unlockAchievement = useStore((state) => state.unlockAchievement);

  // Physics simulation state
  const physics = useRef({
    position: new THREE.Vector3(0, 0.5, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    speed: 0,
    angle: 0,
    verticalVelocity: 0,
    isGrounded: true,
  });

  // Boost timer tracker for achievement
  const boostDuration = useRef<number>(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const p = physics.current;

    // Handle Teleport
    if (teleportTarget) {
      p.position.set(teleportTarget[0], teleportTarget[1] + 0.5, teleportTarget[2]);
      p.velocity.set(0, 0, 0);
      p.speed = 0;
      p.verticalVelocity = 0;
      clearTeleport();
    }

    // Handle Reset Car
    if (shouldResetCar || p.position.y < -5 || Math.abs(p.position.x) > 95 || Math.abs(p.position.z) > 95) {
      p.position.set(0, 0.8, 0);
      p.velocity.set(0, 0, 0);
      p.speed = 0;
      p.angle = 0;
      p.verticalVelocity = 0;
      clearResetCar();
    }

    // Acceleration & Braking
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
    } else if (controls.backward) {
      p.speed = Math.max(p.speed - CONFIG.acceleration, -CONFIG.reverseSpeed);
    } else {
      // Natural rolling friction
      if (p.speed > 0) {
        p.speed = Math.max(p.speed - CONFIG.deceleration, 0);
      } else if (p.speed < 0) {
        p.speed = Math.min(p.speed + CONFIG.deceleration, 0);
      }
    }

    // Handbrake / space deceleration
    if (controls.handbrake) {
      p.speed *= 0.92;
    }

    // Steering (effective only when moving)
    const effectiveSpeed = Math.abs(p.speed);
    if (effectiveSpeed > 0.01) {
      const turnFactor = Math.min(effectiveSpeed / (CONFIG.maxSpeed * 0.5), 1.0);
      const dir = p.speed >= 0 ? 1 : -1;
      if (controls.left) {
        p.angle += CONFIG.turnSpeed * turnFactor * dir;
      }
      if (controls.right) {
        p.angle -= CONFIG.turnSpeed * turnFactor * dir;
      }
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
      if (p.position.y <= 0.45) {
        p.position.y = 0.45;
        p.verticalVelocity = 0;
        p.isGrounded = true;
      }
    }

    // Move forward in facing direction
    const forwardX = Math.sin(p.angle);
    const forwardZ = Math.cos(p.angle);

    p.position.x += forwardX * p.speed;
    p.position.z += forwardZ * p.speed;

    // Apply to 3D mesh
    groupRef.current.position.copy(p.position);
    groupRef.current.rotation.y = p.angle;

    // Chassis body roll / tilt based on steering and speed
    const steerTilt = controls.left ? 0.08 : controls.right ? -0.08 : 0;
    const accelPitch = controls.forward ? -0.04 : controls.backward ? 0.04 : 0;
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, steerTilt * (effectiveSpeed / CONFIG.maxSpeed), 0.15);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, accelPitch, 0.15);

    // Rotate Wheels
    wheelRotateRef.current += p.speed * 2.5;
    wheelsRef.current.forEach((wheel, index) => {
      if (wheel) {
        wheel.rotation.x = wheelRotateRef.current;
        // Front wheels turn with steering
        if (index < 2) {
          const steerAngle = controls.left ? 0.35 : controls.right ? -0.35 : 0;
          wheel.rotation.y = THREE.MathUtils.lerp(wheel.rotation.y, steerAngle, 0.2);
        }
      }
    });

    // Camera follow with smooth isometric lerp
    const camOffset = new THREE.Vector3(
      p.position.x - forwardX * 13 + 7,
      p.position.y + 11,
      p.position.z - forwardZ * 13 + 7
    );
    state.camera.position.lerp(camOffset, 0.08);

    const targetLook = new THREE.Vector3(
      p.position.x + forwardX * 3,
      p.position.y + 1.2,
      p.position.z + forwardZ * 3
    );
    state.camera.lookAt(targetLook);

    // Sync speed & audio
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
    <group ref={groupRef} position={[0, 0.45, 0]}>
      {/* Main Roadster Body */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[1.5, 0.4, 2.8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Sporty Colored Upper Shell */}
      <mesh position={[0, 0.5, -0.1]} castShadow>
        <boxGeometry args={[1.3, 0.35, 1.8]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Cabin Tinted Glass */}
      <mesh position={[0, 0.72, -0.15]} castShadow>
        <boxGeometry args={[1.1, 0.32, 1.2]} />
        <meshStandardMaterial color="#0284c7" transparent opacity={0.65} roughness={0.1} />
      </mesh>

      {/* Aerodynamic Rear Wing / Spoiler */}
      <mesh position={[0, 0.78, 1.15]} castShadow>
        <boxGeometry args={[1.6, 0.08, 0.4]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-0.65, 0.58, 1.15]}>
        <boxGeometry args={[0.08, 0.35, 0.2]} />
        <meshStandardMaterial color="#38bdf8" />
      </mesh>
      <mesh position={[0.65, 0.58, 1.15]}>
        <boxGeometry args={[0.08, 0.35, 0.2]} />
        <meshStandardMaterial color="#38bdf8" />
      </mesh>

      {/* Glowing Headlights */}
      <mesh position={[-0.52, 0.35, -1.4]}>
        <boxGeometry args={[0.3, 0.12, 0.08]} />
        <meshBasicMaterial color="#e0f2fe" />
      </mesh>
      <mesh position={[0.52, 0.35, -1.4]}>
        <boxGeometry args={[0.3, 0.12, 0.08]} />
        <meshBasicMaterial color="#e0f2fe" />
      </mesh>
      <pointLight position={[0, 0.5, -2.2]} intensity={2.5} distance={14} color="#e0f2fe" />

      {/* Taillights Neon Bar */}
      <mesh position={[0, 0.36, 1.41]}>
        <boxGeometry args={[1.3, 0.1, 0.06]} />
        <meshBasicMaterial color="#f43f5e" />
      </mesh>

      {/* Wheels: 4 Tires with glowing rims */}
      {/* Front Left */}
      <group position={[-0.85, 0.18, -0.85]}>
        <mesh ref={(el) => (wheelsRef.current[0] = el)} castShadow>
          <cylinderGeometry args={[0.32, 0.32, 0.25, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
        <mesh position={[-0.13, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.04, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Front Right */}
      <group position={[0.85, 0.18, -0.85]}>
        <mesh ref={(el) => (wheelsRef.current[1] = el)} castShadow>
          <cylinderGeometry args={[0.32, 0.32, 0.25, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
        <mesh position={[0.13, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.04, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Rear Left */}
      <group position={[-0.85, 0.18, 0.85]}>
        <mesh ref={(el) => (wheelsRef.current[2] = el)} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.28, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
        <mesh position={[-0.14, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.04, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Rear Right */}
      <group position={[0.85, 0.18, 0.85]}>
        <mesh ref={(el) => (wheelsRef.current[3] = el)} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.28, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
        <mesh position={[0.14, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.04, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Nitro Flame Exhaust (Visible when boosting) */}
      {controls.boost && (
        <group position={[0, 0.25, 1.6]}>
          <pointLight color="#06b6d4" intensity={4} distance={6} />
          <mesh>
            <coneGeometry args={[0.25, 0.9, 12]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
          </mesh>
        </group>
      )}
    </group>
  );
};
