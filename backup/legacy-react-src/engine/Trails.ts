import * as THREE from 'three/webgpu';
import {
  attribute,
  cross,
  dot,
  float,
  Fn,
  mat3,
  modelViewMatrix,
  positionGeometry,
  texture,
  uniform,
  vec2,
  vec3,
  vec4,
} from 'three/tsl';
import type { GameContext } from './GameContext';

const getRotationMatrix = Fn(([u, v]: any) => {
  const cosTheta = dot(u, v);
  const axis = cross(u, v).toVar();
  const sinTheta = axis.length();
  const safeAxis = axis.div(sinTheta.max(0.0001));

  const c = cosTheta;
  const s = sinTheta;
  const t = c.oneMinus();

  return mat3(
    t.mul(safeAxis.x).mul(safeAxis.x).add(c),
    t.mul(safeAxis.x).mul(safeAxis.y).sub(s.mul(safeAxis.z)),
    t.mul(safeAxis.x).mul(safeAxis.z).add(s.mul(safeAxis.y)),
    t.mul(safeAxis.x).mul(safeAxis.y).add(s.mul(safeAxis.z)),
    t.mul(safeAxis.y).mul(safeAxis.y).add(c),
    t.mul(safeAxis.y).mul(safeAxis.z).sub(s.mul(safeAxis.x)),
    t.mul(safeAxis.x).mul(safeAxis.z).sub(s.mul(safeAxis.y)),
    t.mul(safeAxis.y).mul(safeAxis.z).add(s.mul(safeAxis.x)),
    t.mul(safeAxis.z).mul(safeAxis.z).add(c)
  );
});

export interface TrailItem {
  lastPosition: THREE.Vector3;
  position: THREE.Vector3;
  alpha: number;
  dataTexture: THREE.DataTexture;
  dataArray: Float32Array;
  mesh: THREE.Mesh;
}

export class Trails {
  subdivisions = 32;
  texel = 1 / 32;
  distanceThrottle = 0.28;
  emissiveMultiplier = uniform(2.1);
  fresnelOffset = uniform(0.25);
  decay = 0.42;
  items: TrailItem[] = [];
  geometry!: THREE.BufferGeometry;
  private tempDelta = new THREE.Vector3();

  constructor(private game: GameContext) {
    this.geometry = new THREE.CylinderGeometry(0.068, 0.068, 1, 4, this.subdivisions, true);
    this.geometry.rotateY(Math.PI * 0.25);
    this.geometry.rotateX(-Math.PI * 0.5);
    this.geometry.translate(0, 0, 0.5);
    this.geometry.deleteAttribute('uv');

    this.game.ticker.events.on(
      'tick',
      () => {
        this.update();
      },
      10
    );
  }

  create(): TrailItem {
    const dataArray = new Float32Array(this.subdivisions * 4);
    const dataTexture = new THREE.DataTexture(
      dataArray,
      this.subdivisions,
      1,
      THREE.RGBAFormat,
      THREE.FloatType
    );

    const material = new THREE.MeshBasicNodeMaterial({
      transparent: true,
      depthWrite: false,
    });
    const customNormal = vec3().toVarying();
    const ratio = float(0).toVarying();
    const alpha = float(0).toVarying();

    material.positionNode = Fn(() => {
      ratio.assign(positionGeometry.z.oneMinus());

      const trailData = texture(dataTexture, vec2(ratio, 0.5));
      const trailPosition = trailData.xyz;

      const nextPosition = texture(dataTexture, vec2(ratio.add(this.texel), 0.5)).xyz;
      const direction = nextPosition.sub(trailPosition).normalize();

      const rotationMatrix = (getRotationMatrix as any)(direction, vec3(0, 0, -1));
      const basePosition = vec3(positionGeometry.x, positionGeometry.y, 0);
      const rotatedPoint = rotationMatrix.mul(basePosition);

      customNormal.assign(modelViewMatrix.mul(vec4(rotationMatrix.mul(attribute('normal', 'vec3')), 0)));
      alpha.assign(trailData.w);

      return trailPosition.add(rotatedPoint);
    })();

    material.outputNode = Fn(() => {
      const fresnel = customNormal.dot(vec3(0, 0, 1)).abs().oneMinus();
      const gradientUv = vec2(
        0.5,
        ratio.oneMinus().sub(fresnel.oneMinus().mul(this.fresnelOffset))
      );
      const baseColor = texture(this.game.materials.gradientTexture, gradientUv)
        .rgb.mul(this.emissiveMultiplier);

      return vec4(vec3(baseColor), ratio.oneMinus().mul(alpha));
    })();

    const mesh = new THREE.Mesh(this.geometry, material);
    mesh.renderOrder = 1;
    mesh.frustumCulled = false;
    this.game.scene.add(mesh);

    const item: TrailItem = {
      lastPosition: new THREE.Vector3(Infinity, Infinity, Infinity),
      position: new THREE.Vector3(),
      alpha: 0,
      dataTexture,
      dataArray,
      mesh,
    };
    this.items.push(item);
    return item;
  }

  update(): void {
    const dt = this.game.ticker.deltaScaled;

    for (const item of this.items) {
      const data = item.dataArray;
      this.tempDelta.copy(item.lastPosition).sub(item.position);
      const dist = this.tempDelta.length();

      if (dist > this.distanceThrottle) {
        if (dist > 3) {
          for (let i = 0; i < this.subdivisions; i++) {
            const i4 = i * 4;
            data[i4 + 0] = item.position.x;
            data[i4 + 1] = item.position.y;
            data[i4 + 2] = item.position.z;
            data[i4 + 3] = 0;
          }
        } else {
          for (let i = this.subdivisions - 1; i > 0; i--) {
            const i4 = i * 4;
            const p4 = (i - 1) * 4;
            data[i4 + 0] = data[p4 + 0];
            data[i4 + 1] = data[p4 + 1];
            data[i4 + 2] = data[p4 + 2];
            data[i4 + 3] = data[p4 + 3];
          }
        }
        data[0] = item.position.x;
        data[1] = item.position.y;
        data[2] = item.position.z;
        data[3] = item.alpha;
        item.lastPosition.copy(item.position);
      } else {
        data[0] = item.position.x;
        data[1] = item.position.y;
        data[2] = item.position.z;
        data[3] = item.alpha;
      }

      for (let i = 1; i < this.subdivisions; i++) {
        const i4 = i * 4;
        data[i4 + 3] = Math.max(0, data[i4 + 3] - this.decay * dt);
      }

      item.dataTexture.needsUpdate = true;
    }
  }
}
