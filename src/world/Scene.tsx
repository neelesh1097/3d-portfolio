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
      camera={{ position: [0, 16, 22], fov: 45, near: 0.1, far: 350 }}
      className="w-full h-full outline-none"
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      {/* Sunny Sky Gradient Background */}
      <color attach="background" args={['#67e8f9']} />
      
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
