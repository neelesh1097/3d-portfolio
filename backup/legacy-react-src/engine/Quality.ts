import { Events } from './Events';

export class Quality {
  /** 0 = high (bloom + DOF + 2048 shadows), 1 = low (bloom + 1024 shadows) */
  level: 0 | 1;
  events = new Events();

  constructor() {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const cores = navigator.hardwareConcurrency || 8;
    this.level = isMobile || cores <= 2 ? 1 : 0;
  }

  changeLevel(level: 0 | 1): void {
    if (level === this.level) return;
    this.level = level;
    this.events.trigger('change', [this.level]);
  }
}

