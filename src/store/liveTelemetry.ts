/**
 * Mutable high-frequency telemetry updated in Three.js useFrame without triggering React re-renders.
 */
export const liveCar = {
  x: 0,
  y: 0.48,
  z: 0,
  angle: 0,
  speed: 0,
  boosting: false,
};

/**
 * Mutable WebGL renderer metrics sampled periodically for the developer performance monitor.
 */
export const livePerf = {
  fps: 60,
  frameTimeMs: 16.6,
  drawCalls: 0,
  triangles: 0,
  geometries: 0,
  textures: 0,
  jsHeapMb: 0,
};

