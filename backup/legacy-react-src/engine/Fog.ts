import { color, mix, rangeFogFactor, uniform, vec2, viewportUV } from 'three/tsl';
import type { GameContext } from './GameContext';

export class Fog {
  colorA = uniform(color('#a6ecf2'));
  colorB = uniform(color('#70b5dc'));
  radialCenter = uniform(vec2(0.5, 0.2));
  radialStart = uniform(0.1);
  radialEnd = uniform(1.1);
  color: any;
  near: any;
  far: any;
  strength: any;

  constructor(private game: GameContext) {
    const colorMix = vec2(viewportUV.xy)
      .sub(this.radialCenter)
      .length()
      .smoothstep(this.radialStart, this.radialEnd);
    this.color = mix(this.colorA, this.colorB, colorMix);
    (this.game.scene as any).backgroundNode = this.color;

    this.near = uniform(this.game.view.optimalArea.nearDistance);
    this.far = uniform(this.game.view.optimalArea.farDistance);
    this.strength = rangeFogFactor(this.near, this.far);

    this.update();

    this.game.ticker.events.on(
      'tick',
      () => {
        this.update();
      },
      10
    );
  }

  update(): void {
    const nearDist = this.game.view.optimalArea.nearDistance;
    const farDist = this.game.view.optimalArea.farDistance;
    const amplitude = farDist - nearDist;

    this.colorA.value.copy(this.game.dayCycles.properties.fogColorA);
    this.colorB.value.copy(this.game.dayCycles.properties.fogColorB);
    this.near.value = nearDist + this.game.dayCycles.properties.fogNearRatio * amplitude;
    this.far.value = nearDist + this.game.dayCycles.properties.fogFarRatio * amplitude;
  }
}

