import * as THREE from 'three/webgpu';
import { uniform, color, float } from 'three/tsl';
import type { GameContext } from './GameContext';

export class Lighting {
  phi = 0.62;
  theta = 0.75;
  phiAmplitude = 0.45;
  thetaAmplitude = 1.1;
  near = 1;
  spherical: THREE.Spherical;
  direction: THREE.Vector3;
  directionUniform: any;
  colorUniform: any;
  intensityUniform: any;

  lightBounceEdgeLow = uniform(float(-1));
  lightBounceEdgeHigh = uniform(float(1));
  lightBounceDistance = uniform(float(1.6));
  lightBounceMultiplier = uniform(float(0.85));

  shadowColor: any;
  coreShadowEdgeLow = uniform(float(-0.25));
  coreShadowEdgeHigh = uniform(float(1));

  light!: THREE.DirectionalLight;
  mapSize: number;
  shadowAmplitude: number;
  depth: number;
  shadowBias = -0.001;
  shadowNormalBias = 0.1;
  shadowRadius: number;

  constructor(private game: GameContext) {
    const radius = this.game.view.optimalArea.radius || 30;
    this.spherical = new THREE.Spherical(radius + this.near, this.phi, this.theta);
    this.direction = new THREE.Vector3().setFromSpherical(this.spherical).normalize();
    this.directionUniform = uniform(this.direction);
    this.colorUniform = uniform(color('#fff1e0'));
    this.intensityUniform = uniform(1.25);
    this.shadowColor = uniform(this.game.dayCycles.properties.shadowColor.clone());

    this.mapSize = this.game.quality.level === 0 ? 2048 : 1024;
    this.shadowAmplitude = radius;
    this.depth = radius * 2.2;
    this.shadowRadius = this.game.quality.level === 0 ? 3 : 2;

    this.light = new THREE.DirectionalLight(0xffffff, 4.5);
    this.light.position.setFromSpherical(this.spherical);
    this.light.castShadow = true;
    this.game.scene.add(this.light);
    this.game.scene.add(this.light.target);

    this.updateShadow();
    this.update();

    this.game.ticker.events.on(
      'tick',
      () => {
        this.update();
      },
      9
    );

    this.game.viewport.events.on(
      'throttleChange',
      () => {
        const r = this.game.view.optimalArea.radius;
        this.spherical.radius = r + this.near;
        this.shadowAmplitude = r;
        this.depth = r * 2.2;
        this.updateShadow();
      },
      3
    );

    this.game.quality.events.on('change', (level: 0 | 1) => {
      this.mapSize = level === 0 ? 2048 : 1024;
      this.shadowRadius = level === 0 ? 3 : 2;
      this.updateShadow();
    });
  }

  updateShadow(): void {
    this.light.shadow.camera.top = this.shadowAmplitude;
    this.light.shadow.camera.right = this.shadowAmplitude;
    this.light.shadow.camera.bottom = -this.shadowAmplitude;
    this.light.shadow.camera.left = -this.shadowAmplitude;
    this.light.shadow.camera.near = this.near;
    this.light.shadow.camera.far = this.near + this.depth;
    this.light.shadow.camera.updateProjectionMatrix();

    this.light.shadow.bias = this.shadowBias;
    this.light.shadow.normalBias = this.shadowNormalBias;
    this.light.shadow.radius = this.shadowRadius;
    this.light.shadow.mapSize.set(this.mapSize, this.mapSize);
    if (this.light.shadow.map) {
      this.light.shadow.map.dispose();
      this.light.shadow.map = null;
    }
  }

  update(): void {
    const dayOffset = this.game.dayCycles.progress - 0.08;
    const angle = dayOffset * Math.PI * 2;
    this.spherical.phi = this.phi + Math.sin(angle * 0.5) * this.phiAmplitude * 0.4;
    this.spherical.theta = this.theta + Math.sin(angle) * this.thetaAmplitude;

    const focusPos = this.game.view.optimalArea.position;
    this.light.position.setFromSpherical(this.spherical);
    this.direction.copy(this.light.position).normalize();
    this.directionUniform.value.copy(this.direction);

    this.light.position.add(focusPos);
    this.light.target.position.copy(focusPos);

    this.colorUniform.value.copy(this.game.dayCycles.properties.lightColor);
    this.intensityUniform.value = this.game.dayCycles.properties.lightIntensity;
    this.shadowColor.value.copy(this.game.dayCycles.properties.shadowColor);
  }
}

