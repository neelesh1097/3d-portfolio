import * as THREE from 'three';
import { getRoadTerrainMask } from './roadBuilder';

/**
 * Asymmetric sculpted coastline contour with bays and rocky headlands (~43-50m radius).
 */
export function getIslandShoreRadius(angle: number): number {
  return (
    45.6 +
    3.4 * Math.sin(3 * angle + 0.45) +
    2.2 * Math.cos(5 * angle - 0.65) +
    1.6 * Math.sin(2 * angle + 1.15) -
    1.1 * Math.cos(7 * angle + 0.2)
  );
}

/**
 * Continuous coastal meadow elevation keeping central hub, curved roads, and building plinths level.
 */
export function getTerrainHeight(x: number, z: number): number {
  const r = Math.hypot(x, z);
  const angle = Math.atan2(z, x);
  const shoreR = getIslandShoreRadius(angle);

  // Smooth coastal beach & cliff transition rim
  if (r > shoreR - 5.8) {
    const t = THREE.MathUtils.clamp((r - (shoreR - 5.8)) / 5.8, 0, 1);
    return THREE.MathUtils.lerp(0.0, -0.65, t * t);
  }

  let flatMask = 1.0;

  // Compact Central Plaza flat area
  if (r < 9.2) {
    flatMask = 0;
  } else if (r < 12.2) {
    flatMask = Math.min(flatMask, (r - 9.2) / 3.0);
  }

  // Smoothly flatten along curved asphalt road splines
  flatMask = Math.min(flatMask, getRoadTerrainMask(x, z));

  // Keep building terrace pads at radius ~31-36 gently graded
  if (r > 26.5 && r < 38.0) {
    flatMask *= 0.22;
  }

  // Natural multi-octave undulating meadow hills
  const undulation =
    0.85 * Math.sin(x * 0.13 + 0.5) * Math.cos(z * 0.13 - 0.3) +
    0.55 * Math.cos((x - z) * 0.095 + 0.8) +
    0.7;

  return Math.max(0, undulation) * flatMask;
}

/**
 * Builds sculpted coastal terrain surface with world-space tiling UVs and desaturated natural vertex colors.
 */
export function buildSculptedTerrainGeometry(): THREE.BufferGeometry {
  const rings = 34;
  const segments = 88;

  const positions: number[] = [];
  const colors: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Muted sage, natural olive, deep forest green, and warm coastal sand
  const cSage = new THREE.Color('#6a8258');
  const cOlive = new THREE.Color('#7b8c58');
  const cForest = new THREE.Color('#4b6243');
  const cSand = new THREE.Color('#cbb793');
  const cEarth = new THREE.Color('#8e7b63');
  const cTmp = new THREE.Color();

  positions.push(0, 0, 0);
  colors.push(cSage.r, cSage.g, cSage.b);
  uvs.push(0.5, 0.5);

  for (let ri = 1; ri <= rings; ri++) {
    const t = ri / rings;
    for (let si = 0; si < segments; si++) {
      const a = (si / segments) * Math.PI * 2;
      const maxR = getIslandShoreRadius(a);
      const rad = maxR * t;
      const x = Math.cos(a) * rad;
      const z = Math.sin(a) * rad;
      const y = getTerrainHeight(x, z);

      positions.push(x, y, z);
      uvs.push(x / 95 + 0.5, z / 95 + 0.5);

      if (t > 0.87) {
        const st = (t - 0.87) / 0.13;
        cTmp.lerpColors(cEarth, cSand, Math.min(1, st * 1.25));
      } else if (t > 0.82) {
        const et = (t - 0.82) / 0.05;
        cTmp.lerpColors(cSage, cEarth, et);
      } else if (y > 0.55) {
        cTmp.lerpColors(cSage, cOlive, Math.min(1, (y - 0.55) / 1.1));
      } else {
        const patch = 0.5 + 0.5 * Math.sin(x * 0.11 - z * 0.09);
        cTmp.lerpColors(cForest, cSage, patch);
      }
      colors.push(cTmp.r, cTmp.g, cTmp.b);
    }
  }

  for (let si = 0; si < segments; si++) {
    const next = (si + 1) % segments;
    indices.push(0, 1 + next, 1 + si);
  }

  for (let ri = 1; ri < rings; ri++) {
    const rowA = 1 + (ri - 1) * segments;
    const rowB = 1 + ri * segments;
    for (let si = 0; si < segments; si++) {
      const next = (si + 1) % segments;
      const a0 = rowA + si;
      const a1 = rowA + next;
      const b0 = rowB + si;
      const b1 = rowB + next;
      indices.push(a0, a1, b0);
      indices.push(a1, b1, b0);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds sculpted stratified rock cliff shelves descending below the coastal waterline.
 */
export function buildIslandUnderbodyGeometry(): THREE.BufferGeometry {
  const segments = 64;
  const strata = [
    { scaleR: 1.0, y: -0.65, color: new THREE.Color('#baa482'), jitter: 0.0 },
    { scaleR: 0.97, y: -1.45, color: new THREE.Color('#8c7a66'), jitter: 1.05 },
    { scaleR: 0.89, y: -2.9, color: new THREE.Color('#6f6358'), jitter: 1.55 },
    { scaleR: 0.72, y: -5.3, color: new THREE.Color('#575456'), jitter: 1.9 },
    { scaleR: 0.4, y: -8.8, color: new THREE.Color('#434448'), jitter: 1.25 },
  ];

  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  for (let li = 0; li < strata.length; li++) {
    const layer = strata[li];
    for (let si = 0; si < segments; si++) {
      const a = (si / segments) * Math.PI * 2;
      const baseR = getIslandShoreRadius(a);
      const rockRipple =
        layer.jitter * (Math.sin(7 * a + li * 1.7) * 0.55 + Math.cos(11 * a - li) * 0.45);
      const r = baseR * layer.scaleR + rockRipple;
      const yRipple = li > 0 ? Math.sin(6 * a + li) * 0.25 : 0;
      positions.push(Math.cos(a) * r, layer.y + yRipple, Math.sin(a) * r);
      colors.push(layer.color.r, layer.color.g, layer.color.b);
    }
  }

  const bottomIdx = strata.length * segments;
  positions.push(0, -11.5, 0);
  const cTip = new THREE.Color('#393b3f');
  colors.push(cTip.r, cTip.g, cTip.b);

  for (let li = 0; li < strata.length - 1; li++) {
    const rowA = li * segments;
    const rowB = (li + 1) * segments;
    for (let si = 0; si < segments; si++) {
      const next = (si + 1) % segments;
      indices.push(rowA + si, rowB + si, rowA + next);
      indices.push(rowA + next, rowB + si, rowB + next);
    }
  }

  const lastRow = (strata.length - 1) * segments;
  for (let si = 0; si < segments; si++) {
    const next = (si + 1) % segments;
    indices.push(lastRow + si, bottomIdx, lastRow + next);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds an organic shore foam ring matching the asymmetric coastline.
 */
export function buildShoreFoamGeometry(offsetInner: number, offsetOuter: number): THREE.BufferGeometry {
  const segments = 88;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let si = 0; si < segments; si++) {
    const a = (si / segments) * Math.PI * 2;
    const rBase = getIslandShoreRadius(a);
    const r0 = rBase + offsetInner;
    const r1 = rBase + offsetOuter;
    positions.push(Math.cos(a) * r0, 0, Math.sin(a) * r0);
    positions.push(Math.cos(a) * r1, 0, Math.sin(a) * r1);
  }

  for (let si = 0; si < segments; si++) {
    const next = (si + 1) % segments;
    const a0 = si * 2;
    const b0 = si * 2 + 1;
    const a1 = next * 2;
    const b1 = next * 2 + 1;
    indices.push(a0, a1, b0);
    indices.push(b0, a1, b1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}
