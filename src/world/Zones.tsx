import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { ZONES, PROJECTS, EXPERIENCES } from '../data/portfolio';
import confetti from 'canvas-confetti';

export const Zones: React.FC = () => {
  const carPosition = useStore((state) => state.carPosition);
  const setApproachedZone = useStore((state) => state.setApproachedZone);
  const setActiveModal = useStore((state) => state.setActiveModal);
  const openProjectModal = useStore((state) => state.openProjectModal);
  const approachedZone = useStore((state) => state.approachedZone);

  // Hologram animations
  const hologramRef = useRef<THREE.Mesh>(null);
  const dishRef = useRef<THREE.Group>(null);
  const cubesRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // Check distance from each zone
    const carPos = new THREE.Vector3(...carPosition);
    let nearestZone: string | null = null;
    let minDistance = 999;

    ZONES.forEach((z) => {
      const zonePos = new THREE.Vector3(...z.position);
      const d = carPos.distanceTo(zonePos);
      if (d < z.radius && d < minDistance) {
        minDistance = d;
        nearestZone = z.id;
      }
    });

    setApproachedZone(nearestZone as any);

    // Rotate holographic visualizers
    if (hologramRef.current) {
      hologramRef.current.rotation.y += delta * 0.8;
      hologramRef.current.position.y = 2.4 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
    if (dishRef.current) {
      dishRef.current.rotation.y += delta * 0.5;
    }
    if (cubesRef.current) {
      cubesRef.current.rotation.y += delta * 0.6;
    }
  });

  return (
    <group>
      {/* ========================================================
          ZONE 1: ABOUT ME STUDIO (-38, 0, -28)
         ======================================================== */}
      <group position={[-38, 0, -28]}>
        {/* Foundation Platform */}
        <mesh position={[0, 0.2, 0]} receiveShadow>
          <cylinderGeometry args={[11, 12, 0.4, 32]} />
          <meshStandardMaterial color="#1e1b4b" metalness={0.4} roughness={0.6} />
        </mesh>
        {/* Glowing Perimeter Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.42, 0]}>
          <ringGeometry args={[10.2, 11, 32]} />
          <meshBasicMaterial color="#a855f7" />
        </mesh>

        {/* Modern Studio Pavilion Columns */}
        {[-7, 7].map((x) =>
          [-7, 7].map((z) => (
            <mesh key={`col-${x}-${z}`} position={[x, 3.0, z]} castShadow>
              <cylinderGeometry args={[0.35, 0.35, 6, 16]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
          ))
        )}

        {/* Pavilion Floating Roof Canopy */}
        <mesh position={[0, 6.2, 0]} castShadow>
          <boxGeometry args={[16, 0.4, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>
        <mesh position={[0, 6.0, 0]}>
          <boxGeometry args={[15.2, 0.05, 15.2]} />
          <meshBasicMaterial color="#c084fc" />
        </mesh>

        {/* Central Holographic Emblem / Avatar Pod */}
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[2.5, 3.0, 1.2, 24]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

        <mesh ref={hologramRef} position={[0, 2.5, 0]}>
          <octahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial color="#c084fc" wireframe emissive="#a855f7" emissiveIntensity={0.6} />
        </mesh>

        {/* 3D Floating Action Prompt */}
        <Html position={[0, 4.5, 0]} center distanceFactor={22}>
          <div
            onClick={() => setActiveModal('about')}
            className="cursor-pointer px-4 py-2 rounded-xl backdrop-blur-md bg-purple-950/80 border border-purple-500/50 text-white shadow-xl shadow-purple-500/20 hover:scale-105 transition-all text-center whitespace-nowrap"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-purple-300">About Studio</div>
            <div className="text-sm font-semibold flex items-center gap-1.5 justify-center">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-purple-800 border border-purple-400 text-xs font-mono">E</kbd>
              <span>or Click</span>
            </div>
          </div>
        </Html>
      </group>

      {/* ========================================================
          ZONE 2: TECH LAB / SKILLS (38, 0, -28)
         ======================================================== */}
      <group position={[38, 0, -28]}>
        {/* Hexagonal Platform */}
        <mesh position={[0, 0.2, 0]} receiveShadow>
          <cylinderGeometry args={[13, 14, 0.4, 6]} />
          <meshStandardMaterial color="#083344" roughness={0.5} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.42, 0]}>
          <ringGeometry args={[11.5, 12.5, 6]} />
          <meshBasicMaterial color="#06b6d4" />
        </mesh>

        {/* Rotating Tech Data Core */}
        <group ref={cubesRef} position={[0, 2.8, 0]}>
          {/* Central Cube */}
          <mesh castShadow>
            <boxGeometry args={[2.2, 2.2, 2.2]} />
            <meshStandardMaterial color="#06b6d4" metalness={0.7} roughness={0.2} wireframe />
          </mesh>
          {/* Orbiting Satellite Tech Cubes */}
          {[
            { pos: [-4, 0, 0], color: '#38bdf8' },
            { pos: [4, 0, 0], color: '#10b981' },
            { pos: [0, 0, -4], color: '#f59e0b' },
            { pos: [0, 0, 4], color: '#8b5cf6' },
          ].map((item, idx) => (
            <mesh key={`orbit-cube-${idx}`} position={item.pos as any} castShadow>
              <boxGeometry args={[1.2, 1.2, 1.2]} />
              <meshStandardMaterial color={item.color} metalness={0.6} />
            </mesh>
          ))}
        </group>

        {/* 3D Floating Action Prompt */}
        <Html position={[0, 5.0, 0]} center distanceFactor={22}>
          <div
            onClick={() => setActiveModal('skills')}
            className="cursor-pointer px-4 py-2 rounded-xl backdrop-blur-md bg-cyan-950/80 border border-cyan-500/50 text-white shadow-xl shadow-cyan-500/20 hover:scale-105 transition-all text-center whitespace-nowrap"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-300">Tech Laboratory</div>
            <div className="text-sm font-semibold flex items-center gap-1.5 justify-center">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-cyan-800 border border-cyan-400 text-xs font-mono">E</kbd>
              <span>or Click</span>
            </div>
          </div>
        </Html>
      </group>

      {/* ========================================================
          ZONE 3: PROJECT ARENA (0, 0, -56)
         ======================================================== */}
      <group position={[0, 0, -56]}>
        {/* Arena Grand Stage */}
        <mesh position={[0, 0.2, 0]} receiveShadow>
          <boxGeometry args={[42, 0.4, 26]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[41.2, 0.04, 25.2]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} />
        </mesh>

        {/* 4 Interactive 3D Exhibition Stands */}
        {PROJECTS.map((proj, idx) => {
          // Relative position inside the Arena
          const relPos: [number, number, number] = [proj.coords[0], 0.4, proj.coords[2] + 56];
          return (
            <group key={proj.id} position={relPos}>
              {/* Pedestal Stand */}
              <mesh position={[0, 0.6, 0]} castShadow>
                <cylinderGeometry args={[2.2, 2.6, 1.2, 24]} />
                <meshStandardMaterial color="#1e293b" metalness={0.8} />
              </mesh>
              {/* Glowing Landing Pad */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.22, 0]}>
                <ringGeometry args={[1.6, 2.1, 24]} />
                <meshBasicMaterial color={proj.accentColor} />
              </mesh>

              {/* Holographic Floating Screen Billboard */}
              <mesh position={[0, 3.2, 0]} castShadow>
                <boxGeometry args={[3.8, 2.4, 0.15]} />
                <meshStandardMaterial color="#0284c7" metalness={0.4} roughness={0.2} emissive={proj.accentColor} emissiveIntensity={0.2} />
              </mesh>

              {/* Project Card Trigger in HTML */}
              <Html position={[0, 3.2, 0]} center distanceFactor={18}>
                <div
                  onClick={() => {
                    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
                    openProjectModal(proj);
                  }}
                  className="cursor-pointer w-48 p-3 rounded-xl backdrop-blur-lg bg-slate-900/90 border border-sky-400/50 text-white shadow-2xl hover:scale-105 transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/30 text-sky-300">
                      #{idx + 1} Featured
                    </span>
                    <span className="text-xs">🚀</span>
                  </div>
                  <div className="font-bold text-xs text-white truncate">{proj.title}</div>
                  <div className="text-[10px] text-slate-300 line-clamp-2 mt-0.5">{proj.subtitle}</div>
                  <button className="mt-2 w-full py-1 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[11px] transition-colors text-center">
                    View Project
                  </button>
                </div>
              </Html>
            </group>
          );
        })}
      </group>

      {/* ========================================================
          ZONE 4: CAREER RUNWAY / EXPERIENCE (42, 0, 24)
         ======================================================== */}
      <group position={[42, 0, 24]}>
        {/* Runway Base */}
        <mesh position={[0, 0.2, 0]} receiveShadow>
          <boxGeometry args={[22, 0.4, 28]} />
          <meshStandardMaterial color="#064e3b" roughness={0.7} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.42, 0]}>
          <ringGeometry args={[9, 10, 32]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>

        {/* 3 Milestone Arches to drive through */}
        {EXPERIENCES.map((exp, idx) => {
          const zPos = -8 + idx * 8;
          return (
            <group key={exp.id} position={[0, 0, zPos]}>
              {/* Left Pillar */}
              <mesh position={[-4.5, 2.5, 0]} castShadow>
                <cylinderGeometry args={[0.3, 0.4, 5, 16]} />
                <meshStandardMaterial color="#334155" />
              </mesh>
              {/* Right Pillar */}
              <mesh position={[4.5, 2.5, 0]} castShadow>
                <cylinderGeometry args={[0.3, 0.4, 5, 16]} />
                <meshStandardMaterial color="#334155" />
              </mesh>
              {/* Overhead Milestone Beam */}
              <mesh position={[0, 5.0, 0]} castShadow>
                <boxGeometry args={[10, 0.5, 0.8]} />
                <meshStandardMaterial color="#10b981" />
              </mesh>
            </group>
          );
        })}

        {/* 3D Floating Action Prompt */}
        <Html position={[0, 6.2, 0]} center distanceFactor={22}>
          <div
            onClick={() => setActiveModal('experience')}
            className="cursor-pointer px-4 py-2 rounded-xl backdrop-blur-md bg-emerald-950/80 border border-emerald-500/50 text-white shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all text-center whitespace-nowrap"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">Career Timeline</div>
            <div className="text-sm font-semibold flex items-center gap-1.5 justify-center">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-emerald-800 border border-emerald-400 text-xs font-mono">E</kbd>
              <span>or Click</span>
            </div>
          </div>
        </Html>
      </group>

      {/* ========================================================
          ZONE 5: EDUCATION CAMPUS (-42, 0, 24)
         ======================================================== */}
      <group position={[-42, 0, 24]}>
        {/* Campus Quad */}
        <mesh position={[0, 0.2, 0]} receiveShadow>
          <cylinderGeometry args={[11, 12, 0.4, 32]} />
          <meshStandardMaterial color="#451a03" roughness={0.7} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.42, 0]}>
          <ringGeometry args={[9.5, 10.5, 32]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>

        {/* Academy Monument */}
        <mesh position={[0, 2.5, 0]} castShadow>
          <cylinderGeometry args={[1.5, 2.5, 5, 8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        {/* Golden Graduation Cap / Emblem */}
        <mesh position={[0, 5.2, 0]} castShadow>
          <boxGeometry args={[3.2, 0.15, 3.2]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} />
        </mesh>

        {/* 3D Floating Action Prompt */}
        <Html position={[0, 6.0, 0]} center distanceFactor={22}>
          <div
            onClick={() => setActiveModal('education')}
            className="cursor-pointer px-4 py-2 rounded-xl backdrop-blur-md bg-amber-950/80 border border-amber-500/50 text-white shadow-xl shadow-amber-500/20 hover:scale-105 transition-all text-center whitespace-nowrap"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-amber-300">Academy Campus</div>
            <div className="text-sm font-semibold flex items-center gap-1.5 justify-center">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-amber-800 border border-amber-400 text-xs font-mono">E</kbd>
              <span>or Click</span>
            </div>
          </div>
        </Html>
      </group>

      {/* ========================================================
          ZONE 6: COMMS STATION / CONTACT (0, 0, 52)
         ======================================================== */}
      <group position={[0, 0, 52]}>
        {/* Circular Tower Base */}
        <mesh position={[0, 0.2, 0]} receiveShadow>
          <cylinderGeometry args={[11, 12, 0.4, 32]} />
          <meshStandardMaterial color="#500724" roughness={0.6} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.42, 0]}>
          <ringGeometry args={[9.5, 10.5, 32]} />
          <meshBasicMaterial color="#ec4899" />
        </mesh>

        {/* Satellite Mast Tower */}
        <mesh position={[0, 3.5, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.8, 7, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.9} />
        </mesh>

        {/* Rotating Dish Antenna */}
        <group ref={dishRef} position={[0, 7.2, 0]}>
          <mesh rotation={[0.6, 0, 0]} castShadow>
            <cylinderGeometry args={[2.5, 0.4, 0.8, 24]} />
            <meshStandardMaterial color="#ec4899" metalness={0.7} />
          </mesh>
          <pointLight color="#ec4899" intensity={3} distance={10} />
        </group>

        {/* 3D Floating Action Prompt */}
        <Html position={[0, 4.5, 0]} center distanceFactor={22}>
          <div
            onClick={() => setActiveModal('contact')}
            className="cursor-pointer px-4 py-2 rounded-xl backdrop-blur-md bg-pink-950/80 border border-pink-500/50 text-white shadow-xl shadow-pink-500/20 hover:scale-105 transition-all text-center whitespace-nowrap"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-pink-300">Comms Station</div>
            <div className="text-sm font-semibold flex items-center gap-1.5 justify-center">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-pink-800 border border-pink-400 text-xs font-mono">E</kbd>
              <span>or Click</span>
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
};
