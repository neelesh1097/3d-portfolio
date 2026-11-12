import { uniform } from 'three/tsl';

export class Water {
  surfaceElevation = -0.3;
  depthElevation = -1.5;
  surfaceElevationUniform = uniform(-0.3);
  surfaceThicknessUniform = uniform(0.013);
}
