import * as THREE from 'three/webgpu';

export class TextCanvas {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  texture: THREE.Texture;
  lines: string[] = [];

  private font: string;
  private width: number;
  private height: number;
  private horizontalAlign: CanvasTextAlign;
  private lineHeight: number;

  constructor(
    fontFamily = 'Space Grotesk',
    fontWeight = '700',
    fontSize = 18,
    width = 128,
    height = 32,
    density = 2,
    horizontalAlign: CanvasTextAlign = 'center',
    lineHeight = 22
  ) {
    this.font = `${fontWeight} ${fontSize * density}px "${fontFamily}", system-ui, sans-serif`;
    this.width = Math.ceil(width * density);
    this.height = Math.ceil(height * density);
    this.horizontalAlign = horizontalAlign;
    this.lineHeight = lineHeight * density;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.context = this.canvas.getContext('2d')!;
    this.context.font = this.font;

    this.texture = new THREE.Texture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.flipY = false;
    this.texture.generateMipmaps = false;
  }

  updateText(text: string | string[]): void {
    this.lines = Array.isArray(text) ? text : [text];
    this.draw();
  }

  getMeasure(): { width: number } {
    this.context.font = this.font;
    let width = 0;
    for (const line of this.lines) {
      const m = this.context.measureText(line);
      if (m.width > width) width = m.width;
    }
    return { width };
  }

  private draw(): void {
    this.context.fillStyle = '#000000';
    this.context.fillRect(0, 0, this.width, this.height);

    this.context.font = this.font;
    this.context.textAlign = this.horizontalAlign;
    this.context.textBaseline = 'middle';
    this.context.fillStyle = '#ffffff';

    let x = this.width / 2;
    if (this.horizontalAlign === 'left') x = 0;
    else if (this.horizontalAlign === 'right') x = this.width;

    for (let i = 0; i < this.lines.length; i++) {
      const y = this.height / 2 + (i - (this.lines.length - 1) / 2) * this.lineHeight;
      this.context.fillText(this.lines[i], x, y);
    }

    this.texture.needsUpdate = true;
  }
}

