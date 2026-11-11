import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { liveCar } from '../store/liveTelemetry';
import { ZONES } from '../data/portfolio';
import { PROJECTS_DATA } from '../data/projects';
import { sharedMat } from './sharedAssets';
import confetti from 'canvas-confetti';

/* -------------------------------------------------------------------------- */
/*  COHESIVE MODERNIST COASTAL ARCHITECTURE HELPERS                           */
/* -------------------------------------------------------------------------- */

function createArchitecturalGeometries() {
  // L-shaped courtyard studio footprint for About Me
  const lShape = new THREE.Shape();
  lShape.moveTo(-3.6, -2.5);
  lShape.lineTo(3.6, -2.5);
  lShape.lineTo(3.6, 2.2);
  lShape.lineTo(0.8, 2.2);
  lShape.lineTo(0.8, -0.2);
  lShape.lineTo(-3.6, -0.2);
  lShape.closePath();

  const lWingGeo = new THREE.ExtrudeGeometry(lShape, {
    depth: 2.35,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.04,
    bevelSegments: 2,
  });
  lWingGeo.rotateX(-Math.PI / 2);
  lWingGeo.computeVertexNormals();

  // Sculpted Butterfly / Gull-wing curved roof profile for Cloud & DevOps
  const gullShape = new THREE.Shape();
  gullShape.moveTo(-4.2, 0.35);
  gullShape.quadraticCurveTo(-2.0, -0.1, 0, 0.15);
  gullShape.quadraticCurveTo(2.0, -0.1, 4.2, 0.45);
  gullShape.lineTo(4.2, 0.62);
  gullShape.quadraticCurveTo(2.0, 0.08, 0, 0.32);
  gullShape.quadraticCurveTo(-2.0, 0.08, -4.2, 0.52);
  gullShape.closePath();

  const gullRoofGeo = new THREE.ExtrudeGeometry(gullShape, {
    depth: 5.4,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.03,
    bevelSegments: 2,
  });
  gullRoofGeo.translate(0, 0, -2.7);
  gullRoofGeo.computeVertexNormals();

  // Vaulted parabolic exhibition arch canopy for Project Plaza
  const archShape = new THREE.Shape();
  archShape.moveTo(-6.4, 0);
  archShape.quadraticCurveTo(0, 2.4, 6.4, 0);
  archShape.lineTo(6.4, 0.24);
  archShape.quadraticCurveTo(0, 2.66, -6.4, 0.24);
  archShape.closePath();

  const archRoofGeo = new THREE.ExtrudeGeometry(archShape, {
    depth: 6.2,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.03,
    bevelSegments: 2,
  });
  archRoofGeo.translate(0, 0, -3.1);
  archRoofGeo.computeVertexNormals();

  return { lWingGeo, gullRoofGeo, archRoofGeo };
}

const BuildingLabel: React.FC<{
  title: string;
  subtitle: string;
  height: number;
  isApproached?: boolean;
  onClick: () => void;
}> = ({ title, subtitle, height, isApproached, onClick }) => {
  const activeModal = useStore((s) => s.activeModal);
  const isMinimapOpen = useStore((s) => s.isMinimapOpen);
  const is2DView = useStore((s) => s.is2DView);
  const hasStarted = useStore((s) => s.hasStarted);

  if (!hasStarted || activeModal || isMinimapOpen || is2DView) return null;

  return (
    <Html position={[0, height, 0]} center distanceFactor={24} zIndexRange={[10, 0]}>
      <button
        type="button"
        onClick={onClick}
        className={`cursor-pointer px-3 py-1.5 rounded-lg bg-[#0B1420]/90 border text-left shadow-lg transition-transform hover:scale-105 whitespace-nowrap flex items-center gap-2 ${
          isApproached ? 'border-[#43D9F5]/75 scale-105' : 'border-white/15'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            isApproached ? 'bg-[#43D9F5]' : 'bg-[#9AAFC2]'
          }`}
        />
        <div>
          <div className="font-mono text-[9px] font-medium uppercase tracking-wider leading-none text-[#9AAFC2]">
            {subtitle}
          </div>
          <div className="font-display text-[11px] font-bold text-[#F4F7FA] leading-tight mt-0.5 flex items-center gap-1.5">
            <span>{title}</span>
            <span className="text-[9px] font-mono text-[#43D9F5] bg-[#14263A] px-1 rounded border border-white/10">
              E
            </span>
          </div>
        </div>
      </button>
    </Html>
  );
};

const PavilionEntrance: React.FC<{ zPos: number; width?: number }> = ({ zPos, width = 2.4 }) => (
  <group position={[0, 0, zPos]}>
    {/* Framed Graphite Portal */}
    <mesh position={[0, 1.35, 0]} castShadow material={sharedMat.graphite}>
      <boxGeometry args={[width, 2.2, 0.34]} />
    </mesh>
    {/* Smoked Glass Double Doors */}
    <mesh position={[0, 1.25, 0.08]} material={sharedMat.smokedGlass}>
      <boxGeometry args={[width - 0.32, 1.95, 0.2]} />
    </mesh>
    {/* Center Door Mullion */}
    <mesh position={[0, 1.25, 0.19]} material={sharedMat.graphite}>
      <boxGeometry args={[0.06, 1.95, 0.04]} />
    </mesh>
    {/* Thin Limestone & Cedar Cantilever Canopy */}
    <mesh position={[0, 2.54, 0.52]} castShadow material={sharedMat.limestone}>
      <boxGeometry args={[width + 1.0, 0.14, 1.2]} />
    </mesh>
    <mesh position={[0, 2.45, 0.52]} material={sharedMat.cedarWood}>
      <boxGeometry args={[width + 0.88, 0.04, 1.08]} />
    </mesh>
    {/* Warm Recessed Soffit Strip */}
    <mesh position={[0, 2.42, 0.92]} material={sharedMat.warmArchitecturalLight}>
      <boxGeometry args={[width + 0.4, 0.025, 0.08]} />
    </mesh>
    {/* Entry Steps */}
    <mesh position={[0, 0.32, 0.82]} receiveShadow material={sharedMat.sandConcrete}>
      <boxGeometry args={[width + 0.8, 0.1, 0.7]} />
    </mesh>
  </group>
);

const GlazedFacadeBand: React.FC<{
  width: number;
  height: number;
  bays: number;
  position: [number, number, number];
  rotationY?: number;
}> = ({ width, height, bays, position, rotationY = 0 }) => {
  const paneW = (width - (bays + 1) * 0.1) / bays;
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh material={sharedMat.graphite}>
        <boxGeometry args={[width, height, 0.08]} />
      </mesh>
      {Array.from({ length: bays }).map((_, i) => {
        const x = -width / 2 + 0.1 + paneW / 2 + i * (paneW + 0.1);
        return (
          <mesh key={i} position={[x, 0, 0.03]} material={sharedMat.smokedGlass}>
            <boxGeometry args={[paneW, height - 0.14, 0.05]} />
          </mesh>
        );
      })}
    </group>
  );
};

const ArchitecturalTerrace: React.FC<{ width: number; depth: number }> = ({ width, depth }) => (
  <group>
    <mesh position={[0, 0.13, 0]} receiveShadow material={sharedMat.stoneCurb}>
      <boxGeometry args={[width + 1.3, 0.18, depth + 1.3]} />
    </mesh>
    <mesh position={[0, 0.27, 0]} receiveShadow material={sharedMat.sandConcrete}>
      <boxGeometry args={[width, 0.14, depth]} />
    </mesh>
  </group>
);

/* -------------------------------------------------------------------------- */
/*  MAIN PORTFOLIO ARCHITECTURAL LANDMARKS                                    */
/* -------------------------------------------------------------------------- */
export const Zones: React.FC = React.memo(() => {
  const approachedZone = useStore((state) => state.approachedZone);
  const setApproachedZone = useStore((state) => state.setApproachedZone);
  const setActiveModal = useStore((state) => state.setActiveModal);
  const qualityLevel = useStore((state) => state.qualityLevel);
  const activeModal = useStore((state) => state.activeModal);
  const isMinimapOpen = useStore((s) => s.isMinimapOpen);
  const is2DView = useStore((s) => s.is2DView);
  const hasStarted = useStore((s) => s.hasStarted);
  const showWorldLabels = hasStarted && !activeModal && !isMinimapOpen && !is2DView;
  const openProjectModal = useStore((state) => state.openProjectModal);

  const { lWingGeo, gullRoofGeo, archRoofGeo } = useMemo(createArchitecturalGeometries, []);

  useEffect(() => {
    return () => {
      lWingGeo.dispose();
      gullRoofGeo.dispose();
      archRoofGeo.dispose();
    };
  }, [lWingGeo, gullRoofGeo, archRoofGeo]);

  const frontendScreensRef = useRef<THREE.Group>(null);
  const backendTurbineRef = useRef<THREE.Group>(null);
  const dbRingsRef = useRef<THREE.Group>(null);
  const devopsDishRef = useRef<THREE.Group>(null);
  const contactBeaconRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    let nearestZone: string | null = null;
    let minDistSq = 999999;

    for (let i = 0; i < ZONES.length; i++) {
      const z = ZONES[i];
      const dx = liveCar.x - z.position[0];
      const dz = liveCar.z - z.position[2];
      const dSq = dx * dx + dz * dz;
      if (dSq < z.radius * z.radius && dSq < minDistSq) {
        minDistSq = dSq;
        nearestZone = z.id;
      }
    }

    setApproachedZone(nearestZone as any);

    if (qualityLevel === 'low') return;

    if (frontendScreensRef.current) {
      frontendScreensRef.current.rotation.y += delta * 0.3;
    }
    if (backendTurbineRef.current) {
      backendTurbineRef.current.rotation.y += delta * 1.6;
    }
    if (dbRingsRef.current) {
      dbRingsRef.current.rotation.y += delta * 0.4;
    }
    if (devopsDishRef.current) {
      devopsDishRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.6;
    }
    if (contactBeaconRef.current) {
      contactBeaconRef.current.rotation.y += delta * 1.6;
    }
  });

  return (
    <group>
      {/* ========================================================
          0. CENTRAL PLAZA ARCHITECTURAL BENCHES & PLANTERS ([0,0,0])
         ======================================================== */}
      {[
        [4.1, 0.17, 4.1],
        [-4.1, 0.17, 4.1],
        [4.1, 0.17, -4.1],
        [-4.1, 0.17, -4.1],
      ].map(([x, y, z], i) => (
        <group key={`hub-bench-${i}`} position={[x, y, z]} rotation={[0, (i * Math.PI) / 2 + Math.PI / 4, 0]}>
          <mesh receiveShadow material={sharedMat.sandConcrete}>
            <boxGeometry args={[1.4, 0.24, 0.65]} />
          </mesh>
          <mesh position={[0, 0.15, 0]} material={sharedMat.cedarWood}>
            <boxGeometry args={[1.25, 0.05, 0.55]} />
          </mesh>
        </group>
      ))}

      {/* ========================================================
          A. ABOUT ME — L-SHAPED COURTYARD ATELIER VILLA [-23, 0, -23]
         ======================================================== */}
      <group position={[-23, 0, -23]} rotation={[0, Math.PI / 4, 0]}>
        <ArchitecturalTerrace width={9.6} depth={8.8} />

        {/* Outdoor Cedar Courtyard Deck */}
        <mesh position={[-1.4, 0.37, 1.1]} receiveShadow material={sharedMat.cedarWood}>
          <boxGeometry args={[4.4, 0.07, 3.6]} />
        </mesh>

        {/* Sculpted L-Shaped Limestone Pavilion */}
        <mesh position={[0, 0.34, 0]} geometry={lWingGeo} castShadow receiveShadow material={sharedMat.limestone} />

        {/* Glazed Studio Walls Wrapping the Courtyard */}
        <GlazedFacadeBand width={3.9} height={1.65} bays={3} position={[-1.4, 1.5, -0.18]} />
        <GlazedFacadeBand width={2.2} height={1.65} bays={2} position={[0.78, 1.5, 1.0]} rotationY={-Math.PI / 2} />

        {/* Cantilevered Upper Studio Box + Angled Cedar Roof */}
        <mesh position={[0.9, 3.35, -1.0]} castShadow receiveShadow material={sharedMat.graphite}>
          <boxGeometry args={[4.6, 1.35, 3.2]} />
        </mesh>
        <GlazedFacadeBand width={3.6} height={0.95} bays={3} position={[0.9, 3.35, 0.62]} />

        <mesh position={[0, 4.18, -0.3]} rotation={[0.04, 0, 0]} castShadow material={sharedMat.warmOffWhite}>
          <boxGeometry args={[8.0, 0.16, 5.8]} />
        </mesh>
        <mesh position={[0, 4.08, -0.3]} rotation={[0.04, 0, 0]} material={sharedMat.cedarWood}>
          <boxGeometry args={[7.7, 0.04, 5.5]} />
        </mesh>

        <PavilionEntrance zPos={2.25} width={2.2} />

        <BuildingLabel
          title="About Me"
          subtitle="Atelier Studio"
          height={6.0}
          isApproached={approachedZone === 'about'}
          onClick={() => setActiveModal('about')}
        />
      </group>

      {/* ========================================================
          B. FRONTEND CITY — PARAMETRIC GLASS STUDIO [0, 0, -32]
         ======================================================== */}
      <group position={[0, 0, -32]}>
        <ArchitecturalTerrace width={10.8} depth={9.2} />

        {/* Double-Height Smoked Glass Atrium Core */}
        <mesh position={[0, 2.3, -0.2]} castShadow receiveShadow material={sharedMat.smokedGlass}>
          <boxGeometry args={[7.4, 3.9, 5.4]} />
        </mesh>
        {/* Limestone Structural Frame Columns & Slabs */}
        <mesh position={[0, 0.42, 0]} receiveShadow material={sharedMat.limestone}>
          <boxGeometry args={[8.4, 0.18, 6.4]} />
        </mesh>
        <mesh position={[0, 2.3, 0]} material={sharedMat.limestone}>
          <boxGeometry args={[8.0, 0.18, 6.0]} />
        </mesh>

        {/* Rhythmic Angled Sun-Breaker Fins across Glass Facade */}
        {[-3.2, -2.1, -1.0, 1.0, 2.1, 3.2].map((x, idx) => (
          <mesh
            key={`fe-fin-${idx}`}
            position={[x, 2.35, 2.65]}
            rotation={[0, 0.26, 0]}
            castShadow
            material={sharedMat.warmOffWhite}
          >
            <boxGeometry args={[0.14, 3.85, 0.42]} />
          </mesh>
        ))}

        {/* Cantilevered Upper Design Mezzanine */}
        <mesh position={[-0.7, 5.05, 0.35]} castShadow receiveShadow material={sharedMat.graphite}>
          <boxGeometry args={[5.4, 1.55, 4.4]} />
        </mesh>
        <GlazedFacadeBand width={4.6} height={1.05} bays={4} position={[-0.7, 5.05, 2.57]} />
        <mesh position={[-0.7, 5.9, 0.35]} castShadow material={sharedMat.limestone}>
          <boxGeometry args={[5.8, 0.16, 4.8]} />
        </mesh>

        {/* Subtle Orbiting Glass Display Fins */}
        <group ref={frontendScreensRef} position={[0, 6.95, 0]}>
          {[-1.85, 0, 1.85].map((x, i) => (
            <mesh key={`fe-scr-${i}`} position={[x, 0, 0]} material={sharedMat.smokedGlass}>
              <boxGeometry args={[1.2, 0.72, 0.06]} />
            </mesh>
          ))}
        </group>

        <PavilionEntrance zPos={2.65} width={2.3} />

        <BuildingLabel
          title="Frontend City"
          subtitle="Design & WebGL"
          height={8.4}
          isApproached={approachedZone === 'frontend'}
          onClick={() => setActiveModal('frontend')}
        />
      </group>

      {/* ========================================================
          C. BACKEND LAB — COMPUTE RESEARCH FACILITY [23, 0, -23]
         ======================================================== */}
      <group position={[23, 0, -23]} rotation={[0, -Math.PI / 4, 0]}>
        <ArchitecturalTerrace width={10.2} depth={9.0} />

        {/* Twin Offset Research Wings */}
        <mesh position={[-2.2, 1.65, -0.3]} castShadow receiveShadow material={sharedMat.graphite}>
          <boxGeometry args={[3.4, 2.65, 5.6]} />
        </mesh>
        <mesh position={[2.2, 1.95, -0.3]} castShadow receiveShadow material={sharedMat.limestone}>
          <boxGeometry args={[3.4, 3.25, 5.6]} />
        </mesh>

        {/* Elevated Smoked-Glass Skybridge Connecting Wings */}
        <mesh position={[0, 2.8, 0.2]} castShadow material={sharedMat.smokedGlass}>
          <boxGeometry args={[2.2, 1.15, 2.4]} />
        </mesh>
        <mesh position={[0, 3.44, 0.2]} material={sharedMat.graphite}>
          <boxGeometry args={[2.4, 0.14, 2.6]} />
        </mesh>

        {/* Recessed Server Louvers + Restrained Cyan Telemetry Slits */}
        <GlazedFacadeBand width={2.4} height={1.55} bays={2} position={[-2.2, 1.7, 2.52]} />
        <GlazedFacadeBand width={2.4} height={1.85} bays={2} position={[2.2, 1.95, 2.52]} />
        <mesh position={[-2.2, 0.85, 2.54]} material={sharedMat.subtleCyanStrip}>
          <boxGeometry args={[2.1, 0.04, 0.04]} />
        </mesh>
        <mesh position={[2.2, 0.95, 2.54]} material={sharedMat.subtleCyanStrip}>
          <boxGeometry args={[2.1, 0.04, 0.04]} />
        </mesh>

        {/* Shrouded Cooling Turbine Cowl */}
        <group position={[2.2, 3.85, -0.6]}>
          <mesh material={sharedMat.graphite}>
            <cylinderGeometry args={[0.95, 1.08, 0.48, 16]} />
          </mesh>
          <group ref={backendTurbineRef} position={[0, 0.28, 0]}>
            <mesh material={sharedMat.sandConcrete}>
              <boxGeometry args={[1.6, 0.06, 0.2]} />
            </mesh>
            <mesh rotation={[0, Math.PI / 2, 0]} material={sharedMat.sandConcrete}>
              <boxGeometry args={[1.6, 0.06, 0.2]} />
            </mesh>
          </group>
        </group>

        <PavilionEntrance zPos={1.5} width={2.1} />

        <BuildingLabel
          title="Backend Lab"
          subtitle="Systems & APIs"
          height={5.8}
          isApproached={approachedZone === 'backend'}
          onClick={() => setActiveModal('backend')}
        />
      </group>

      {/* ========================================================
          D. DATABASE HUB — CONCENTRIC DATA SANCTUARY [32, 0, 0]
         ======================================================== */}
      <group position={[32, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <ArchitecturalTerrace width={9.6} depth={9.2} />

        {/* Recessed Smoked-Glass Cylindrical Core */}
        <mesh position={[0, 1.85, -0.2]} castShadow receiveShadow material={sharedMat.smokedGlass}>
          <cylinderGeometry args={[3.15, 3.25, 3.0, 24]} />
        </mesh>

        {/* 12 Radial Limestone & Graphite Architectural Fins */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <mesh
              key={`db-fin-${i}`}
              position={[Math.cos(a) * 3.55, 1.9, -0.2 + Math.sin(a) * 3.55]}
              rotation={[0, -a, 0]}
              castShadow
              material={i % 2 === 0 ? sharedMat.limestone : sharedMat.graphite}
            >
              <boxGeometry args={[0.55, 3.15, 0.16]} />
            </mesh>
          );
        })}

        {/* Upper Stepped Collar & Precision Rings */}
        <mesh position={[0, 3.52, -0.2]} castShadow material={sharedMat.limestone}>
          <cylinderGeometry args={[3.9, 3.9, 0.26, 24]} />
        </mesh>
        <mesh position={[0, 4.18, -0.2]} castShadow material={sharedMat.graphite}>
          <cylinderGeometry args={[2.5, 2.7, 1.05, 20]} />
        </mesh>

        <group ref={dbRingsRef} position={[0, 4.2, -0.2]}>
          {[-0.3, 0.2].map((y, i) => (
            <mesh key={`db-r-${i}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={sharedMat.sandConcrete}>
              <torusGeometry args={[2.95, 0.075, 8, 28]} />
            </mesh>
          ))}
        </group>

        <PavilionEntrance zPos={3.5} width={2.2} />

        <BuildingLabel
          title="Database Hub"
          subtitle="SQL, NoSQL & Cache"
          height={6.2}
          isApproached={approachedZone === 'database'}
          onClick={() => setActiveModal('database')}
        />
      </group>

      {/* ========================================================
          E. CLOUD & DEVOPS — GULL-WING INFRASTRUCTURE LAB [23, 0, 23]
         ======================================================== */}
      <group position={[23, 0, 23]} rotation={[0, (-3 * Math.PI) / 4, 0]}>
        <ArchitecturalTerrace width={9.8} depth={9.0} />

        {/* Glass Atrium Core */}
        <mesh position={[0, 1.55, -0.2]} castShadow receiveShadow material={sharedMat.smokedGlass}>
          <boxGeometry args={[6.2, 2.4, 4.4]} />
        </mesh>
        <GlazedFacadeBand width={5.6} height={1.7} bays={4} position={[0, 1.55, 2.02]} />

        {/* Tapered Angled Graphite V-Columns Supporting Gull-Wing Canopy */}
        {[-3.2, 3.2].map((x, idx) => (
          <React.Fragment key={`vcol-${idx}`}>
            <mesh position={[x, 1.9, -1.9]} rotation={[0, 0, x < 0 ? 0.14 : -0.14]} castShadow material={sharedMat.graphite}>
              <cylinderGeometry args={[0.12, 0.16, 3.2, 8]} />
            </mesh>
            <mesh position={[x, 1.9, 1.5]} rotation={[0, 0, x < 0 ? 0.14 : -0.14]} castShadow material={sharedMat.graphite}>
              <cylinderGeometry args={[0.12, 0.16, 3.2, 8]} />
            </mesh>
          </React.Fragment>
        ))}

        {/* Sweeping Sculpted Gull-Wing Roof Canopy */}
        <mesh position={[0, 3.25, -0.2]} geometry={gullRoofGeo} castShadow material={sharedMat.warmOffWhite} />

        {/* Perforated Equipment Penthouse & Tracking Dish */}
        <mesh position={[-1.4, 4.05, -0.4]} castShadow material={sharedMat.graphite}>
          <boxGeometry args={[2.6, 0.85, 2.2]} />
        </mesh>
        <group ref={devopsDishRef} position={[1.7, 4.2, -0.5]}>
          <mesh position={[0, -0.3, 0]} material={sharedMat.graphite}>
            <cylinderGeometry args={[0.14, 0.22, 0.6, 10]} />
          </mesh>
          <mesh rotation={[0.55, 0, 0]} castShadow material={sharedMat.limestone}>
            <cylinderGeometry args={[1.2, 0.2, 0.35, 18]} />
          </mesh>
        </group>

        <PavilionEntrance zPos={2.02} width={2.1} />

        <BuildingLabel
          title="Cloud & DevOps"
          subtitle="Infra & CI/CD"
          height={6.3}
          isApproached={approachedZone === 'devops'}
          onClick={() => setActiveModal('devops')}
        />
      </group>

      {/* ========================================================
          F. PROJECT PLAZA — VAULTED EXHIBITION PAVILION [0, 0, 32]
         ======================================================== */}
      <group position={[0, 0, 32]} rotation={[0, Math.PI, 0]}>
        <ArchitecturalTerrace width={14.6} depth={11.0} />

        {/* Recessed Smoked-Glass Exhibition Hall */}
        <mesh position={[0, 1.75, -1.0]} castShadow receiveShadow material={sharedMat.smokedGlass}>
          <boxGeometry args={[11.6, 2.8, 5.4]} />
        </mesh>

        {/* Colonnade Piers */}
        {[-5.9, -3.0, 3.0, 5.9].map((x, idx) => (
          <mesh key={`pp-col-${idx}`} position={[x, 1.8, 1.9]} castShadow material={sharedMat.limestone}>
            <boxGeometry args={[0.42, 2.9, 0.42]} />
          </mesh>
        ))}

        {/* Sweeping Parabolic Arch Canopy Roof */}
        <mesh position={[0, 3.2, -1.0]} geometry={archRoofGeo} castShadow material={sharedMat.warmOffWhite} />

        <PavilionEntrance zPos={1.72} width={2.6} />

        {/* 4 Angled Monolithic Limestone Exhibition Plinths */}
        {PROJECTS_DATA.map((proj, idx) => {
          const xOffset = -4.95 + idx * 3.3;
          return (
            <group key={proj.id} position={[xOffset, 0.34, 4.4]}>
              <mesh position={[0, 0.45, 0]} castShadow receiveShadow material={sharedMat.sandConcrete}>
                <boxGeometry args={[1.45, 0.9, 0.78]} />
              </mesh>
              <mesh position={[0, 1.28, 0]} rotation={[-0.22, 0, 0]} material={sharedMat.graphite}>
                <boxGeometry args={[1.82, 0.98, 0.1]} />
              </mesh>
              <mesh position={[0, 1.28, 0.04]} rotation={[-0.22, 0, 0]} material={sharedMat.smokedGlass}>
                <boxGeometry args={[1.66, 0.84, 0.06]} />
              </mesh>
              {showWorldLabels && (
                <Html position={[0, 2.15, 0]} center distanceFactor={20} zIndexRange={[9, 0]}>
                  <button
                    type="button"
                    onClick={() => {
                      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
                      openProjectModal(proj);
                    }}
                    className="cursor-pointer w-28 px-2 py-1 rounded-lg bg-[#0B1420]/90 border border-white/15 hover:border-[#43D9F5] text-[#F4F7FA] shadow-md hover:scale-105 transition-transform text-left"
                  >
                    <div className="font-mono text-[8px] font-bold text-[#43D9F5] truncate">
                      #{idx + 1} {proj.title}
                    </div>
                    <div className="text-[8px] text-[#9AAFC2] font-medium">Inspect →</div>
                  </button>
                </Html>
              )}
            </group>
          );
        })}

        <BuildingLabel
          title="Project Plaza"
          subtitle="Featured Systems"
          height={7.2}
          isApproached={approachedZone === 'projects'}
          onClick={() => setActiveModal('projects')}
        />
      </group>

      {/* ========================================================
          G. EXPERIENCE CENTER — GALLERY ROTUNDA [-23, 0, 23]
         ======================================================== */}
      <group position={[-23, 0, 23]} rotation={[0, (3 * Math.PI) / 4, 0]}>
        <ArchitecturalTerrace width={9.6} depth={9.2} />

        {/* Limestone Gallery Drum */}
        <mesh position={[0, 1.75, -0.2]} castShadow receiveShadow material={sharedMat.limestone}>
          <cylinderGeometry args={[3.45, 3.65, 2.75, 24]} />
        </mesh>
        {/* Outer Colonnade Arcade */}
        {Array.from({ length: 8 }).map((_, idx) => {
          const a = (idx / 8) * Math.PI * 2 + 0.35;
          return (
            <mesh
              key={`exp-col-${idx}`}
              position={[Math.cos(a) * 3.85, 1.75, -0.2 + Math.sin(a) * 3.85]}
              castShadow
              material={sharedMat.graphite}
            >
              <cylinderGeometry args={[0.14, 0.17, 2.8, 10]} />
            </mesh>
          );
        })}
        {/* Clerestory Smoked Glass Ring & Stepped Roof Cupola */}
        <mesh position={[0, 3.65, -0.2]} castShadow material={sharedMat.smokedGlass}>
          <cylinderGeometry args={[2.75, 2.95, 1.0, 24]} />
        </mesh>
        <mesh position={[0, 4.22, -0.2]} castShadow material={sharedMat.warmOffWhite}>
          <cylinderGeometry args={[3.95, 4.1, 0.18, 24]} />
        </mesh>
        <mesh position={[0, 4.55, -0.2]} castShadow material={sharedMat.sandConcrete}>
          <cylinderGeometry args={[1.9, 2.85, 0.55, 24]} />
        </mesh>

        <PavilionEntrance zPos={3.45} width={2.2} />

        <BuildingLabel
          title="Experience Center"
          subtitle="Career & Education"
          height={6.6}
          isApproached={approachedZone === 'experience'}
          onClick={() => setActiveModal('experience')}
        />
      </group>

      {/* ========================================================
          H. CONTACT STATION — COASTAL COMMS PAVILION [-32, 0, 0]
         ======================================================== */}
      <group position={[-32, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <ArchitecturalTerrace width={9.4} depth={8.8} />

        {/* Low Horizontal Reception Pavilion */}
        <mesh position={[0, 1.38, 0.35]} castShadow receiveShadow material={sharedMat.limestone}>
          <boxGeometry args={[7.2, 2.0, 4.4]} />
        </mesh>
        <GlazedFacadeBand width={2.0} height={1.25} bays={2} position={[-2.3, 1.4, 2.57]} />
        <GlazedFacadeBand width={2.0} height={1.25} bays={2} position={[2.3, 1.4, 2.57]} />
        <mesh position={[0, 2.45, 0.35]} castShadow material={sharedMat.graphite}>
          <boxGeometry args={[7.6, 0.16, 4.8]} />
        </mesh>

        {/* Tapered Coastal Architectural Beacon Tower */}
        <mesh position={[0, 3.6, -1.0]} castShadow receiveShadow material={sharedMat.warmOffWhite}>
          <cylinderGeometry args={[1.15, 1.55, 2.3, 20]} />
        </mesh>
        {/* Subtle Burnt-Orange Architectural Band Matching Coupe */}
        <mesh position={[0, 4.95, -1.0]} castShadow>
          <cylinderGeometry args={[1.08, 1.15, 0.45, 20]} />
          <meshStandardMaterial color="#cf562e" roughness={0.42} metalness={0.2} />
        </mesh>
        {/* Warm Lantern Observation Gallery */}
        <mesh position={[0, 5.6, -1.0]} material={sharedMat.warmArchitecturalLight}>
          <cylinderGeometry args={[0.92, 0.96, 0.85, 20]} />
        </mesh>
        <group ref={contactBeaconRef} position={[0, 5.6, -1.0]}>
          <mesh position={[0, 0, 1.0]} material={sharedMat.graphite}>
            <boxGeometry args={[0.24, 0.32, 0.08]} />
          </mesh>
        </group>
        <mesh position={[0, 6.25, -1.0]} castShadow material={sharedMat.graphite}>
          <cylinderGeometry args={[0.35, 1.18, 0.48, 20]} />
        </mesh>
        <mesh position={[0, 7.05, -1.0]} material={sharedMat.graphite}>
          <cylinderGeometry args={[0.03, 0.06, 1.2, 8]} />
        </mesh>

        <PavilionEntrance zPos={2.57} width={2.2} />

        <BuildingLabel
          title="Contact Station"
          subtitle="Comms & Resume"
          height={8.6}
          isApproached={approachedZone === 'contact'}
          onClick={() => setActiveModal('contact')}
        />
      </group>
    </group>
  );
});
