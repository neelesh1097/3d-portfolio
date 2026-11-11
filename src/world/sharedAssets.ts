import * as THREE from 'three';
import { proceduralTextures } from './textures';

/**
 * Shared singleton geometries and textured PBR materials for architectural realism.
 */
export const sharedGeo = {
  box1: new THREE.BoxGeometry(1, 1, 1),
  sphereLow: new THREE.SphereGeometry(1, 10, 8),
  dodecaLow: new THREE.DodecahedronGeometry(1, 0),
  cyl8: new THREE.CylinderGeometry(1, 1, 1, 8),
};

export const sharedMat = {
  // Architectural Materials
  limestone: new THREE.MeshStandardMaterial({
    color: '#ede9df',
    map: proceduralTextures.limestone.map,
    bumpMap: proceduralTextures.limestone.bumpMap,
    bumpScale: 0.03,
    roughness: 0.72,
    metalness: 0.03,
  }),
  sandConcrete: new THREE.MeshStandardMaterial({
    color: '#d9d3c5',
    bumpMap: proceduralTextures.limestone.bumpMap,
    bumpScale: 0.025,
    roughness: 0.8,
    metalness: 0.02,
  }),
  stoneCurb: new THREE.MeshStandardMaterial({
    color: '#bdb7aa',
    roughness: 0.84,
  }),
  warmOffWhite: new THREE.MeshStandardMaterial({
    color: '#f3f1eb',
    roughness: 0.6,
    metalness: 0.04,
  }),
  graphite: new THREE.MeshStandardMaterial({
    color: '#282f38',
    roughness: 0.45,
    metalness: 0.42,
  }),
  graphiteMatte: new THREE.MeshStandardMaterial({
    color: '#323a45',
    roughness: 0.58,
    metalness: 0.25,
  }),
  smokedGlass: new THREE.MeshPhysicalMaterial({
    color: '#46687d',
    roughness: 0.08,
    metalness: 0.15,
    transmission: 0.25,
    transparent: true,
    opacity: 0.88,
    ior: 1.5,
    reflectivity: 0.9,
    envMapIntensity: 1.35,
  }),
  cedarWood: new THREE.MeshStandardMaterial({
    map: proceduralTextures.cedar,
    roughness: 0.78,
    metalness: 0.04,
  }),
  barkWood: new THREE.MeshStandardMaterial({
    color: '#5f4430',
    roughness: 0.92,
  }),

  // Roads
  asphalt: new THREE.MeshStandardMaterial({
    map: proceduralTextures.asphalt.map,
    bumpMap: proceduralTextures.asphalt.bumpMap,
    bumpScale: 0.025,
    roughness: 0.88,
    metalness: 0.05,
  }),
  roadMarking: new THREE.MeshStandardMaterial({
    color: '#d8d6cf',
    roughness: 0.7,
  }),

  // Terrain & Natural Rocks
  rockSlate: new THREE.MeshStandardMaterial({
    color: '#63686d',
    roughness: 0.92,
    flatShading: true,
  }),
  rockLimestone: new THREE.MeshStandardMaterial({
    color: '#8e8273',
    roughness: 0.9,
    flatShading: true,
  }),

  // Architectural Accent Lights
  warmArchitecturalLight: new THREE.MeshStandardMaterial({
    color: '#fff2d2',
    emissive: '#f5cc7f',
    emissiveIntensity: 0.95,
    roughness: 0.4,
  }),
  subtleCyanStrip: new THREE.MeshStandardMaterial({
    color: '#6ad8eb',
    emissive: '#3cc4dc',
    emissiveIntensity: 0.55,
    roughness: 0.3,
  }),
};
