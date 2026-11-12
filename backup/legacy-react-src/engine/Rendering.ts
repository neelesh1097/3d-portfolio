import * as THREE from 'three/webgpu';
import { pass, renderOutput } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { cheapDOF } from './Passes/cheapDOF';
import { Quality } from './Quality';
import { Viewport } from './Viewport';
import { Ticker } from './Ticker';

export interface RenderStatsSnapshot {
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  backend: string;
}

export class Rendering {
  renderer!: THREE.WebGPURenderer;
  postProcessing!: THREE.RenderPipeline;
  bloomPass: any;
  cheapDOFPass: any;

  constructor(
    private canvas: HTMLCanvasElement,
    private scene: THREE.Scene,
    private viewport: Viewport,
    private quality: Quality,
    private ticker: Ticker
  ) {}

  async initRenderer(): Promise<void> {
    this.renderer = new THREE.WebGPURenderer({
      canvas: this.canvas,
      powerPreference: 'high-performance',
      forceWebGL: false,
      antialias: this.viewport.pixelRatio < 2,
    });
    this.renderer.setSize(this.viewport.width, this.viewport.height);
    this.renderer.setPixelRatio(this.viewport.pixelRatio);
    this.renderer.sortObjects = false;
    this.renderer.shadowMap.enabled = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.renderer.setOpaqueSort((a: any, b: any) => a.renderOrder - b.renderOrder);
    this.renderer.setTransparentSort((a: any, b: any) => a.renderOrder - b.renderOrder);

    await this.renderer.init();
  }

  setupPostprocessing(camera: THREE.PerspectiveCamera): void {
    this.postProcessing = new THREE.RenderPipeline(this.renderer);

    const scenePass = pass(this.scene, camera);
    const scenePassColor = scenePass.getTextureNode('output');

    this.bloomPass = bloom(scenePassColor);
    this.bloomPass._nMips = this.quality.level === 0 ? 5 : 2;
    this.bloomPass.threshold.value = 1.05;
    this.bloomPass.strength.value = 0.24;
    this.bloomPass.smoothWidth.value = 1.0;

    this.cheapDOFPass = cheapDOF(renderOutput(scenePass));

    const applyQuality = (level: 0 | 1) => {
      if (level === 0) {
        this.postProcessing.outputNode = this.cheapDOFPass.add(this.bloomPass);
      } else {
        this.postProcessing.outputNode = scenePassColor.add(this.bloomPass);
      }
      this.bloomPass._nMips = level === 0 ? 5 : 2;
      this.postProcessing.needsUpdate = true;
    };

    applyQuality(this.quality.level);
    this.quality.events.on('change', applyQuality);
  }

  start(): void {
    this.renderer.setAnimationLoop((elapsedTime: number) => {
      this.ticker.update(elapsedTime);
    });

    this.ticker.events.on(
      'tick',
      () => {
        this.render();
      },
      998
    );

    this.viewport.events.on('change', () => {
      this.resize();
    });
  }

  resize(): void {
    this.renderer.setSize(this.viewport.width, this.viewport.height);
    this.renderer.setPixelRatio(this.viewport.pixelRatio);
  }

  render(): void {
    this.postProcessing.render();
  }

  getStats(): RenderStatsSnapshot {
    const backend = (this.renderer as any).backend?.isWebGPUBackend ? 'WebGPU' : 'WebGL2';
    return {
      drawCalls: this.renderer.info.render.drawCalls || 0,
      triangles: this.renderer.info.render.triangles || 0,
      geometries: this.renderer.info.memory.geometries || 0,
      textures: this.renderer.info.memory.textures || 0,
      backend,
    };
  }

  dispose(): void {
    this.renderer.setAnimationLoop(null);
    this.renderer.dispose();
  }
}

