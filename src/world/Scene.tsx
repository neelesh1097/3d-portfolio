import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from './Environment';
import { Zones } from './Zones';
import { Vehicle } from './Vehicle';
import { Collectibles } from './Collectibles';
import { InteractivePins } from './InteractivePins';

export const Scene: React.FC = () => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 14, 18], fov: 48, near: 0.1, far: 250 }}
      className="w-full h-full outline-none"
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
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
