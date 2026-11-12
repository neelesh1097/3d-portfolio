import * as THREE from 'three/webgpu';
import { Fn, mix, texture, uniform, vec2 } from 'three/tsl';
import type { GameContext } from './GameContext';

export class Terrain {
  size = 192;
  subdivision = 128; // 129x129 heightfield
  minHeight = -1.5;
  maxHeight = 4.0;

  heightGrid!: Float32Array;
  rowsCount = 129;

  dataTexture!: THREE.Texture;
  gradientTexture!: THREE.Texture;
  grassColorUniform = uniform(new THREE.Color('#b8b62e'));
  tracksDelta = uniform(vec2(0));

  terrainNode: any;
  colorNode: any;

  constructor(private game: GameContext) {
    this.dataTexture = this.game.resources.terrainTexture;
    this.extractHeightGrid();
    this.buildGradientTexture();
    this.buildNodes();

    this.game.ticker.events.on(
      'tick',
      () => {
        this.tracksDelta.value.set(
          this.game.tracks.focusPoint.x,
          this.game.tracks.focusPoint.y
        );
      },
      10
    );
  }

  private extractHeightGrid(): void {
    const geom = this.game.resources.terrainModel?.scene?.children?.[0]?.geometry;
    const rows = this.subdivision + 1;
    this.rowsCount = rows;
    this.heightGrid = new Float32Array(rows * rows);

    if (!geom?.attributes?.position) return;

    const posAttr = geom.attributes.position;
    const totalCount = posAttr.count;
    const gridRows = Math.round(Math.sqrt(totalCount));
    this.rowsCount = gridRows;
    this.subdivision = gridRows - 1;
    this.heightGrid = new Float32Array(totalCount);

    const halfExtent = this.size * 0.5;
    for (let i = 0; i < totalCount; i++) {
      const x = posAttr.array[i * 3 + 0];
      const y = posAttr.array[i * 3 + 1];
      const z = posAttr.array[i * 3 + 2];
      const indexX = Math.max(0, Math.min(gridRows - 1, Math.round((x / (halfExtent * 2) + 0.5) * (gridRows - 1))));
      const indexZ = Math.max(0, Math.min(gridRows - 1, Math.round((z / (halfExtent * 2) + 0.5) * (gridRows - 1))));
      const index = indexZ + indexX * gridRows;
      this.heightGrid[index] = y;
    }
  }

  getHeightAt(x: number, z: number): number {
    const half = this.size * 0.5;
    const u = Math.max(0, Math.min(1, (x + half) / this.size)) * (this.rowsCount - 1);
    const v = Math.max(0, Math.min(1, (z + half) / this.size)) * (this.rowsCount - 1);
    const ix = Math.min(this.rowsCount - 2, Math.floor(u));
    const iz = Math.min(this.rowsCount - 2, Math.floor(v));
    const fx = u - ix;
    const fz = v - iz;

    const h00 = this.heightGrid[iz + ix * this.rowsCount] ?? 0;
    const h10 = this.heightGrid[iz + (ix + 1) * this.rowsCount] ?? 0;
    const h01 = this.heightGrid[iz + 1 + ix * this.rowsCount] ?? 0;
    const h11 = this.heightGrid[iz + 1 + (ix + 1) * this.rowsCount] ?? 0;

    const hx0 = h00 + (h10 - h00) * fx;
    const hx1 = h01 + (h11 - h01) * fx;
    return hx0 + (hx1 - hx0) * fz;
  }

  private buildGradientTexture(): void {
    const height = 16;
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = height;

    this.gradientTexture = new THREE.Texture(canvas);
    this.gradientTexture.colorSpace = THREE.SRGBColorSpace;
    this.gradientTexture.minFilter = THREE.LinearFilter;
    this.gradientTexture.magFilter = THREE.LinearFilter;

    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0.1, '#ffa94e');
    gradient.addColorStop(0.3, '#5bc2b9');
    gradient.addColorStop(0.9, '#13375f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, height);
    this.gradientTexture.needsUpdate = true;
  }

  private buildNodes(): void {
    const worldPositionToUvNode: any = Fn(([position]: any) => {
      return position.div(this.subdivision).div(1.5).add(0.5);
    });

    this.terrainNode = Fn(([position]: any) => {
      const textureUv = worldPositionToUvNode(position);
      const data = texture(this.dataTexture, textureUv);

      const groundDataColor = texture(
        this.game.tracks.renderTarget.texture,
        position
          .sub(-this.game.tracks.halfSize)
          .sub(this.tracksDelta)
          .div(this.game.tracks.size)
      );
      data.g.mulAssign(groundDataColor.r.oneMinus());

      return data;
    });

    this.colorNode = (Fn as any)(([terrainData]: any) => {
      const baseColor = texture(this.gradientTexture, vec2(0.5, terrainData.b.oneMinus()));
      baseColor.assign(mix(baseColor, this.grassColorUniform, terrainData.g));
      return baseColor.rgb;
    });
  }

  dispose(): void {
    this.gradientTexture.dispose();
  }
}
