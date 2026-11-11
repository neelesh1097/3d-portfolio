import * as THREE from 'three';

function makeCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

// Deterministic pseudo-random so textures never flicker across HMR
function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function createAsphaltTextures() {
  const size = 256;
  const [cColor, ctxColor] = makeCanvas(size);
  const [cBump, ctxBump] = makeCanvas(size);

  ctxColor.fillStyle = '#272c33';
  ctxColor.fillRect(0, 0, size, size);
  ctxBump.fillStyle = '#808080';
  ctxBump.fillRect(0, 0, size, size);

  for (let i = 0; i < 4500; i++) {
    const x = hash(i * 3) * size;
    const y = hash(i * 3 + 1) * size;
    const v = hash(i * 3 + 2);
    const shade = Math.floor(32 + v * 28);
    ctxColor.fillStyle = `rgb(${shade}, ${shade + 3}, ${shade + 7})`;
    ctxColor.fillRect(x, y, 1.5, 1.5);

    const b = Math.floor(90 + v * 85);
    ctxBump.fillStyle = `rgb(${b}, ${b}, ${b})`;
    ctxBump.fillRect(x, y, 1.5, 1.5);
  }

  const map = new THREE.CanvasTexture(cColor);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(1, 24);

  const bumpMap = new THREE.CanvasTexture(cBump);
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(1, 24);

  return { map, bumpMap };
}

function createLimestoneTextures() {
  const size = 256;
  const [cColor, ctxColor] = makeCanvas(size);
  const [cBump, ctxBump] = makeCanvas(size);

  ctxColor.fillStyle = '#e8e4da';
  ctxColor.fillRect(0, 0, size, size);
  ctxBump.fillStyle = '#888888';
  ctxBump.fillRect(0, 0, size, size);

  // Fine mineral speckle
  for (let i = 0; i < 2400; i++) {
    const x = hash(i * 5 + 11) * size;
    const y = hash(i * 5 + 12) * size;
    const v = hash(i * 5 + 13);
    const s = Math.floor(215 + v * 25);
    ctxColor.fillStyle = `rgba(${s}, ${s - 4}, ${s - 12}, 0.55)`;
    ctxColor.fillRect(x, y, 2, 1.5);

    const b = Math.floor(110 + v * 45);
    ctxBump.fillStyle = `rgb(${b}, ${b}, ${b})`;
    ctxBump.fillRect(x, y, 2, 1.5);
  }

  // Subtle architectural stone panel joints
  ctxColor.strokeStyle = 'rgba(130, 124, 114, 0.22)';
  ctxColor.lineWidth = 1.2;
  ctxBump.strokeStyle = '#5a5a5a';
  ctxBump.lineWidth = 1.5;
  for (let y = 0; y < size; y += 64) {
    ctxColor.beginPath();
    ctxColor.moveTo(0, y);
    ctxColor.lineTo(size, y);
    ctxColor.stroke();

    ctxBump.beginPath();
    ctxBump.moveTo(0, y);
    ctxBump.lineTo(size, y);
    ctxBump.stroke();
  }

  const map = new THREE.CanvasTexture(cColor);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 2);

  const bumpMap = new THREE.CanvasTexture(cBump);
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2, 2);

  return { map, bumpMap };
}

function createCedarTexture() {
  const size = 256;
  const [cColor, ctx] = makeCanvas(size);

  ctx.fillStyle = '#875c3c';
  ctx.fillRect(0, 0, size, size);

  // Horizontal cedar slat planks
  for (let y = 0; y < size; y += 16) {
    const tone = (hash(y) - 0.5) * 16;
    ctx.fillStyle = `rgb(${135 + tone}, ${92 + tone * 0.7}, ${60 + tone * 0.5})`;
    ctx.fillRect(0, y, size, 15);
    ctx.fillStyle = 'rgba(42, 26, 16, 0.35)';
    ctx.fillRect(0, y + 15, size, 1);
  }

  const map = new THREE.CanvasTexture(cColor);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 2);
  return map;
}

function createTerrainDetailTexture() {
  const size = 256;
  const [cColor, ctx] = makeCanvas(size);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // Subtle organic earth/grass mottling (multiplied with vertexColors)
  for (let i = 0; i < 3200; i++) {
    const x = hash(i * 7 + 3) * size;
    const y = hash(i * 7 + 4) * size;
    const v = hash(i * 7 + 5);
    const shade = Math.floor(222 + v * 33);
    ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade - 4})`;
    ctx.fillRect(x, y, 2.5, 2.5);
  }

  const map = new THREE.CanvasTexture(cColor);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(16, 16);
  return map;
}

export const proceduralTextures = {
  asphalt: createAsphaltTextures(),
  limestone: createLimestoneTextures(),
  cedar: createCedarTexture(),
  terrainDetail: createTerrainDetailTexture(),
};

