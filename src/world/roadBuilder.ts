import * as THREE from 'three';

/**
 * Generates gently undulating scenic perimeter road & curved avenues connecting all 8 zones.
 */
function createPerimeterCurve(): THREE.CatmullRomCurve3 {
  // Smooth organic loop weaving gracefully in front of every building entrance
  const pts: THREE.Vector3[] = [];
  const count = 16;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    // Slight organic undulation while staying cleanly inside building plazas (r ~ 19.2..21.4)
    const r = 20.0 + Math.sin(a * 4 + 0.3) * 0.95 + Math.cos(a * 2 - 0.5) * 0.65;
    pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
  }
  return new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.5);
}

function createSpokeCurves(): THREE.CatmullRomCurve3[] {
  return [
    // North avenue (Central Hub -> Frontend City)
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, -4.5),
      new THREE.Vector3(-0.9, 0, -12.5),
      new THREE.Vector3(0.4, 0, -20.5),
      new THREE.Vector3(0, 0, -26.5),
    ]),
    // South avenue (Central Hub -> Project Plaza)
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 4.5),
      new THREE.Vector3(0.9, 0, 12.5),
      new THREE.Vector3(-0.4, 0, 20.0),
      new THREE.Vector3(0, 0, 25.5),
    ]),
    // East avenue (Central Hub -> Database Hub)
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(4.5, 0, 0),
      new THREE.Vector3(12.5, 0, 0.8),
      new THREE.Vector3(20.5, 0, -0.4),
      new THREE.Vector3(26.5, 0, 0),
    ]),
    // West avenue (Central Hub -> Contact Station)
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.5, 0, 0),
      new THREE.Vector3(-12.5, 0, -0.8),
      new THREE.Vector3(-20.5, 0, 0.4),
      new THREE.Vector3(-26.5, 0, 0),
    ]),
    // Diagonal spurs into corner studios (±23, ±23)
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-13.8, 0, -13.8),
      new THREE.Vector3(-16.2, 0, -16.8),
      new THREE.Vector3(-18.6, 0, -18.6),
    ]),
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(13.8, 0, -13.8),
      new THREE.Vector3(16.8, 0, -16.2),
      new THREE.Vector3(18.6, 0, -18.6),
    ]),
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(13.8, 0, 13.8),
      new THREE.Vector3(16.2, 0, 16.8),
      new THREE.Vector3(18.6, 0, 18.6),
    ]),
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-13.8, 0, 13.8),
      new THREE.Vector3(-16.8, 0, 16.2),
      new THREE.Vector3(-18.6, 0, 18.6),
    ]),
  ];
}

export const PERIMETER_CURVE = createPerimeterCurve();
export const SPOKE_CURVES = createSpokeCurves();

// Pre-sample road centerlines once for terrain flattening
const ROAD_SAMPLES: Array<[number, number]> = (() => {
  const pts: Array<[number, number]> = [];
  const pSamples = PERIMETER_CURVE.getSpacedPoints(120);
  pSamples.forEach((p) => pts.push([p.x, p.z]));
  SPOKE_CURVES.forEach((c) => {
    c.getSpacedPoints(24).forEach((p) => pts.push([p.x, p.z]));
  });
  return pts;
})();

/**
 * Returns 0 on roads / plaza / building pads, smoothly rising to 1 in open meadows.
 */
export function getRoadTerrainMask(x: number, z: number): number {
  let minSq = 999999;
  for (let i = 0; i < ROAD_SAMPLES.length; i++) {
    const dx = x - ROAD_SAMPLES[i][0];
    const dz = z - ROAD_SAMPLES[i][1];
    const dSq = dx * dx + dz * dz;
    if (dSq < minSq) minSq = dSq;
  }
  const d = Math.sqrt(minSq);
  if (d < 3.4) return 0;
  if (d < 6.2) return (d - 3.4) / 2.8;
  return 1;
}

/**
 * Builds a clean lofted road or curb ribbon along a 3D spline with proper tiling UVs.
 */
export function buildSplineRibbonGeometry(
  curve: THREE.CatmullRomCurve3,
  segments: number,
  halfWidth: number,
  yHeight: number,
  closed = false,
  uvRepeatLen = 0.25
): THREE.BufferGeometry {
  const points = curve.getSpacedPoints(segments);
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  let accumLen = 0;

  for (let i = 0; i < points.length; i++) {
    const curr = points[i];
    const prev = points[i === 0 ? (closed ? points.length - 2 : 0) : i - 1];
    const next = points[i === points.length - 1 ? (closed ? 1 : points.length - 1) : i + 1];

    if (i > 0) {
      accumLen += curr.distanceTo(points[i - 1]);
    }

    const tx = next.x - prev.x;
    const tz = next.z - prev.z;
    const len = Math.hypot(tx, tz) || 1;
    // Perpendicular right vector in XZ plane
    const nx = -tz / len;
    const nz = tx / len;

    positions.push(curr.x - nx * halfWidth, yHeight, curr.z - nz * halfWidth);
    positions.push(curr.x + nx * halfWidth, yHeight, curr.z + nz * halfWidth);

    uvs.push(0, accumLen * uvRepeatLen);
    uvs.push(1, accumLen * uvRepeatLen);
  }

  for (let i = 0; i < points.length - 1; i++) {
    const a0 = i * 2;
    const b0 = i * 2 + 1;
    const a1 = (i + 1) * 2;
    const b1 = (i + 1) * 2 + 1;
    indices.push(a0, a1, b0);
    indices.push(b0, a1, b1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/** Computes dashed centerline transform specs along a curve for instanced rendering. */
export function buildCurveDashes(
  curve: THREE.CatmullRomCurve3,
  count: number,
  yHeight: number
): Array<{ pos: [number, number, number]; rot: [number, number, number]; scale: [number, number, number] }> {
  const specs: Array<{ pos: [number, number, number]; rot: [number, number, number]; scale: [number, number, number] }> = [];
  for (let i = 0; i < count; i++) {
    const u = (i + 0.5) / count;
    const pt = curve.getPointAt(u);
    const tan = curve.getTangentAt(u);
    const angle = Math.atan2(tan.x, tan.z);
    specs.push({
      pos: [pt.x, yHeight, pt.z],
      rot: [0, angle, 0],
      scale: [0.14, 0.015, 1.15],
    });
  }
  return specs;
}

