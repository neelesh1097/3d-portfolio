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

  // Animation refs
  const lighthouseLanternRef = useRef<THREE.PointLight>(null);
  const techCoresRef = useRef<THREE.Group>(null);
  const flagRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
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

    // Lighthouse rotating beacon
    if (lighthouseLanternRef.current) {
      const t = state.clock.elapsedTime * 2;
      lighthouseLanternRef.current.position.x = Math.sin(t) * 1.5;
      lighthouseLanternRef.current.position.z = Math.cos(t) * 1.5;
    }

    // Tech core rotation
    if (techCoresRef.current) {
      techCoresRef.current.rotation.y += delta * 0.7;
    }

    // Flag wave
    if (flagRef.current) {
      flagRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 4) * 0.2;
    }
  });

  return (
    <group>
      {/* ========================================================
          ZONE 1: ABOUT STUDIO — Blue-Domed Cottage (like Image 1!)
          Position: [-38, 0, -28]
         ======================================================== */}
      <group position={[-38, 0, -28]}>
        {/* Raised Terracotta Grass Terrace */}
        <mesh position={[0, 0.4, 0]} receiveShadow>
          <cylinderGeometry args={[11, 12, 0.8, 32]} />
          <meshStandardMaterial color="#84cc16" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[12, 12.5, 0.6, 32]} />
          <meshStandardMaterial color="#c2410c" roughness={0.8} />
        </mesh>

        {/* Low White Stone Curved Garden Wall (like Image 1!) */}
        <mesh position={[0, 1.0, 3.5]} rotation={[0, 0, 0]}>
          <boxGeometry args={[10, 0.6, 0.4]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
        </mesh>

        {/* Terracotta Front Steps */}
        {[0, 1, 2].map((step) => (
          <mesh key={`step-${step}`} position={[0, 0.5 + step * 0.2, 4.2 - step * 0.5]}>
            <boxGeometry args={[3.2 - step * 0.3, 0.2, 0.6]} />
            <meshStandardMaterial color="#b45309" roughness={0.6} />
          </mesh>
        ))}

        {/* Main Round Stone House Body */}
        <mesh position={[0, 2.6, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[4.2, 4.4, 3.6, 24]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
        </mesh>

        {/* Golden Cornice Ring Trim */}
        <mesh position={[0, 4.4, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[4.25, 0.2, 12, 24]} />
          <meshStandardMaterial color="#facc15" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Vibrant Blue Dome Roof (like Image 1!) */}
        <mesh position={[0, 4.8, 0]} castShadow>
          <sphereGeometry args={[4.3, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} />
        </mesh>

        {/* Small White Skylight on Dome */}
        <mesh position={[0, 8.8, 0]}>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>

        {/* Arched Wooden Doorway */}
        <mesh position={[0, 2.0, 4.25]} castShadow>
          <boxGeometry args={[1.5, 2.4, 0.3]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>

        {/* Yellow-trimmed Windows */}
        {[-2.8, 2.8].map((x, i) => (
          <group key={`win-${i}`} position={[x, 2.8, 2.8]}>
            <mesh>
              <boxGeometry args={[0.9, 0.9, 0.2]} />
              <meshStandardMaterial color="#fef08a" roughness={0.2} />
            </mesh>
            <mesh position={[0, 0, -0.05]}>
              <boxGeometry args={[1.1, 1.1, 0.1]} />
              <meshStandardMaterial color="#facc15" roughness={0.4} />
            </mesh>
          </group>
        ))}

        {/* 3D Floating Interactive Pill */}
        <Html position={[0, 6.5, 0]} center distanceFactor={20}>
          <div
            onClick={() => setActiveModal('about')}
            className="cursor-pointer px-4 py-2 rounded-2xl backdrop-blur-md bg-white/90 border-2 border-sky-400 text-slate-900 shadow-xl hover:scale-105 transition-all text-center whitespace-nowrap"
          >
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600">Personal Studio</div>
            <div className="text-xs font-bold flex items-center gap-1.5 justify-center mt-0.5">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-sky-100 border border-sky-300 text-[11px] font-mono text-sky-800">E</kbd>
              <span>or Click</span>
            </div>
          </div>
        </Html>
      </group>

      {/* ========================================================
          ZONE 2: TECH LAB — Playful Holographic Playground
          Position: [38, 0, -28]
         ======================================================== */}
      <group position={[38, 0, -28]}>
        {/* Hexagonal Stone Base */}
        <mesh position={[0, 0.4, 0]} receiveShadow>
          <cylinderGeometry args={[12, 13, 0.8, 6]} />
          <meshStandardMaterial color="#84cc16" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[13, 13.5, 0.6, 6]} />
          <meshStandardMaterial color="#c2410c" roughness={0.8} />
        </mesh>

        {/* Rotating Tech Data Blocks */}
        <group ref={techCoresRef} position={[0, 3.2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[2.4, 2.4, 2.4]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.2} />
          </mesh>
          {[
            { pos: [-4, 0, 0], color: '#10b981' },
            { pos: [4, 0, 0], color: '#f59e0b' },
            { pos: [0, 0, -4], color: '#8b5cf6' },
            { pos: [0, 0, 4], color: '#ec4899' },
          ].map((item, i) => (
            <mesh key={`tech-satellite-${i}`} position={item.pos as any} castShadow>
              <boxGeometry args={[1.4, 1.4, 1.4]} />
              <meshStandardMaterial color={item.color} roughness={0.4} />
            </mesh>
          ))}
        </group>

        {/* Interactive Pill */}
        <Html position={[0, 6.0, 0]} center distanceFactor={20}>
          <div
            onClick={() => setActiveModal('skills')}
            className="cursor-pointer px-4 py-2 rounded-2xl backdrop-blur-md bg-white/90 border-2 border-emerald-400 text-slate-900 shadow-xl hover:scale-105 transition-all text-center whitespace-nowrap"
          >
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Tech Laboratory</div>
            <div className="text-xs font-bold flex items-center gap-1.5 justify-center mt-0.5">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-[11px] font-mono text-emerald-800">E</kbd>
              <span>or Click</span>
            </div>
          </div>
        </Html>
      </group>

      {/* ========================================================
          ZONE 3: PROJECT ARENA — Festival Market Exhibition Stands
          Position: [0, 0, -56]
         ======================================================== */}
      <group position={[0, 0, -56]}>
        {/* Exhibition Plaza Deck */}
        <mesh position={[0, 0.35, 0]} receiveShadow>
          <boxGeometry args={[44, 0.7, 26]} />
          <meshStandardMaterial color="#84cc16" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[45, 0.6, 27]} />
          <meshStandardMaterial color="#c2410c" roughness={0.8} />
        </mesh>

        {/* 4 Interactive Exhibition Stands with Striped Awnings */}
        {PROJECTS.map((proj, idx) => {
          const awningColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];
          const awningColor = awningColors[idx % awningColors.length];
          const relPos: [number, number, number] = [proj.coords[0], 0.7, proj.coords[2] + 56];

          return (
            <group key={proj.id} position={relPos}>
              {/* Wooden Market Stall Base */}
              <mesh position={[0, 0.6, 0]} castShadow>
                <boxGeometry args={[4.2, 1.2, 3.4]} />
                <meshStandardMaterial color="#78350f" roughness={0.8} />
              </mesh>
              {/* Countertop Table */}
              <mesh position={[0, 1.25, 0]} castShadow>
                <boxGeometry args={[4.6, 0.15, 3.8]} />
                <meshStandardMaterial color="#fef08a" roughness={0.5} />
              </mesh>

              {/* Striped Market Awning Roof */}
              <mesh position={[0, 3.2, 0]} rotation={[0.15, 0, 0]} castShadow>
                <boxGeometry args={[4.8, 0.3, 3.6]} />
                <meshStandardMaterial color={awningColor} roughness={0.5} />
              </mesh>

              {/* Awning Support Timber Posts */}
              {[-2.1, 2.1].map((x) =>
                [-1.6, 1.6].map((z) => (
                  <mesh key={`post-${x}-${z}`} position={[x, 2.2, z]}>
                    <cylinderGeometry args={[0.1, 0.1, 2.0, 6]} />
                    <meshStandardMaterial color="#78350f" />
                  </mesh>
                ))
              )}

              {/* Trigger Interactive Card */}
              <Html position={[0, 2.6, 0]} center distanceFactor={16}>
                <div
                  onClick={() => {
                    confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
                    openProjectModal(proj);
                  }}
                  className="cursor-pointer w-44 p-3 rounded-2xl backdrop-blur-md bg-white/95 border-2 border-slate-900 text-slate-950 shadow-2xl hover:scale-105 transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                      Stand #{idx + 1}
                    </span>
                    <span className="text-xs">🎪</span>
                  </div>
                  <div className="font-extrabold text-xs text-slate-900 truncate">{proj.title}</div>
                  <div className="text-[10px] text-slate-600 line-clamp-2 mt-0.5">{proj.subtitle}</div>
                  <button className="mt-2 w-full py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition-colors text-center cursor-pointer">
                    Explore Project
                  </button>
                </div>
              </Html>
            </group>
          );
        })}
      </group>

      {/* ========================================================
          ZONE 4: CAREER RUNWAY — Stone Highway Milestone Gates
          Position: [42, 0, 24]
         ======================================================== */}
      <group position={[42, 0, 24]}>
        {/* Runway Grass Mound */}
        <mesh position={[0, 0.35, 0]} receiveShadow>
          <boxGeometry args={[22, 0.7, 30]} />
          <meshStandardMaterial color="#84cc16" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[23, 0.6, 31]} />
          <meshStandardMaterial color="#c2410c" roughness={0.8} />
        </mesh>

        {/* Milestone Gates over the road */}
        {EXPERIENCES.map((exp, idx) => {
          const zPos = -8 + idx * 8;
          return (
            <group key={exp.id} position={[0, 0, zPos]}>
              {/* Left Stone Pillar */}
              <mesh position={[-4.5, 2.5, 0]} castShadow>
                <cylinderGeometry args={[0.45, 0.6, 5, 8]} />
                <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
              </mesh>
              {/* Right Stone Pillar */}
              <mesh position={[4.5, 2.5, 0]} castShadow>
                <cylinderGeometry args={[0.45, 0.6, 5, 8]} />
                <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
              </mesh>
              {/* Overhead Timber Beam */}
              <mesh position={[0, 5.0, 0]} castShadow>
                <boxGeometry args={[10.2, 0.6, 0.8]} />
                <meshStandardMaterial color="#78350f" roughness={0.7} />
              </mesh>
            </group>
          );
        })}

        {/* Interactive Pill */}
        <Html position={[0, 6.2, 0]} center distanceFactor={20}>
          <div
            onClick={() => setActiveModal('experience')}
            className="cursor-pointer px-4 py-2 rounded-2xl backdrop-blur-md bg-white/90 border-2 border-amber-400 text-slate-900 shadow-xl hover:scale-105 transition-all text-center whitespace-nowrap"
          >
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600">Career Runway</div>
            <div className="text-xs font-bold flex items-center gap-1.5 justify-center mt-0.5">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300 text-[11px] font-mono text-amber-800">E</kbd>
              <span>or Click</span>
            </div>
          </div>
        </Html>
      </group>

      {/* ========================================================
          ZONE 5: ACADEMY CAMPUS — Bell Tower & Quad
          Position: [-42, 0, 24]
         ======================================================== */}
      <group position={[-42, 0, 24]}>
        <mesh position={[0, 0.35, 0]} receiveShadow>
          <cylinderGeometry args={[12, 13, 0.7, 32]} />
          <meshStandardMaterial color="#84cc16" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[13, 13.5, 0.6, 32]} />
          <meshStandardMaterial color="#c2410c" roughness={0.8} />
        </mesh>

        {/* Bell Tower */}
        <mesh position={[0, 3.5, 0]} castShadow>
          <cylinderGeometry args={[2.0, 2.8, 7, 8]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
        </mesh>
        {/* Pyramid Roof */}
        <mesh position={[0, 7.8, 0]} castShadow>
          <coneGeometry args={[2.8, 2.4, 8]} />
          <meshStandardMaterial color="#b45309" roughness={0.6} />
        </mesh>

        {/* Interactive Pill */}
        <Html position={[0, 6.2, 0]} center distanceFactor={20}>
          <div
            onClick={() => setActiveModal('education')}
            className="cursor-pointer px-4 py-2 rounded-2xl backdrop-blur-md bg-white/90 border-2 border-indigo-400 text-slate-900 shadow-xl hover:scale-105 transition-all text-center whitespace-nowrap"
          >
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">Academy Campus</div>
            <div className="text-xs font-bold flex items-center gap-1.5 justify-center mt-0.5">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-indigo-100 border border-indigo-300 text-[11px] font-mono text-indigo-800">E</kbd>
              <span>or Click</span>
            </div>
          </div>
        </Html>
      </group>

      {/* ========================================================
          ZONE 6: COMMS STATION — Coastal Lighthouse (like Image 1!)
          Position: [0, 0, 52]
         ======================================================== */}
      <group position={[0, 0, 52]}>
        {/* Rocky Coastal Plateau */}
        <mesh position={[0, 0.35, 0]} receiveShadow>
          <cylinderGeometry args={[11, 12, 0.7, 32]} />
          <meshStandardMaterial color="#84cc16" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[12, 12.5, 0.6, 32]} />
          <meshStandardMaterial color="#c2410c" roughness={0.8} />
        </mesh>

        {/* Red & White Banded Watchtower / Lighthouse (like Image 1!) */}
        {/* Base Tier (Dark Wood) */}
        <mesh position={[0, 1.8, 0]} castShadow>
          <cylinderGeometry args={[2.2, 2.8, 3.2, 16]} />
          <meshStandardMaterial color="#78350f" roughness={0.8} />
        </mesh>
        {/* Mid Observation Gallery Deck with Railing */}
        <mesh position={[0, 3.5, 0]} castShadow>
          <cylinderGeometry args={[3.2, 3.2, 0.2, 16]} />
          <meshStandardMaterial color="#b45309" roughness={0.6} />
        </mesh>
        {/* Upper Tier (Bright Red) */}
        <mesh position={[0, 5.0, 0]} castShadow>
          <cylinderGeometry args={[1.8, 2.0, 2.8, 16]} />
          <meshStandardMaterial color="#ef4444" roughness={0.4} />
        </mesh>
        {/* Red Conical Roof with Flagpole */}
        <mesh position={[0, 7.0, 0]} castShadow>
          <coneGeometry args={[2.4, 2.2, 16]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} />
        </mesh>

        {/* Waving Red Flag at Peak (like Image 1!) */}
        <group position={[0, 8.4, 0]}>
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 1.6, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh ref={flagRef} position={[0.4, 1.3, 0]}>
            <boxGeometry args={[0.8, 0.5, 0.04]} />
            <meshStandardMaterial color="#ef4444" roughness={0.4} />
          </mesh>
        </group>

        {/* Lantern Rotating Point Light */}
        <pointLight ref={lighthouseLanternRef} position={[0, 5.5, 0]} intensity={4} distance={16} color="#fef08a" />

        {/* Interactive Pill */}
        <Html position={[0, 5.5, 0]} center distanceFactor={20}>
          <div
            onClick={() => setActiveModal('contact')}
            className="cursor-pointer px-4 py-2 rounded-2xl backdrop-blur-md bg-white/90 border-2 border-rose-400 text-slate-900 shadow-xl hover:scale-105 transition-all text-center whitespace-nowrap"
          >
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600">Comms Station</div>
            <div className="text-xs font-bold flex items-center gap-1.5 justify-center mt-0.5">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-rose-100 border border-rose-300 text-[11px] font-mono text-rose-800">E</kbd>
              <span>or Click</span>
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
};
