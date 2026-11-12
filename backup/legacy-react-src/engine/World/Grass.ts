import * as THREE from 'three/webgpu';
import {
  atan,
  attribute,
  cameraPosition,
  float,
  Fn,
  mod,
  modelWorldMatrix,
  positionLocal,
  rotateUV,
  step,
  texture,
  uniform,
  uniformArray,
  varying,
  vec2,
  vec3,
  vertexIndex,
} from 'three/tsl';
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial';
import type { GameContext } from '../GameContext';

export class Grass {
  subdivisions: number;
  size: number;
  count: number;
  fragmentSize: number;

  geometry!: THREE.BufferGeometry;
  material!: MeshDefaultMaterial;
  mesh!: THREE.Mesh;

  center = uniform(new THREE.Vector2());
  bladeWidth = uniform(0.11);
  bladeHeight = uniform(0.58);
  bladeHeightRandomness = uniform(0.55);
  sizeUniform!: any;

  constructor(private game: GameContext) {
    this.subdivisions = this.game.quality.level === 0 ? 220 : 140;
    const halfExtent = this.game.view.optimalArea.radius || 30;
    this.size = halfExtent * 2;
    this.count = this.subdivisions * this.subdivisions;
    this.fragmentSize = this.size / this.subdivisions;
    this.sizeUniform = uniform(this.size);

    this.createGeometry();
    this.createMaterial();

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.receiveShadow = true;
    this.game.scene.add(this.mesh);

    this.game.ticker.events.on(
      'tick',
      () => {
        this.update();
      },
      10
    );

    this.game.viewport.events.on(
      'throttleChange',
      () => {
        const he = this.game.view.optimalArea.radius;
        this.size = he * 2;
        this.fragmentSize = this.size / this.subdivisions;
        this.sizeUniform.value = this.size;
        this.geometry.dispose();
        this.createGeometry();
        this.mesh.geometry = this.geometry;
      },
      2
    );
  }

  private createGeometry(): void {
    const position = new Float32Array(this.count * 3 * 2);
    const heightRandomness = new Float32Array(this.count * 3);

    for (let iX = 0; iX < this.subdivisions; iX++) {
      const fx = (iX / this.subdivisions - 0.5) * this.size + this.fragmentSize * 0.5;
      for (let iZ = 0; iZ < this.subdivisions; iZ++) {
        const fz = (iZ / this.subdivisions - 0.5) * this.size + this.fragmentSize * 0.5;
        const i = iX * this.subdivisions + iZ;
        const i3 = i * 3;
        const i6 = i * 6;

        const px = fx + (Math.random() - 0.5) * this.fragmentSize;
        const pz = fz + (Math.random() - 0.5) * this.fragmentSize;

        position[i6 + 0] = px;
        position[i6 + 1] = pz;
        position[i6 + 2] = px;
        position[i6 + 3] = pz;
        position[i6 + 4] = px;
        position[i6 + 5] = pz;

        const hr = Math.random();
        heightRandomness[i3 + 0] = hr;
        heightRandomness[i3 + 1] = hr;
        heightRandomness[i3 + 2] = hr;
      }
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1);
    this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 2));
    this.geometry.setAttribute(
      'heightRandomness',
      new THREE.Float32BufferAttribute(heightRandomness, 1)
    );
  }

  private createMaterial(): void {
    const vertexLoopIndex = varying(vertexIndex.toFloat().mod(3));
    const tipness = varying(step(vertexLoopIndex, 0.5));
    const wind = varying(vec2());
    const bladePosition = varying(vec2());

    const bladeShape = uniformArray([
      0, 1, // tip
      1, 0, // left
      -1, 0, // right
    ]);

    const terrainData = this.game.terrain.terrainNode(bladePosition);
    const terrainDataGrass = terrainData.g;
    const tipnessShadowMix = tipness.oneMinus().mul(terrainDataGrass);

    this.material = new MeshDefaultMaterial(this.game, {
      colorNode: this.game.terrain.colorNode(terrainData),
      normalNode: vec3(0, 1, 0),
      hasWater: false,
      hasLightBounce: false,
      shadowNode: tipnessShadowMix,
    });

    const minH = this.game.terrain.minHeight;
    const hRange = this.game.terrain.maxHeight - minH;

    (this.material as any).positionNode = Fn(() => {
      const pos: any = attribute('position', 'vec2');

      const loopPosition = pos.sub(this.center).toVar();
      const halfSize = this.sizeUniform.mul(0.5);
      loopPosition.x.assign(mod(loopPosition.x.add(halfSize), this.sizeUniform).sub(halfSize));
      loopPosition.y.assign(mod(loopPosition.y.add(halfSize), this.sizeUniform).sub(halfSize));

      const position3 = vec3(loopPosition.x, 0, loopPosition.y).add(
        vec3(this.center.x, 0, this.center.y)
      );
      const worldPos = modelWorldMatrix.mul(position3);
      bladePosition.assign(worldPos.xz);

      const bladeTerrain = this.game.terrain.terrainNode(bladePosition);
      const elevation = bladeTerrain.a.mul(hRange).add(minH);
      const hidden = step(bladeTerrain.g.sub(0.38), 0.1);

      const shapeX: any = bladeShape.element(vertexLoopIndex.mul(2));
      const shapeY: any = bladeShape.element(vertexLoopIndex.mul(2).add(1));

      const heightNoise = texture(this.game.noises.perlin, bladePosition.mul(0.06)).r;
      const heightRand: any = attribute('heightRandomness', 'float');
      const h = heightNoise
        .add(heightRand.mul(this.bladeHeightRandomness))
        .mul(this.bladeHeight)
        .mul(bladeTerrain.g);

      const bladeOffset = vec3(
        shapeX.mul(this.bladeWidth).mul(0.5),
        shapeY.mul(h),
        0
      );

      // Billboard toward camera
      const toCamera = cameraPosition.xz.sub(bladePosition);
      const camAngle = atan(toCamera.x, toCamera.y);
      const rotated = rotateUV(bladeOffset.xz, camAngle, vec2(0));
      bladeOffset.x.assign(rotated.x);
      bladeOffset.z.assign(rotated.y);

      // Wind bend on tip
      wind.assign(this.game.wind.offsetNode(bladePosition));
      bladeOffset.x.addAssign(wind.x.mul(tipness).mul(0.85));
      bladeOffset.z.addAssign(wind.y.mul(tipness).mul(0.85));

      const outPos = position3.add(bladeOffset);
      outPos.y.addAssign(elevation);
      outPos.y.addAssign(hidden.mul(120)); // Hide blades off grass

      return outPos;
    })();
  }

  update(): void {
    this.center.value.set(
      this.game.view.optimalArea.position.x,
      this.game.view.optimalArea.position.z
    );
  }
}
