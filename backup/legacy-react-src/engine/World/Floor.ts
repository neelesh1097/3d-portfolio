import * as THREE from 'three/webgpu';
import {
  color,
  Fn,
  min,
  mix,
  positionLocal,
  positionWorld,
  texture,
  uniform,
  uv,
  vec3,
} from 'three/tsl';
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial';
import type { GameContext } from '../GameContext';

export class Floor {
  mesh!: THREE.Mesh;
  size = 64;
  cellSize = 1.5;
  subdivisions = 48;
  bedRock: { halfHeight: number; halfWidth: number; enabled: boolean; physical: any } | null = null;

  constructor(private game: GameContext) {
    this.setupVisual();
    this.setupPhysical();
    this.setupBedRock();

    this.game.ticker.events.on(
      'tick',
      () => {
        this.update();
      },
      10
    );
  }

  private setupVisual(): void {
    this.size = Math.round(this.game.view.optimalArea.radius * 2.2) + 4;
    this.subdivisions = Math.max(40, Math.round(this.size / this.cellSize));

    let geometry = new THREE.PlaneGeometry(
      this.size,
      this.size,
      this.subdivisions,
      this.subdivisions
    );
    geometry.rotateX(-Math.PI * 0.5);
    geometry.deleteAttribute('normal');

    const terrainData = this.game.terrain.terrainNode(positionWorld.xz);
    const slabHighColor = uniform(color('#ffcf8b'));
    const slabLowColor = uniform(color('#a87762'));
    const slabTextureFrequency = uniform(0.175);
    const slabNoiseFrequency = uniform(0.03);

    const colorNode = Fn(() => {
      const baseColor = this.game.terrain.colorNode(terrainData);

      const slabTerrain = terrainData.r;
      const slabNoiseUv = positionWorld.xz.mul(slabNoiseFrequency);
      const slabNoise = texture(this.game.noises.perlin, slabNoiseUv).r;
      const slabsTex = texture(
        this.game.resources.floorSlabsTexture,
        positionWorld.xz.mul(slabTextureFrequency)
      ).r;
      const slabColor = mix(slabLowColor, slabHighColor, slabsTex);

      const slab = slabTerrain.mul(slabNoise);
      return mix(baseColor, slabColor, slab);
    })();

    const material = new MeshDefaultMaterial(this.game, {
      colorNode,
      normalNode: vec3(0, 1, 0),
      shadowNode: terrainData.g,
      hasWater: false,
      hasLightBounce: false,
    });

    material.positionNode = Fn(() => {
      const uvDim = min(min(uv().x, uv().y).mul(20), 1);
      const newPosition = positionLocal.toVar();
      newPosition.y.addAssign(terrainData.b.mul(-1.5).mul(uvDim));
      return newPosition;
    })();

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.receiveShadow = true;
    this.game.scene.add(this.mesh);

    this.game.viewport.events.on(
      'throttleChange',
      () => {
        this.size = Math.round(this.game.view.optimalArea.radius * 2.2) + 4;
        this.subdivisions = Math.max(40, Math.round(this.size / this.cellSize));
        geometry.dispose();
        geometry = new THREE.PlaneGeometry(
          this.size,
          this.size,
          this.subdivisions,
          this.subdivisions
        );
        geometry.rotateX(-Math.PI * 0.5);
        geometry.deleteAttribute('normal');
        this.mesh.geometry = geometry;
      },
      2
    );
  }

  private setupPhysical(): void {
    const sub = this.game.terrain.subdivision;
    const size = this.game.terrain.size;

    this.game.objects.add(null, {
      type: 'fixed',
      friction: 0.2,
      restitution: 0.15,
      colliders: [
        {
          shape: 'heightfield',
          parameters: [sub, sub, this.game.terrain.heightGrid, { x: size, y: 1, z: size }],
          category: 'floor',
        },
      ],
    });
  }

  private setupBedRock(): void {
    const halfHeight = 0.5;
    const halfWidth = 6;
    const physical = this.game.physics.getPhysical({
      type: 'kinematicPositionBased',
      position: { x: 0, y: this.game.water.depthElevation - halfHeight, z: 0 },
      frictionRule: 'min',
      friction: 0.5,
      enabled: false,
      colliders: [{ shape: 'cuboid', parameters: [halfWidth, halfHeight, halfWidth], category: 'floor' }],
    });
    this.bedRock = { halfHeight, halfWidth, enabled: false, physical };
  }

  update(): void {
    const pos = this.game.view.optimalArea.position;
    this.mesh.position.x = Math.round(pos.x / this.cellSize) * this.cellSize;
    this.mesh.position.z = Math.round(pos.z / this.cellSize) * this.cellSize;

    if (this.bedRock) {
      const halfLimit = this.game.terrain.size * 0.5 - this.bedRock.halfWidth;
      if (
        Math.abs(this.game.player.position.x) > halfLimit ||
        Math.abs(this.game.player.position.z) > halfLimit
      ) {
        if (!this.bedRock.enabled) {
          this.bedRock.enabled = true;
          this.bedRock.physical.body.setEnabled(true);
        }
        const px = Math.round(this.game.player.position.x);
        const pz = Math.round(this.game.player.position.z);
        this.bedRock.physical.body.setNextKinematicTranslation({
          x: px,
          y: this.game.water.depthElevation - this.bedRock.halfHeight,
          z: pz,
        });
      } else if (this.bedRock.enabled) {
        this.bedRock.enabled = false;
        this.bedRock.physical.body.setEnabled(false);
      }
    }
  }
}
