import * as THREE from 'three';

interface SectionPoint {
  x: number;
  y: number;
}

/**
 * Lofts a closed symmetric 2D cross-section loop along Z stations with smooth shading and front/rear endcaps.
 */
function buildLoftedHull(
  stations: Array<{ z: number; profile: SectionPoint[] }>
): THREE.BufferGeometry {
  // Build full closed loop around each station: right side bottom->top, left side top->bottom
  const loops: Array<Array<{ x: number; y: number; z: number }>> = stations.map((st) => {
    const right = st.profile;
    const left = [...st.profile].reverse().map((p) => ({ x: -p.x, y: p.y }));
    return [...right, ...left].map((p) => ({ x: p.x, y: p.y, z: st.z }));
  });

  const ringLen = loops[0].length;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let s = 0; s < loops.length; s++) {
    for (let i = 0; i < ringLen; i++) {
      const p = loops[s][i];
      positions.push(p.x, p.y, p.z);
    }
  }

  // Side quads (outward normals)
  for (let s = 0; s < loops.length - 1; s++) {
    const rowA = s * ringLen;
    const rowB = (s + 1) * ringLen;
    for (let i = 0; i < ringLen; i++) {
      const next = (i + 1) % ringLen;
      const a0 = rowA + i;
      const a1 = rowA + next;
      const b0 = rowB + i;
      const b1 = rowB + next;
      indices.push(a0, a1, b0);
      indices.push(a1, b1, b0);
    }
  }

  // Rear cap (station 0, outward -Z)
  const rearCenterIdx = positions.length / 3;
  const rearLoop = loops[0];
  let rCy = 0;
  rearLoop.forEach((p) => (rCy += p.y));
  positions.push(0, rCy / ringLen, rearLoop[0].z - 0.03);
  for (let i = 0; i < ringLen; i++) {
    const next = (i + 1) % ringLen;
    indices.push(rearCenterIdx, next, i);
  }

  // Front cap (last station, outward +Z)
  const frontCenterIdx = positions.length / 3;
  const frontRow = (loops.length - 1) * ringLen;
  const frontLoop = loops[loops.length - 1];
  let fCy = 0;
  frontLoop.forEach((p) => (fCy += p.y));
  positions.push(0, fCy / ringLen, frontLoop[0].z + 0.04);
  for (let i = 0; i < ringLen; i++) {
    const next = (i + 1) % ringLen;
    indices.push(frontCenterIdx, frontRow + i, frontRow + next);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates a true 3D multi-station lofted sports coupe chassis, tumblehome greenhouse cabin, roof cap & curved tires.
 */
export function createSculptedSportsCoupe() {
  // Body stations from Rear (-1.38) to Front (+1.42) with flared fenders, tucked waist & sloped nose
  const bodyStations: Array<{ z: number; profile: SectionPoint[] }> = [
    {
      z: -1.38,
      profile: [
        { x: 0.0, y: 0.24 },
        { x: 0.56, y: 0.25 },
        { x: 0.64, y: 0.39 },
        { x: 0.58, y: 0.54 },
        { x: 0.28, y: 0.57 },
        { x: 0.0, y: 0.58 },
      ],
    },
    {
      z: -1.16,
      profile: [
        { x: 0.0, y: 0.2 },
        { x: 0.66, y: 0.21 },
        { x: 0.76, y: 0.4 },
        { x: 0.71, y: 0.58 },
        { x: 0.35, y: 0.61 },
        { x: 0.0, y: 0.62 },
      ],
    },
    {
      // Rear haunch flare over rear wheels
      z: -0.78,
      profile: [
        { x: 0.0, y: 0.19 },
        { x: 0.66, y: 0.21 },
        { x: 0.82, y: 0.42 },
        { x: 0.77, y: 0.61 },
        { x: 0.38, y: 0.62 },
        { x: 0.0, y: 0.62 },
      ],
    },
    {
      // Door waist pinch
      z: 0.0,
      profile: [
        { x: 0.0, y: 0.19 },
        { x: 0.68, y: 0.2 },
        { x: 0.75, y: 0.39 },
        { x: 0.7, y: 0.59 },
        { x: 0.36, y: 0.6 },
        { x: 0.0, y: 0.6 },
      ],
    },
    {
      // Front fender flare over front wheels
      z: 0.76,
      profile: [
        { x: 0.0, y: 0.19 },
        { x: 0.66, y: 0.21 },
        { x: 0.8, y: 0.38 },
        { x: 0.73, y: 0.56 },
        { x: 0.36, y: 0.58 },
        { x: 0.0, y: 0.59 },
      ],
    },
    {
      // Sloped front hood taper
      z: 1.18,
      profile: [
        { x: 0.0, y: 0.2 },
        { x: 0.62, y: 0.22 },
        { x: 0.7, y: 0.34 },
        { x: 0.62, y: 0.45 },
        { x: 0.3, y: 0.47 },
        { x: 0.0, y: 0.48 },
      ],
    },
    {
      // Rounded aerodynamic nose cone
      z: 1.42,
      profile: [
        { x: 0.0, y: 0.21 },
        { x: 0.46, y: 0.22 },
        { x: 0.54, y: 0.3 },
        { x: 0.46, y: 0.36 },
        { x: 0.22, y: 0.38 },
        { x: 0.0, y: 0.38 },
      ],
    },
  ];

  // Fastback glass greenhouse with realistic inward tumblehome
  const cabinStations: Array<{ z: number; profile: SectionPoint[] }> = [
    {
      z: -0.96,
      profile: [
        { x: 0.0, y: 0.58 },
        { x: 0.54, y: 0.58 },
        { x: 0.48, y: 0.67 },
        { x: 0.0, y: 0.69 },
      ],
    },
    {
      z: -0.45,
      profile: [
        { x: 0.0, y: 0.58 },
        { x: 0.61, y: 0.58 },
        { x: 0.46, y: 0.94 },
        { x: 0.0, y: 0.97 },
      ],
    },
    {
      z: 0.14,
      profile: [
        { x: 0.0, y: 0.58 },
        { x: 0.6, y: 0.58 },
        { x: 0.45, y: 0.93 },
        { x: 0.0, y: 0.96 },
      ],
    },
    {
      z: 0.62,
      profile: [
        { x: 0.0, y: 0.56 },
        { x: 0.56, y: 0.56 },
        { x: 0.44, y: 0.61 },
        { x: 0.0, y: 0.63 },
      ],
    },
  ];

  // Curved painted roof panel sitting seamlessly atop the greenhouse
  const roofStations: Array<{ z: number; profile: SectionPoint[] }> = [
    {
      z: -0.52,
      profile: [
        { x: 0.0, y: 0.91 },
        { x: 0.44, y: 0.91 },
        { x: 0.41, y: 0.96 },
        { x: 0.0, y: 0.985 },
      ],
    },
    {
      z: -0.15,
      profile: [
        { x: 0.0, y: 0.92 },
        { x: 0.45, y: 0.92 },
        { x: 0.42, y: 0.97 },
        { x: 0.0, y: 0.995 },
      ],
    },
    {
      z: 0.18,
      profile: [
        { x: 0.0, y: 0.9 },
        { x: 0.43, y: 0.9 },
        { x: 0.4, y: 0.95 },
        { x: 0.0, y: 0.975 },
      ],
    },
  ];

  // Lathe sculpted rubber tire sidewall profile
  const tirePts = [
    new THREE.Vector2(0.19, -0.135),
    new THREE.Vector2(0.31, -0.145),
    new THREE.Vector2(0.345, -0.095),
    new THREE.Vector2(0.345, 0.095),
    new THREE.Vector2(0.31, 0.145),
    new THREE.Vector2(0.19, 0.135),
  ];
  const tireGeo = new THREE.LatheGeometry(tirePts, 24);
  tireGeo.rotateZ(Math.PI / 2);
  tireGeo.computeVertexNormals();

  return {
    bodyGeo: buildLoftedHull(bodyStations),
    cabinGeo: buildLoftedHull(cabinStations),
    roofGeo: buildLoftedHull(roofStations),
    tireGeo,
  };
}
