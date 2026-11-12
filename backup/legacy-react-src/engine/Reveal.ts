import * as THREE from 'three/webgpu';
import { color, uniform, vec2 } from 'three/tsl';
import gsap from 'gsap';
import type { GameContext } from './GameContext';

export class Reveal {
  position = new THREE.Vector3(0, 0, 0);
  position2Uniform = uniform(vec2(0, 0));
  distance = uniform(0);
  thickness = uniform(0.08);
  color = uniform(color('#43d9f5'));
  intensity = uniform(8.0);
  private completed = false;

  constructor(private game: GameContext) {
    this.game.ticker.events.on(
      'tick',
      () => {
        this.color.value.copy(this.game.dayCycles.properties.revealColor);
        this.intensity.value = this.game.dayCycles.properties.revealIntensity;
      },
      10
    );
  }

  playIntroWave(originX = 0, originZ = 0): void {
    if (this.completed) return;
    this.completed = true;
    this.position.set(originX, 0, originZ);
    this.position2Uniform.value.set(originX, originZ);
    this.distance.value = 18;

    gsap.to(this.distance, {
      value: 160,
      ease: 'power2.out',
      duration: 1.35,
      overwrite: true,
      onComplete: () => {
        this.distance.value = 99999;
      },
    });
  }

  showFullImmediately(): void {
    this.completed = true;
    this.distance.value = 99999;
  }
}

