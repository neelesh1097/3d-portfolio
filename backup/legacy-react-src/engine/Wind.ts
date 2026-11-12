import { vec2, Fn, texture, uniform } from 'three/tsl';
import type { GameContext } from './GameContext';

export class Wind {
  angle = Math.PI * 0.6;
  direction = uniform(vec2(Math.sin(Math.PI * 0.6), Math.cos(Math.PI * 0.6)));
  positionFrequency = uniform(0.5);
  strength = uniform(0.45);
  localTime = uniform(0);
  timeFrequency = 0.08;
  offsetNode: any;

  constructor(private game: GameContext) {
    this.offsetNode = Fn(([position]: any) => {
      const remapped = position.mul(this.positionFrequency);

      const noiseUv1 = remapped.xy.mul(0.2).add(this.direction.mul(this.localTime)).xy;
      const noise1 = texture(this.game.noises.perlin, noiseUv1).r.sub(0.5);

      const noiseUv2 = remapped.xy.mul(0.1).add(this.direction.mul(this.localTime.mul(0.2))).xy;
      const noise2 = texture(this.game.noises.perlin, noiseUv2).r.sub(0.5);

      const intensity = noise2.add(noise1);
      return vec2(this.direction.mul(intensity).mul(this.strength));
    });

    this.game.ticker.events.on(
      'tick',
      () => {
        this.localTime.value +=
          this.game.ticker.deltaScaled * this.timeFrequency * this.strength.value;
      },
      9
    );
  }
}

