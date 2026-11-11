import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

function createTaperedBranch(
  points: THREE.Vector3[],
  rBottom: number,
  rTop: number,
  radialSegs = 6,
  tubularSegs = 6
): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(points);
  const geo = new THREE.TubeGeometry(curve, tubularSegs, 1, radialSegs, false);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  const c = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    const ringIdx = Math.floor(i / (radialSegs + 1));
    const t = Math.min(1, ringIdx / tubularSegs);
    curve.getPointAt(t, c);
    v.fromBufferAttribute(pos, i).sub(c);
    const radius = THREE.MathUtils.lerp(rBottom, rTop, t);
    v.multiplyScalar(radius).add(c);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds an irregular multi-faceted botanical leaf cluster (never a sphere or cone) with vertex AO shading.
 */
function createLeafClusterPad(
  center: THREE.Vector3,
  rx: number,
  ry: number,
  rz: number,
  seed: number,
  baseColor: THREE.Color,
  topColor: THREE.Color
): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const cTmp = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Flatten underside and perturb vertices organically for asymmetric leaf pad silhouettes
    if (y < 0) y *= 0.48;
    const n =
      0.22 * Math.sin(x * 4.3 + seed) +
      0.18 * Math.cos(z * 3.9 - seed * 0.7) +
      0.14 * Math.sin((x + y) * 5.1 + seed);

    x = x * rx * (1 + n) + center.x;
    y = y * ry * (1 + n * 0.5) + center.y;
    z = z * rz * (1 - n * 0.7) + center.z;
    pos.setXYZ(i, x, y, z);

    const hFactor = THREE.MathUtils.clamp((pos.getY(i) - (center.y - ry * 0.5)) / (ry * 1.4), 0, 1);
    cTmp.lerpColors(baseColor, topColor, hFactor);
    colors[i * 3] = cTmp.r;
    colors[i * 3 + 1] = cTmp.g;
    colors[i * 3 + 2] = cTmp.b;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

/**
 * Broadleaf coastal oak / olive tree with gnarled multi-limb trunk and layered irregular leaf pads.
 */
export function createBroadleafTreeGeometries() {
  const trunkParts: THREE.BufferGeometry[] = [
    // Main curving trunk
    createTaperedBranch(
      [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.08, 0.85, -0.05),
        new THREE.Vector3(-0.04, 1.85, 0.08),
        new THREE.Vector3(0.06, 2.55, 0.02),
      ],
      0.28,
      0.12,
      7,
      7
    ),
    // Limb 1 (NE)
    createTaperedBranch(
      [
        new THREE.Vector3(0.02, 1.75, 0.04),
        new THREE.Vector3(0.55, 2.35, 0.38),
        new THREE.Vector3(1.05, 2.85, 0.62),
      ],
      0.13,
      0.045,
      6,
      5
    ),
    // Limb 2 (NW)
    createTaperedBranch(
      [
        new THREE.Vector3(-0.02, 1.9, 0.05),
        new THREE.Vector3(-0.58, 2.45, -0.35),
        new THREE.Vector3(-1.02, 2.9, -0.58),
      ],
      0.12,
      0.04,
      6,
      5
    ),
    // Limb 3 (S)
    createTaperedBranch(
      [
        new THREE.Vector3(0.03, 2.1, -0.02),
        new THREE.Vector3(-0.18, 2.7, 0.58),
        new THREE.Vector3(-0.32, 3.15, 0.95),
      ],
      0.1,
      0.035,
      5,
      4
    ),
  ];

  const cShadow = new THREE.Color('#3f5538');
  const cMid = new THREE.Color('#657e52');
  const cSun = new THREE.Color('#7f945d');

  const leafCenters: Array<[THREE.Vector3, number, number, number, number]> = [
    [new THREE.Vector3(0.05, 3.25, 0.02), 1.35, 0.72, 1.25, 1.1],
    [new THREE.Vector3(1.05, 2.95, 0.58), 1.08, 0.58, 0.98, 2.3],
    [new THREE.Vector3(-1.02, 3.0, -0.55), 1.05, 0.56, 1.02, 3.7],
    [new THREE.Vector3(-0.3, 3.2, 0.95), 0.96, 0.52, 0.92, 5.1],
    [new THREE.Vector3(0.55, 3.45, -0.55), 0.92, 0.5, 0.88, 6.4],
    [new THREE.Vector3(-0.45, 3.5, 0.15), 0.88, 0.48, 0.85, 7.9],
  ];

  const foliageParts = leafCenters.map(([pos, rx, ry, rz, seed], idx) =>
    createLeafClusterPad(
      pos,
      rx,
      ry,
      rz,
      seed,
      cShadow,
      idx % 2 === 0 ? cMid : cSun
    )
  );

  return {
    trunkGeo: mergeGeometries(trunkParts),
    foliageGeo: mergeGeometries(foliageParts),
  };
}

/**
 * Sculpted coastal cypress / windswept pine with slender curved stem and tiered organic bough pads.
 */
export function createCoastalPineGeometries() {
  const trunkGeo = createTaperedBranch(
    [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.1, 1.1, 0.04),
      new THREE.Vector3(0.02, 2.4, -0.06),
      new THREE.Vector3(-0.08, 3.7, 0.02),
    ],
    0.2,
    0.05,
    6,
    7
  );

  const cShadow = new THREE.Color('#2f4832');
  const cTop = new THREE.Color('#53724c');

  const tiers: Array<[THREE.Vector3, number, number, number, number]> = [
    [new THREE.Vector3(0.22, 1.95, 0.12), 1.15, 0.36, 1.0, 1.5],
    [new THREE.Vector3(-0.24, 2.5, -0.14), 1.02, 0.34, 0.94, 2.9],
    [new THREE.Vector3(0.16, 3.05, -0.18), 0.86, 0.3, 0.82, 4.2],
    [new THREE.Vector3(-0.12, 3.55, 0.14), 0.68, 0.28, 0.66, 5.8],
    [new THREE.Vector3(-0.06, 4.0, 0.02), 0.45, 0.24, 0.45, 7.1],
  ];

  const foliageParts = tiers.map(([pos, rx, ry, rz, seed]) =>
    createLeafClusterPad(pos, rx, ry, rz, seed, cShadow, cTop)
  );

  return {
    trunkGeo,
    foliageGeo: mergeGeometries(foliageParts),
  };
}

/**
 * Sculpted low botanical shrub cluster.
 */
export function createOrganicShrubGeometry(): THREE.BufferGeometry {
  const cDark = new THREE.Color('#3b5136');
  const cLight = new THREE.Color('#667f52');
  const parts = [
    createLeafClusterPad(new THREE.Vector3(0, 0.28, 0), 0.72, 0.38, 0.65, 1.4, cDark, cLight),
    createLeafClusterPad(new THREE.Vector3(0.38, 0.22, 0.22), 0.48, 0.28, 0.44, 3.2, cDark, cLight),
    createLeafClusterPad(new THREE.Vector3(-0.34, 0.2, -0.18), 0.44, 0.26, 0.42, 5.6, cDark, cLight),
  ];
  return mergeGeometries(parts);
}

/**
 * Clump of curved coastal grass blades.
 */
export function createCoastalGrassGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const colors: number[] = [];
  const cBase = new THREE.Color('#4a5f3e');
  const cTip = new THREE.Color('#8c9e64');

  const bladeCount = 7;
  for (let i = 0; i < bladeCount; i++) {
    const a = (i / bladeCount) * Math.PI * 2 + (i % 2) * 0.25;
    const lean = 0.28 + (i % 3) * 0.08;
    const h = 0.45 + (i % 3) * 0.14;
    const w = 0.055;
    const ox = Math.cos(a) * 0.12;
    const oz = Math.sin(a) * 0.12;
    const tx = -Math.sin(a) * w;
    const tz = Math.cos(a) * w;
    const tipX = ox + Math.cos(a) * lean;
    const tipZ = oz + Math.sin(a) * lean;

    positions.push(ox - tx, 0, oz - tz);
    positions.push(ox + tx, 0, oz + tz);
    positions.push(tipX, h, tipZ);

    colors.push(cBase.r, cBase.g, cBase.b);
    colors.push(cBase.r, cBase.g, cBase.b);
    colors.push(cTip.r, cTip.g, cTip.b);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

/**
 * Angular natural coastal rock geometry.
 */
export function createNaturalRockGeometry(): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    if (y < -0.25) y = -0.25;
    const step = 0.18 * Math.sin(x * 3.5 + z * 2.7) + 0.12 * Math.cos(y * 5.0);
    pos.setXYZ(i, x * (1 + step), y * (0.72 + step * 0.4), z * (1 - step * 0.6));
  }
  geo.computeVertexNormals();
  return geo;
}

