import { uniform } from 'three/tsl';
import { Events } from './Events';

export class Ticker {
  elapsed = 0;
  delta = 1 / 60;
  maxDelta = 1 / 30;
  scale = 2;
  deltaScaled = (1 / 60) * 2;
  elapsedScaled = 0;
  deltaAverage = 1 / 60;

  private waits: Array<[number, () => void]> = [];
  private lastDeltas: number[] = [];

  elapsedUniform = uniform(0);
  deltaUniform = uniform(1 / 60);
  elapsedScaledUniform = uniform(0);
  deltaScaledUniform = uniform((1 / 60) * 2);

  events = new Events();

  update(elapsedMs: number): void {
    const elapsedSeconds = elapsedMs / 1000;
    this.delta = Math.max(0.0001, Math.min(elapsedSeconds - this.elapsed, this.maxDelta));
    this.elapsed = elapsedSeconds;
    this.deltaScaled = this.delta * this.scale;
    this.elapsedScaled += this.deltaScaled;

    this.lastDeltas.unshift(this.delta);
    if (this.lastDeltas.length > 30) {
      this.lastDeltas.length = 30;
    }
    let sum = 0;
    for (let i = 0; i < this.lastDeltas.length; i++) {
      sum += this.lastDeltas[i];
    }
    this.deltaAverage = sum / this.lastDeltas.length;

    this.elapsedUniform.value = this.elapsed;
    this.deltaUniform.value = this.delta;
    this.elapsedScaledUniform.value = this.elapsedScaled;
    this.deltaScaledUniform.value = this.deltaScaled;

    for (let i = 0; i < this.waits.length; i++) {
      this.waits[i][0]--;
      if (this.waits[i][0] <= 0) {
        const cb = this.waits[i][1];
        this.waits.splice(i, 1);
        i--;
        cb();
      }
    }

    this.events.trigger('tick');
  }

  wait(frames: number, callback: () => void): void {
    this.waits.push([Math.max(1, frames), callback]);
  }
}

