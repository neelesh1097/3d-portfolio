import * as THREE from 'three/webgpu';
import seedrandom from 'seedrandom';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import {
  float,
  Fn,
  mix,
  normalWorld,
  positionLocal,
  rotateUV,
  screenSize,
  screenUV,
  smoothstep,
  texture,
  uniform,
  uv,
  vec2,
} from 'three/tsl';
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial';
import type { GameContext } from '../GameContext';

const rng = seedrandom('foliage');

export class Foliage {
  references: THREE.Object3D[];
  seeThrough: boolean;
  seeThroughMultiplier = 1;
  geometry!: THREE.BufferGeometry;
  mesh!: THREE.InstancedMesh;

  materialThreshold = uniform(0.3);
  seeThroughPosition = uniform(vec2());
  seeThroughEdgeMin = uniform(0.11);
  seeThroughEdgeMax = uniform(0.42);
  shadowOffset = uniform(0.6);

  constructor(
    private game: GameContext,
    references: THREE.Object3D[],
    private colorANode: any,
    private colorBNode: any,
    seeThrough = false
  ) {
    this.references = references;
    this.seeThrough = seeThrough;

    this.createGeometry();
    this.createInstancedMesh();

    this.game.ticker.events.on(
      'tick',
      () => {
        this.update();
      },
      10
    );
  }

  private createGeometry(): void {
    const count = 68;
    const planes: THREE.PlaneGeometry[] = [];
    const spherical = new THREE.Spherical();
    const pos = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      const plane = new THREE.PlaneGeometry(0.88, 0.88);
      spherical.set(1 - Math.pow(rng(), 3), Math.PI * 2 * rng(), Math.PI * rng());
      pos.setFromSpherical(spherical);

      plane.rotateZ(rng() * 999);
      plane.translate(pos.x, pos.y, pos.z);

      const normal = pos.clone().normalize();
      const normalArray = new Float32Array(12);
      const posArr = plane.attributes.position.array;

      for (let v = 0; v < 4; v++) {
        const i3 = v * 3;
        const vp = new THREE.Vector3(posArr[i3], posArr[i3 + 1], posArr[i3 + 2]).lerp(normal, 0.85);
        normalArray[i3] = vp.x;
        normalArray[i3 + 1] = vp.y;
        normalArray[i3 + 2] = vp.z;
      }

      plane.setAttribute('normal', new THREE.BufferAttribute(normalArray, 3));
      planes.push(plane);
    }

    this.geometry = mergeGeometries(planes);
    for (const p of planes) p.dispose();
  }

  private createInstancedMesh(): void {
    const foliageAlpha = Fn(() => {
      const rotatedUv = rotateUV(
        uv(),
        this.game.wind.offsetNode(positionLocal.xz).length().mul(2.2),
        vec2(0.5)
      );
      return texture(this.game.resources.foliageTexture, rotatedUv).r;
    });

    const alphaNode = Fn(() => {
      const alpha = float(1).toVar();
      if (this.seeThrough) {
        const toVehicle = screenUV.sub(this.seeThroughPosition);
        toVehicle.mulAssign(vec2(screenSize.x.div(screenSize.y), 1));
        const distToCar = toVehicle.length();
        const fade = smoothstep(this.seeThroughEdgeMin, this.seeThroughEdgeMax, distToCar);
        const sdf = foliageAlpha();
        alpha.assign(sdf.mul(fade.mul(this.materialThreshold.oneMinus()).add(this.materialThreshold)));
      } else {
        alpha.assign(foliageAlpha());
      }
      alpha.subAssign(this.materialThreshold);
      return alpha;
    })();

    const colorNode = Fn(() => {
      const mixStrength = normalWorld.dot(this.game.lighting.directionUniform).smoothstep(0, 1);
      return mix(this.colorANode, this.colorBNode, mixStrength);
    })();

    const material = new MeshDefaultMaterial(this.game, {
      colorNode,
      alphaNode,
      hasWater: false,
      side: THREE.DoubleSide,
    });

    (material as any).receivedShadowPositionNode = positionLocal.add(
      this.game.lighting.directionUniform.mul(this.shadowOffset)
    );

    this.mesh = new THREE.InstancedMesh(this.geometry, material, this.references.length);
    this.mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.frustumCulled = false;

    const towardCamera = this.game.view.spherical.offset.clone().normalize();
    const helper = new THREE.Object3D();

    for (let i = 0; i < this.references.length; i++) {
      const ref = this.references[i];
      const angle = Math.PI * 2 * rng();
      helper.up.set(Math.sin(angle), Math.cos(angle), 0);
      helper.lookAt(towardCamera);
      helper.position.copy(ref.position);
      helper.scale.setScalar(ref.scale.x);
      helper.updateMatrix();
      this.mesh.setMatrixAt(i, helper.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
    this.game.scene.add(this.mesh);
  }

  update(): void {
    const visualVehicle = this.game.world?.visualVehicle;
    if (!visualVehicle) return;
    this.seeThroughPosition.value.copy(visualVehicle.screenPosition);
    const radius = this.game.view.spherical.radius.current;
    this.seeThroughEdgeMin.value = (3 / Math.max(1, radius)) * this.seeThroughMultiplier;
    this.seeThroughEdgeMax.value = (9 / Math.max(1, radius)) * this.seeThroughMultiplier;
  }
}
