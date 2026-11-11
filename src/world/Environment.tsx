import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { sharedGeo, sharedMat } from './sharedAssets';
import { proceduralTextures } from './textures';
import {
  PERIMETER_CURVE,
  SPOKE_CURVES,
  buildCurveDashes,
  buildSplineRibbonGeometry,
} from './roadBuilder';
import {
  buildIslandUnderbodyGeometry,
  buildSculptedTerrainGeometry,
  buildShoreFoamGeometry,
  getTerrainHeight,
} from './terrainBuilder';
import {
  createBroadleafTreeGeometries,
  createCoastalGrassGeometry,
  createCoastalPineGeometries,
  createNaturalRockGeometry,
  createOrganicShrubGeometry,
} from './vegetationBuilder';

interface InstanceSpec {
  pos: [number, number, number];
  rot?: [number, number, number];
  scale?: [number, number, number];
}

const _dummy = new THREE.Object3D();

const StaticInstanced: React.FC<{
  items: InstanceSpec[];
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  castShadow?: boolean;
  receiveShadow?: boolean;
}> = React.memo(({ items, geometry, material, castShadow = false, receiveShadow = false }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      _dummy.position.set(it.pos[0], it.pos[1], it.pos[2]);
      if (it.rot) {
        _dummy.rotation.set(it.rot[0], it.rot[1], it.rot[2]);
      } else {
        _dummy.rotation.set(0, 0, 0);
      }
      if (it.scale) {
        _dummy.scale.set(it.scale[0], it.scale[1], it.scale[2]);
      } else {
        _dummy.scale.set(1, 1, 1);
      }
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [items]);

  if (items.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, items.length]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      frustumCulled={false}
    />
  );
});

/** Smooth sunlit coastal atmospheric scattering dome. */
const SkyAtmosphericDome: React.FC = React.memo(() => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          uSunDir: { value: new THREE.Vector3(48, 56, 34).normalize() },
        },
        vertexShader: `
          varying vec3 vWorldDir;
          void main() {
            vWorldDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uSunDir;
          varying vec3 vWorldDir;
          void main() {
            float h = clamp(vWorldDir.y, 0.0, 1.0);
            vec3 horizon = vec3(0.824, 0.902, 0.918);
            vec3 mid = vec3(0.557, 0.745, 0.816);
            vec3 zenith = vec3(0.286, 0.514, 0.635);
            vec3 col = mix(horizon, mid, smoothstep(0.0, 0.25, h));
            col = mix(col, zenith, smoothstep(0.25, 0.82, h));
            float sunDot = max(dot(normalize(vWorldDir), uSunDir), 0.0);
            col += vec3(1.0, 0.94, 0.82) * pow(sunDot, 24.0) * 0.22;
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    []
  );

  useEffect(() => () => mat.dispose(), [mat]);

  return (
    <mesh material={mat}>
      <sphereGeometry args={[260, 24, 16]} />
    </mesh>
  );
});

/** Stylized desaturated deep-teal ocean shader with subtle surface shimmer & coastal shallows. */
const StylizedOcean: React.FC<{ timeRef: React.MutableRefObject<number> }> = React.memo(({ timeRef }) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
        },
        vertexShader: `
          varying vec2 vXZ;
          void main() {
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vXZ = worldPos.xz;
            gl_Position = projectionMatrix * viewMatrix * worldPos;
          }
        `,
        fragmentShader: `
          uniform float uTime;
          varying vec2 vXZ;
          void main() {
            float dist = length(vXZ);
            vec3 turquoiseShallows = vec3(0.188, 0.494, 0.541);
            vec3 deepTeal = vec3(0.086, 0.298, 0.353);
            vec3 horizonHaze = vec3(0.824, 0.902, 0.918);

            float shoreBand = smoothstep(43.0, 88.0, dist);
            vec3 water = mix(turquoiseShallows, deepTeal, shoreBand);

            float wave = sin(dist * 0.45 - uTime * 1.05 + sin(vXZ.x * 0.08 + vXZ.y * 0.06) * 1.6);
            float shimmer = smoothstep(0.76, 0.99, wave) * (1.0 - smoothstep(45.0, 120.0, dist));
            water += vec3(0.16, 0.23, 0.25) * shimmer * 0.35;

            float fogT = smoothstep(105.0, 245.0, dist);
            water = mix(water, horizonHaze, fogT);
            gl_FragColor = vec4(water, 1.0);
          }
        `,
      }),
    []
  );

  useFrame(() => {
    mat.uniforms.uTime.value = timeRef.current;
  });

  useEffect(() => () => mat.dispose(), [mat]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.78, 0]} material={mat}>
      <circleGeometry args={[260, 56]} />
    </mesh>
  );
});

const DistantHeadland: React.FC<{
  position: [number, number, number];
  scale?: number;
  rotationY?: number;
}> = React.memo(({ position, scale = 1, rotationY = 0 }) => (
  <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
    <mesh position={[0, -2.2, 0]} material={sharedMat.rockSlate}>
      <cylinderGeometry args={[7.5, 4.2, 6.0, 9]} />
    </mesh>
    <mesh position={[0, 1.0, 0]}>
      <cylinderGeometry args={[4.4, 7.6, 1.8, 9]} />
      <meshStandardMaterial color="#677c58" roughness={0.9} flatShading />
    </mesh>
  </group>
));

const JumpRamp: React.FC<{ position: [number, number, number]; rotationY?: number }> = React.memo(
  ({ position, rotationY = 0 }) => (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.42, 0]} rotation={[0.21, 0, 0]} receiveShadow material={sharedMat.sandConcrete}>
        <boxGeometry args={[3.1, 0.18, 3.4]} />
      </mesh>
      <mesh position={[0, 0.53, -0.95]} rotation={[0.21, 0, 0]}>
        <boxGeometry args={[2.7, 0.04, 0.32]} />
        <meshStandardMaterial color="#cf562e" roughness={0.45} />
      </mesh>
      <mesh position={[-1.48, 0.47, 0]} rotation={[0.21, 0, 0]} material={sharedMat.graphite}>
        <boxGeometry args={[0.14, 0.28, 3.4]} />
      </mesh>
      <mesh position={[1.48, 0.47, 0]} rotation={[0.21, 0, 0]} material={sharedMat.graphite}>
        <boxGeometry args={[0.14, 0.28, 3.4]} />
      </mesh>
    </group>
  )
);

const TimberPier: React.FC<{ position: [number, number, number]; rotationY?: number }> = React.memo(
  ({ position, rotationY = 0 }) => (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.1, 2.4]} receiveShadow material={sharedMat.cedarWood}>
        <boxGeometry args={[2.0, 0.12, 5.0]} />
      </mesh>
      {[0.6, 2.5, 4.4].map((z, i) => (
        <React.Fragment key={i}>
          <mesh position={[-0.82, -0.45, z]} material={sharedMat.barkWood}>
            <cylinderGeometry args={[0.11, 0.13, 1.4, 6]} />
          </mesh>
          <mesh position={[0.82, -0.45, z]} material={sharedMat.barkWood}>
            <cylinderGeometry args={[0.11, 0.13, 1.4, 6]} />
          </mesh>
        </React.Fragment>
      ))}
      <mesh position={[0.78, 0.52, 4.5]} material={sharedMat.warmArchitecturalLight}>
        <boxGeometry args={[0.18, 0.22, 0.18]} />
      </mesh>
    </group>
  )
);

export const Environment: React.FC = React.memo(() => {
  const qualityLevel = useStore((s) => s.qualityLevel);
  const foamInnerRef = useRef<THREE.Mesh>(null);
  const cloudsGroupRef = useRef<THREE.Group>(null);
  const waterTimeRef = useRef<number>(0);

  // Build sculpted island, curved roads & organic vegetation assets once
  const {
    terrainGeo,
    underbodyGeo,
    foamGeo,
    roadGeos,
    curbGeos,
    roadDashes,
    broadleafGeo,
    pineGeo,
    shrubGeo,
    grassGeo,
    rockGeo,
  } = useMemo(() => {
    const tGeo = buildSculptedTerrainGeometry();
    const uGeo = buildIslandUnderbodyGeometry();
    const fGeo = buildShoreFoamGeometry(-0.35, 1.35);

    const perimAsphalt = buildSplineRibbonGeometry(PERIMETER_CURVE, 110, 1.75, 0.17, true, 0.18);
    const perimCurb = buildSplineRibbonGeometry(PERIMETER_CURVE, 110, 2.18, 0.145, true, 0.18);
    const spokeAsphalts = SPOKE_CURVES.map((c) => buildSplineRibbonGeometry(c, 24, 1.65, 0.17, false, 0.2));
    const spokeCurbs = SPOKE_CURVES.map((c) => buildSplineRibbonGeometry(c, 24, 2.08, 0.145, false, 0.2));

    const dashes = [
      ...buildCurveDashes(PERIMETER_CURVE, 36, 0.182),
      ...SPOKE_CURVES.slice(0, 4).flatMap((c) => buildCurveDashes(c, 5, 0.182)),
    ];

    const broadleaf = createBroadleafTreeGeometries();
    const pine = createCoastalPineGeometries();

    return {
      terrainGeo: tGeo,
      underbodyGeo: uGeo,
      foamGeo: fGeo,
      roadGeos: [perimAsphalt, ...spokeAsphalts],
      curbGeos: [perimCurb, ...spokeCurbs],
      roadDashes: dashes,
      broadleafGeo: broadleaf,
      pineGeo: pine,
      shrubGeo: createOrganicShrubGeometry(),
      grassGeo: createCoastalGrassGeometry(),
      rockGeo: createNaturalRockGeometry(),
    };
  }, []);

  const terrainMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        map: proceduralTextures.terrainDetail,
        roughness: 0.9,
        metalness: 0.01,
      }),
    []
  );
  const underbodyMat = useMemo(
    () => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, flatShading: true }),
    []
  );
  const foliageVertexMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.84,
        metalness: 0.02,
        flatShading: true,
      }),
    []
  );

  useEffect(() => {
    return () => {
      terrainGeo.dispose();
      underbodyGeo.dispose();
      foamGeo.dispose();
      roadGeos.forEach((g) => g.dispose());
      curbGeos.forEach((g) => g.dispose());
      broadleafGeo.trunkGeo?.dispose();
      broadleafGeo.foliageGeo?.dispose();
      pineGeo.trunkGeo?.dispose();
      pineGeo.foliageGeo?.dispose();
      shrubGeo?.dispose();
      grassGeo.dispose();
      rockGeo.dispose();
      terrainMat.dispose();
      underbodyMat.dispose();
      foliageVertexMat.dispose();
    };
  }, [
    terrainGeo,
    underbodyGeo,
    foamGeo,
    roadGeos,
    curbGeos,
    broadleafGeo,
    pineGeo,
    shrubGeo,
    grassGeo,
    rockGeo,
    terrainMat,
    underbodyMat,
    foliageVertexMat,
  ]);

  const cloudSpecs = useMemo(
    () => [
      { pos: [-58, 26, -54] as [number, number, number], scale: 1.9, speed: 0.25 },
      { pos: [52, 29, -36] as [number, number, number], scale: 2.1, speed: 0.2 },
      { pos: [-62, 24, 38] as [number, number, number], scale: 1.7, speed: 0.28 },
      { pos: [42, 27, 58] as [number, number, number], scale: 2.0, speed: 0.22 },
    ],
    []
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    waterTimeRef.current = t;

    if (qualityLevel !== 'low') {
      if (foamInnerRef.current) {
        const s = 1 + Math.sin(t * 1.2) * 0.006;
        foamInnerRef.current.scale.set(s, 1, s);
      }
      if (cloudsGroupRef.current) {
        const children = cloudsGroupRef.current.children;
        for (let i = 0; i < children.length; i++) {
          const c = children[i];
          c.position.x += delta * cloudSpecs[i].speed;
          if (c.position.x > 120) c.position.x = -120;
        }
      }
    }
  });

  // Natural asymmetric vegetation placements grounded on getTerrainHeight
  const { broadleafInstances, pineInstances, shrubInstances, grassInstances, rockInstances, lampPoles, lampArms, lampBulbs } =
    useMemo(() => {
      const broadleafSpots: Array<[number, number, number, number]> = [
        [-12.6, -29.0, 1.05, 0.4],
        [-9.8, -25.8, 0.82, 1.8],
        [13.4, -27.6, 1.12, 2.5],
        [28.5, -13.2, 0.96, 0.9],
        [35.4, -10.8, 1.16, 3.2],
        [27.6, 12.6, 1.02, 4.4],
        [13.0, 29.2, 0.92, 1.2],
        [-13.8, 28.0, 1.12, 2.9],
        [-29.2, 12.6, 0.88, 5.1],
        [-35.4, -12.6, 1.08, 0.3],
        [-10.8, -10.6, 0.8, 2.1],
        [10.8, 10.6, 0.82, 3.8],
      ];

      const pineSpots: Array<[number, number, number, number]> = [
        [-16.2, -33.2, 1.15, 0.5],
        [11.5, -32.0, 0.92, 1.9],
        [34.0, -16.2, 1.06, 2.8],
        [35.0, 14.0, 1.16, 4.1],
        [15.8, 33.2, 1.0, 0.8],
        [-16.6, 33.8, 1.1, 3.4],
        [-34.6, 15.0, 0.98, 5.2],
        [-28.2, -14.4, 0.9, 1.4],
        [11.0, -11.2, 0.82, 2.7],
        [39.8, -4.5, 1.08, 4.8],
        [-39.6, 6.2, 1.04, 0.9],
      ];

      const shrubSpots: Array<[number, number, number, number]> = [
        [-12.0, -24.2, 1.0, 0.4], [-14.8, -26.5, 0.8, 2.1], [14.0, -25.2, 1.05, 1.2],
        [25.8, -14.8, 0.9, 3.3], [29.4, -10.2, 0.95, 4.2], [26.8, 15.0, 1.0, 0.8],
        [14.0, 25.8, 0.85, 2.5], [-11.8, 25.0, 1.0, 5.0], [-26.2, 14.4, 0.92, 1.7],
        [-26.4, -14.6, 0.88, 3.9], [-9.2, -11.2, 0.78, 0.6], [9.2, 11.2, 0.82, 2.9],
        [37.2, 16.2, 0.95, 4.6], [-37.0, -15.8, 0.9, 1.1],
      ];

      const grassCoords: Array<[number, number, number, number]> = [
        [-11.2, -23.4, 1.1, 0.2], [-15.2, -28.0, 0.95, 1.5], [12.4, -26.4, 1.15, 2.8],
        [26.2, -12.0, 1.0, 0.7], [30.2, -15.4, 0.9, 3.4], [25.6, 13.8, 1.1, 4.1],
        [15.2, 26.8, 0.95, 1.9], [-13.4, 24.4, 1.05, 5.2], [-24.6, 12.8, 1.1, 2.3],
        [-25.2, -13.2, 0.9, 0.9], [39.2, 8.2, 1.2, 3.6], [-39.0, -8.8, 1.15, 1.4],
        [22.4, -34.2, 1.1, 4.8], [-22.6, 34.4, 1.05, 2.1], [35.4, -25.2, 1.0, 0.5],
        [-35.8, 25.6, 1.1, 3.0],
      ];

      const rockCoords: Array<[number, number, number, number, number, number]> = [
        [-37.5, -22.5, 1.45, 0.85, 1.15, 0.3],
        [-39.0, -21.0, 0.85, 0.55, 0.75, 1.7],
        [38.2, -20.4, 1.5, 0.9, 1.25, 2.4],
        [36.8, 24.5, 1.35, 0.8, 1.35, 0.8],
        [-38.2, 22.8, 1.4, 0.85, 1.1, 3.6],
        [13.6, -38.8, 1.15, 0.65, 1.0, 1.2],
        [-15.2, 38.6, 1.25, 0.75, 1.15, 4.4],
        [43.6, 7.6, 1.6, 0.95, 1.4, 2.1],
        [-43.8, -8.4, 1.65, 0.95, 1.3, 5.0],
        [25.2, -29.8, 0.95, 0.58, 0.85, 1.5],
      ];

      const lampSpecs = [
        { x: 3.1, z: -9.5, rot: Math.PI },
        { x: -3.1, z: 9.5, rot: 0 },
        { x: 9.5, z: 3.1, rot: -Math.PI / 2 },
        { x: -9.5, z: -3.1, rot: Math.PI / 2 },
        { x: 15.6, z: -15.6, rot: -Math.PI / 4 },
        { x: -15.6, z: 15.6, rot: (3 * Math.PI) / 4 },
      ];

      return {
        broadleafInstances: broadleafSpots.map(([x, z, s, r]) => ({
          pos: [x, getTerrainHeight(x, z) - 0.05, z] as [number, number, number],
          rot: [0, r, 0] as [number, number, number],
          scale: [s, s, s] as [number, number, number],
        })),
        pineInstances: pineSpots.map(([x, z, s, r]) => ({
          pos: [x, getTerrainHeight(x, z) - 0.05, z] as [number, number, number],
          rot: [0, r, 0] as [number, number, number],
          scale: [s, s, s] as [number, number, number],
        })),
        shrubInstances: shrubSpots.map(([x, z, s, r]) => ({
          pos: [x, getTerrainHeight(x, z) - 0.04, z] as [number, number, number],
          rot: [0, r, 0] as [number, number, number],
          scale: [s, s, s] as [number, number, number],
        })),
        grassInstances: grassCoords.map(([x, z, s, r]) => ({
          pos: [x, getTerrainHeight(x, z) - 0.03, z] as [number, number, number],
          rot: [0, r, 0] as [number, number, number],
          scale: [s, s, s] as [number, number, number],
        })),
        rockInstances: rockCoords.map(([x, z, sx, sy, sz, r]) => ({
          pos: [x, getTerrainHeight(x, z) + sy * 0.22, z] as [number, number, number],
          rot: [0.08, r, 0.05] as [number, number, number],
          scale: [sx, sy, sz] as [number, number, number],
        })),
        lampPoles: lampSpecs.map((l) => ({
          pos: [l.x, 1.4, l.z] as [number, number, number],
          scale: [0.065, 2.6, 0.065] as [number, number, number],
        })),
        lampArms: lampSpecs.map((l) => ({
          pos: [l.x + Math.cos(l.rot) * 0.24, 2.68, l.z - Math.sin(l.rot) * 0.24] as [number, number, number],
          rot: [0, l.rot, 0] as [number, number, number],
          scale: [0.52, 0.06, 0.09] as [number, number, number],
        })),
        lampBulbs: lampSpecs.map((l) => ({
          pos: [l.x + Math.cos(l.rot) * 0.45, 2.6, l.z - Math.sin(l.rot) * 0.45] as [number, number, number],
          scale: [0.1, 0.1, 0.1] as [number, number, number],
        })),
      };
    }, []);

  const shadowSize = qualityLevel === 'high' ? 1024 : 512;

  return (
    <>
      <SkyAtmosphericDome />

      {/* ========================================================
          0. CINEMATIC DAYLIGHT & HEMISPHERE FILL
         ======================================================== */}
      <hemisphereLight args={['#dcecf0', '#5b694d', 1.05]} />
      <ambientLight intensity={0.18} color="#f8f6f0" />

      <directionalLight
        position={[48, 56, 34]}
        intensity={1.85}
        color="#fff2d9"
        castShadow={qualityLevel !== 'low'}
        shadow-mapSize-width={shadowSize}
        shadow-mapSize-height={shadowSize}
        shadow-bias={-0.0005}
        shadow-normalBias={0.025}
        shadow-camera-near={10}
        shadow-camera-far={155}
        shadow-camera-left={-48}
        shadow-camera-right={48}
        shadow-camera-top={48}
        shadow-camera-bottom={-48}
      />

      <directionalLight position={[-42, 26, -34]} intensity={0.42} color="#b4d6e0" />

      {/* ========================================================
          1. STYLIZED OCEAN, SHORELINE FOAM & DISTANT HEADLANDS
         ======================================================== */}
      <StylizedOcean timeRef={waterTimeRef} />

      <mesh ref={foamInnerRef} geometry={foamGeo} position={[0, -0.7, 0]}>
        <meshBasicMaterial color="#e4f2f4" transparent opacity={0.5} />
      </mesh>

      {qualityLevel !== 'low' && (
        <>
          <DistantHeadland position={[-98, 0.5, -78]} scale={1.45} rotationY={0.6} />
          <DistantHeadland position={[102, 1.0, -72]} scale={1.25} rotationY={2.1} />
          <DistantHeadland position={[106, 0.2, 70]} scale={1.35} rotationY={4.0} />
        </>
      )}

      <TimberPier position={[43.4, -0.35, 10.5]} rotationY={Math.PI / 2} />
      <TimberPier position={[-43.4, -0.35, -10.5]} rotationY={-Math.PI / 2} />

      {/* ========================================================
          2. SCULPTED COASTAL ISLAND & CLIFF STRATA
         ======================================================== */}
      <mesh geometry={terrainGeo} material={terrainMat} receiveShadow />
      <mesh geometry={underbodyGeo} material={underbodyMat} />

      {/* ========================================================
          3. RESTRAINED ARCHITECTURAL CENTRAL PLAZA
         ======================================================== */}
      <mesh position={[0, 0.1, 0]} receiveShadow material={sharedMat.stoneCurb}>
        <cylinderGeometry args={[5.8, 6.1, 0.14, 28]} />
      </mesh>
      <mesh position={[0, 0.135, 0]} receiveShadow material={sharedMat.asphalt}>
        <cylinderGeometry args={[5.2, 5.2, 0.13, 28]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.21, 0]} material={sharedMat.sandConcrete}>
        <ringGeometry args={[2.1, 2.35, 28]} />
      </mesh>

      {/* ========================================================
          4. GENTLY CURVED ASPHALT ROAD SPLINES & STONE CURBS
         ======================================================== */}
      {curbGeos.map((geo, idx) => (
        <mesh key={`curb-${idx}`} geometry={geo} material={sharedMat.stoneCurb} receiveShadow />
      ))}
      {roadGeos.map((geo, idx) => (
        <mesh key={`road-${idx}`} geometry={geo} material={sharedMat.asphalt} receiveShadow />
      ))}

      <StaticInstanced items={roadDashes} geometry={sharedGeo.box1} material={sharedMat.roadMarking} />
      <StaticInstanced items={lampPoles} geometry={sharedGeo.cyl8} material={sharedMat.graphite} />
      <StaticInstanced items={lampArms} geometry={sharedGeo.box1} material={sharedMat.graphite} />
      <StaticInstanced items={lampBulbs} geometry={sharedGeo.sphereLow} material={sharedMat.warmArchitecturalLight} />

      <JumpRamp position={[12.5, 0.1, 0]} rotationY={Math.PI / 2} />
      <JumpRamp position={[-12.5, 0.1, 0]} rotationY={-Math.PI / 2} />

      {/* ========================================================
          5. INSTANCED ORGANIC BROADLEAF TREES, SHRUBS, GRASS & ROCKS
         ======================================================== */}
      {broadleafGeo.trunkGeo && (
        <StaticInstanced
          items={broadleafInstances}
          geometry={broadleafGeo.trunkGeo}
          material={sharedMat.barkWood}
          castShadow={qualityLevel === 'high'}
        />
      )}
      {broadleafGeo.foliageGeo && (
        <StaticInstanced
          items={broadleafInstances}
          geometry={broadleafGeo.foliageGeo}
          material={foliageVertexMat}
          castShadow={qualityLevel === 'high'}
        />
      )}

      {pineGeo.trunkGeo && (
        <StaticInstanced
          items={pineInstances}
          geometry={pineGeo.trunkGeo}
          material={sharedMat.barkWood}
          castShadow={qualityLevel === 'high'}
        />
      )}
      {pineGeo.foliageGeo && (
        <StaticInstanced
          items={pineInstances}
          geometry={pineGeo.foliageGeo}
          material={foliageVertexMat}
          castShadow={qualityLevel === 'high'}
        />
      )}

      <StaticInstanced items={rockInstances} geometry={rockGeo} material={sharedMat.rockSlate} />

      {qualityLevel !== 'low' && (
        <>
          {shrubGeo && <StaticInstanced items={shrubInstances} geometry={shrubGeo} material={foliageVertexMat} />}
          <StaticInstanced items={grassInstances} geometry={grassGeo} material={foliageVertexMat} />
        </>
      )}

      {/* Soft Distant Clouds */}
      <group ref={cloudsGroupRef}>
        {cloudSpecs.map((c, idx) => (
          <group key={`cloud-${idx}`} position={c.pos} scale={c.scale}>
            <mesh material={sharedMat.warmOffWhite}>
              <icosahedronGeometry args={[2.2, 1]} />
            </mesh>
            <mesh position={[-1.8, -0.35, 0.25]} material={sharedMat.warmOffWhite}>
              <icosahedronGeometry args={[1.45, 1]} />
            </mesh>
            <mesh position={[1.7, -0.25, -0.2]} material={sharedMat.warmOffWhite}>
              <icosahedronGeometry args={[1.4, 1]} />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
});
