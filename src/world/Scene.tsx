import React, { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Environment } from './Environment';
import { Zones } from './Zones';
import { Vehicle } from './Vehicle';
import { Collectibles } from './Collectibles';
import { InteractivePins } from './InteractivePins';
import { useStore } from '../store/useStore';
import { livePerf } from '../store/liveTelemetry';

/** Generates a baked PMREM environment texture once for realistic clearcoat & glass reflections. */
const EnvironmentIBL: React.FC = () => {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const envRT = pmrem.fromScene(room, 0.04);
    scene.environment = envRT.texture;
    (scene as THREE.Scene & { environmentIntensity?: number }).environmentIntensity = 0.55;

    return () => {
      scene.environment = null;
      envRT.dispose();
      room.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  return null;
};

/** Samples renderer.info and frame timing with zero React re-renders. */
const PerfBridge: React.FC = () => {
  const { gl } = useThree();
  const accum = useRef({ frames: 0, time: 0 });

  useFrame((_, delta) => {
    const a = accum.current;
    a.frames += 1;
    a.time += delta;

    if (a.time >= 0.35) {
      const avgDt = a.time / a.frames;
      livePerf.fps = Math.round(1 / Math.max(avgDt, 0.001));
      livePerf.frameTimeMs = avgDt * 1000;
      livePerf.drawCalls = gl.info.render.calls;
      livePerf.triangles = gl.info.render.triangles;
      livePerf.geometries = gl.info.memory.geometries;
      livePerf.textures = gl.info.memory.textures;
      const perfMem = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
      if (perfMem) {
        livePerf.jsHeapMb = Math.round(perfMem.usedJSHeapSize / (1024 * 1024));
      }
      a.frames = 0;
      a.time = 0;
    }
  });

  return null;
};

export const Scene: React.FC = () => {
  const qualityLevel = useStore((s) => s.qualityLevel);
  const is2DView = useStore((s) => s.is2DView);
  const [adaptiveCap, setAdaptiveCap] = useState<number>(() => {
    if (typeof window === 'undefined') return 1.5;
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
    return isMobile ? 1.25 : 1.5;
  });

  useEffect(() => {
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (qualityLevel === 'high') setAdaptiveCap(isMobile ? 1.25 : 1.5);
    else if (qualityLevel === 'medium') setAdaptiveCap(1.15);
    else setAdaptiveCap(0.95);
  }, [qualityLevel]);

  if (is2DView) return null;

  const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, adaptiveCap);

  return (
    <Canvas
      shadows={qualityLevel !== 'low'}
      dpr={dpr}
      camera={{ position: [0, 6.2, -14.5], fov: 44, near: 0.2, far: 320 }}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100vw',
        height: '100vh',
        outline: 'none',
        display: 'block',
      }}
      gl={{
        antialias: qualityLevel !== 'low',
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
    >
      <color attach="background" args={['#cfe4e8']} />
      <fog attach="fog" args={['#d2e6ea', 95, 250]} />

      <PerformanceMonitor
        onDecline={() => {
          setAdaptiveCap((prev) => Math.max(0.9, prev - 0.25));
        }}
        onIncline={() => {
          const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
          const maxCap = qualityLevel === 'high' ? (isMobile ? 1.25 : 1.5) : qualityLevel === 'medium' ? 1.15 : 0.95;
          setAdaptiveCap(maxCap);
        }}
      />

      <EnvironmentIBL />
      <PerfBridge />

      <Suspense fallback={null}>
        <Environment />
        <Zones />
        <Collectibles />
        <InteractivePins />
        <Vehicle />
      </Suspense>
    </Canvas>
  );
};
