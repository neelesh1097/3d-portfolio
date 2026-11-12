import * as THREE from 'three/webgpu';
import { smoothstep, lerp } from './utilities/maths';
import type { GameContext } from './GameContext';

export type DayMode = 'day' | 'sunset' | 'night' | 'auto';

interface CyclePreset {
  revealColor: THREE.Color;
  revealIntensity: number;
  lightColor: THREE.Color;
  lightIntensity: number;
  shadowColor: THREE.Color;
  fogColorA: THREE.Color;
  fogColorB: THREE.Color;
  fogNearRatio: number;
  fogFarRatio: number;
}

const PRESETS: Record<'day' | 'dusk' | 'night' | 'dawn', CyclePreset> = {
  day: {
    revealColor: new THREE.Color('#43d9f5'),
    revealIntensity: 8.5,
    lightColor: new THREE.Color('#fff1e0'),
    lightIntensity: 1.25,
    shadowColor: new THREE.Color('#4a4f8c'),
    fogColorA: new THREE.Color('#a6ecf2'),
    fogColorB: new THREE.Color('#70b5dc'),
    fogNearRatio: 0.34,
    fogFarRatio: 1.25,
  },
  dusk: {
    revealColor: new THREE.Color('#ff926b'),
    revealIntensity: 6.5,
    lightColor: new THREE.Color('#ff8e72'),
    lightIntensity: 1.2,
    shadowColor: new THREE.Color('#49207c'),
    fogColorA: new THREE.Color('#4b67d6'),
    fogColorB: new THREE.Color('#ff739e'),
    fogNearRatio: 0.08,
    fogFarRatio: 1.25,
  },
  night: {
    revealColor: new THREE.Color('#5be5ff'),
    revealIntensity: 10.0,
    lightColor: new THREE.Color('#3b55ff'),
    lightIntensity: 3.1,
    shadowColor: new THREE.Color('#1a0b6b'),
    fogColorA: new THREE.Color('#0d2252'),
    fogColorB: new THREE.Color('#281048'),
    fogNearRatio: -0.65,
    fogFarRatio: 1.05,
  },
  dawn: {
    revealColor: new THREE.Color('#ffb58a'),
    revealIntensity: 5.5,
    lightColor: new THREE.Color('#ffb48c'),
    lightIntensity: 1.2,
    shadowColor: new THREE.Color('#8c2668'),
    fogColorA: new THREE.Color('#a2d9f5'),
    fogColorB: new THREE.Color('#ff9b6a'),
    fogNearRatio: 0.3,
    fogFarRatio: 1.25,
  },
};

const KEYFRAMES: Array<{ properties: CyclePreset; stop: number }> = [
  { properties: PRESETS.dawn, stop: -0.2 },
  { properties: PRESETS.day, stop: 0.0 },
  { properties: PRESETS.day, stop: 0.2 },
  { properties: PRESETS.dusk, stop: 0.3 },
  { properties: PRESETS.night, stop: 0.42 },
  { properties: PRESETS.night, stop: 0.65 },
  { properties: PRESETS.dawn, stop: 0.82 },
  { properties: PRESETS.day, stop: 0.95 },
  { properties: PRESETS.day, stop: 1.2 },
];

export class DayCycles {
  mode: DayMode = 'day';
  duration = 180; // 3 minute full cycle when in auto mode
  progress = 0.05;
  isNight = false;

  properties = {
    revealColor: PRESETS.day.revealColor.clone(),
    revealIntensity: PRESETS.day.revealIntensity,
    lightColor: PRESETS.day.lightColor.clone(),
    lightIntensity: PRESETS.day.lightIntensity,
    shadowColor: PRESETS.day.shadowColor.clone(),
    fogColorA: PRESETS.day.fogColorA.clone(),
    fogColorB: PRESETS.day.fogColorB.clone(),
    fogNearRatio: PRESETS.day.fogNearRatio,
    fogFarRatio: PRESETS.day.fogFarRatio,
  };

  private autoStartTime = performance.now() / 1000;

  constructor(private game: GameContext) {
    this.update();
    this.game.ticker.events.on(
      'tick',
      () => {
        this.update();
      },
      8
    );
  }

  setMode(mode: DayMode): void {
    this.mode = mode;
    if (mode === 'auto') {
      this.autoStartTime = performance.now() / 1000 - this.progress * this.duration;
    }
    this.update();
  }

  update(): void {
    if (this.mode === 'day') {
      this.progress = 0.08;
    } else if (this.mode === 'sunset') {
      this.progress = 0.295;
    } else if (this.mode === 'night') {
      this.progress = 0.52;
    } else {
      const elapsed = performance.now() / 1000 - this.autoStartTime;
      this.progress = (elapsed / this.duration) % 1;
    }

    this.isNight = this.progress >= 0.28 && this.progress <= 0.72;

    let stepA = KEYFRAMES[0];
    let stepB = KEYFRAMES[1];
    for (let i = 0; i < KEYFRAMES.length - 1; i++) {
      if (this.progress >= KEYFRAMES[i].stop && this.progress <= KEYFRAMES[i + 1].stop) {
        stepA = KEYFRAMES[i];
        stepB = KEYFRAMES[i + 1];
        break;
      }
    }

    const mixRatio = smoothstep(this.progress, stepA.stop, stepB.stop);
    const a = stepA.properties;
    const b = stepB.properties;

    this.properties.revealColor.copy(a.revealColor).lerp(b.revealColor, mixRatio);
    this.properties.revealIntensity = lerp(a.revealIntensity, b.revealIntensity, mixRatio);
    this.properties.lightColor.copy(a.lightColor).lerp(b.lightColor, mixRatio);
    this.properties.lightIntensity = lerp(a.lightIntensity, b.lightIntensity, mixRatio);
    this.properties.shadowColor.copy(a.shadowColor).lerp(b.shadowColor, mixRatio);
    this.properties.fogColorA.copy(a.fogColorA).lerp(b.fogColorA, mixRatio);
    this.properties.fogColorB.copy(a.fogColorB).lerp(b.fogColorB, mixRatio);
    this.properties.fogNearRatio = lerp(a.fogNearRatio, b.fogNearRatio, mixRatio);
    this.properties.fogFarRatio = lerp(a.fogFarRatio, b.fogFarRatio, mixRatio);
  }
}

