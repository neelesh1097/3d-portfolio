import { Events } from './Events';

export class Viewport {
  width: number;
  height: number;
  ratio: number;
  pixelRatio: number;
  maxPixelRatio: number;
  events = new Events();

  private throttleTimer: number | null = null;
  private resizeHandler: () => void;

  constructor(private container: HTMLElement) {
    const isMobile =
      /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      window.innerWidth < 768;
    this.maxPixelRatio = isMobile ? 1.5 : 2;
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;
    this.ratio = this.width / Math.max(1, this.height);
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, this.maxPixelRatio);

    this.resizeHandler = () => {
      this.measure();
      this.events.trigger('change');
      if (this.throttleTimer !== null) {
        window.clearTimeout(this.throttleTimer);
      }
      this.throttleTimer = window.setTimeout(() => {
        this.events.trigger('throttleChange');
      }, 250);
    };

    window.addEventListener('resize', this.resizeHandler);
  }

  measure(): void {
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;
    this.ratio = this.width / Math.max(1, this.height);
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, this.maxPixelRatio);
  }

  setMaxPixelRatio(cap: number): void {
    this.maxPixelRatio = cap;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, this.maxPixelRatio);
    this.events.trigger('change');
  }

  destroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
    if (this.throttleTimer !== null) {
      window.clearTimeout(this.throttleTimer);
    }
  }
}

