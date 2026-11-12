import * as THREE from 'three/webgpu';
import {
  color,
  Fn,
  mix,
  positionWorld,
  screenUV,
  texture,
  uniform,
  vec3,
  vec4,
  viewportSharedTexture,
} from 'three/tsl';
import { hashBlur } from 'three/examples/jsm/tsl/display/hashBlur.js';
import type { GameContext } from '../GameContext';

export class WaterSurface {
  mesh!: THREE.Mesh;
  geometry!: THREE.PlaneGeometry;
  ripplesRatio = uniform(1);

  constructor(private game: GameContext) {
    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    this.geometry.rotateX(-Math.PI * 0.5);

    this.mesh = new THREE.Mesh(this.geometry, this.createMaterial());
    this.mesh.position.y = this.game.water.surfaceElevation;
    this.mesh.renderOrder = 1;
    const scale = this.game.view.optimalArea.radius * 2.8;
    this.mesh.scale.set(scale, 1, scale);

    this.game.scene.add(this.mesh);
    // Keep water early in children list for screen texture refraction
    this.game.scene.children.pop();
    this.game.scene.children.unshift(this.mesh);

    this.game.quality.events.on('change', () => {
      const prevMat = this.mesh.material as THREE.Material;
      this.mesh.material = this.createMaterial();
      prevMat.dispose();
    });

    this.game.ticker.events.on(
      'tick',
      () => {
        this.update();
      },
      10
    );
  }

  private createMaterial(): THREE.MeshBasicNodeMaterial {
    const terrainData = this.game.terrain.terrainNode(positionWorld.xz);
    const ripplesSlopeFreq = uniform(9.5);
    const ripplesNoiseFreq = uniform(0.09);
    const ripplesNoiseOffset = uniform(0.35);

    const ripplesNode = Fn(() => {
      const baseRipple = terrainData.b.add(this.game.wind.localTime.mul(0.48)).mul(ripplesSlopeFreq);
      const rippleIndex = baseRipple.floor();
      const ripplesNoise = texture(
        this.game.noises.perlin,
        positionWorld.xz.add(rippleIndex.div(ripplesNoiseOffset)).mul(ripplesNoiseFreq)
      ).r;

      const ripples = terrainData.b
        .add(this.game.wind.localTime.mul(0.48))
        .mul(ripplesSlopeFreq)
        .mod(1)
        .sub(terrainData.b.remap(0, 1, -0.3, 1).oneMinus())
        .add(ripplesNoise);

      return this.ripplesRatio.remap(0, 1, -1, -0.42).step(ripples);
    })();

    const shoreNode = terrainData.b.lessThan(0.18).oneMinus();

    const waterColorUniform = uniform(color('#32b2ba'));
    const surfaceColorUniform = uniform(color('#dffbff'));

    const material = new THREE.MeshBasicNodeMaterial({
      transparent: this.game.quality.level === 0,
      depthWrite: true,
    });

    material.outputNode = Fn(() => {
      const surfaceAlpha = ripplesNode.mul(shoreNode);
      const tintedWater = mix(
        waterColorUniform,
        this.game.fog.color,
        this.game.fog.strength.mul(0.85)
      );

      if (this.game.quality.level === 0) {
        const blurredUnderwater = hashBlur(viewportSharedTexture(screenUV), 0.008, {
          repeats: 16,
          premultipliedAlpha: true,
        } as any);
        const refracted = mix(blurredUnderwater.rgb, tintedWater, 0.58);
        const finalCol = mix(refracted, surfaceColorUniform, surfaceAlpha.mul(0.72));
        return vec4(finalCol, 1);
      }

      const finalCol = mix(tintedWater, surfaceColorUniform, surfaceAlpha.mul(0.65));
      return vec4(vec3(finalCol), 1);
    })();

    return material;
  }

  update(): void {
    const pos = this.game.view.optimalArea.position;
    this.mesh.position.x = pos.x;
    this.mesh.position.z = pos.z;
    const scale = this.game.view.optimalArea.radius * 2.8;
    this.mesh.scale.set(scale, 1, scale);
  }
}

