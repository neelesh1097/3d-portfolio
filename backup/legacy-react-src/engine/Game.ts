import * as THREE from 'three/webgpu';
import { Ticker } from './Ticker';
import { Viewport } from './Viewport';
import { Quality } from './Quality';
import { Inputs } from './Inputs/Inputs';
import { ResourcesLoader } from './ResourcesLoader';
import { Rendering, RenderStatsSnapshot } from './Rendering';
import { Noises } from './Noises';
import { DayCycles, DayMode } from './DayCycles';
import { Wind } from './Wind';
import { Water } from './Water';
import { Fog } from './Fog';
import { Lighting } from './Lighting';
import { Reveal } from './Reveal';
import { Terrain } from './Terrain';
import { Tracks } from './Tracks';
import { Materials } from './Materials';
import { Physics } from './Physics/Physics';
import { Objects } from './Objects';
import { Respawns, RespawnPoint } from './Respawns';
import { PhysicsVehicle } from './Physics/PhysicsVehicle';
import { Player } from './Player';
import { View } from './View';
import { Zones } from './Zones';
import { InteractivePoints } from './InteractivePoints';
import { World } from './World/World';
import type { PaintName } from './World/VisualVehicle';
import type { GameContext } from './GameContext';

export interface EngineCallbacks {
  onLoadProgress: (pct: number) => void;
  onReady: () => void;
  onOpenMap: () => void;
  onOpenControls: () => void;
  onAchievement: (achievementId: string) => void;
  onTelemetry: (data: {
    x: number;
    y: number;
    z: number;
    angle: number;
    speedKmh: number;
    boosting: boolean;
    nearestSpot: string;
    stats: RenderStatsSnapshot;
  }) => void;
  onHonk: () => void;
  onJump: () => void;
}

export class Game implements GameContext {
  scene: THREE.Scene;
  RAPIER!: typeof import('@dimforge/rapier3d');
  resources: Record<string, any> = {};

  ticker: Ticker;
  viewport: Viewport;
  quality: Quality;
  inputs: Inputs;
  rendering: Rendering;
  resourcesLoader!: ResourcesLoader;
  noises!: Noises;
  dayCycles!: DayCycles;
  wind!: Wind;
  water!: Water;
  fog!: Fog;
  lighting!: Lighting;
  reveal!: Reveal;
  terrain!: Terrain;
  tracks!: Tracks;
  materials!: Materials;
  physics!: Physics;
  objects!: Objects;
  respawns!: Respawns;
  physicalVehicle!: PhysicsVehicle;
  player!: Player;
  view!: View;
  zones!: Zones;
  interactivePoints!: InteractivePoints;
  world!: World;

  private telemetryAccum = 0;
  private isDisposed = false;

  constructor(
    private container: HTMLElement,
    private canvas: HTMLCanvasElement,
    private callbacks: EngineCallbacks
  ) {
    this.scene = new THREE.Scene();
    this.ticker = new Ticker();
    this.viewport = new Viewport(this.container);
    this.quality = new Quality();
    this.inputs = new Inputs(this.canvas);
    this.rendering = new Rendering(
      this.canvas,
      this.scene,
      this.viewport,
      this.quality,
      this.ticker
    );

    this.boot();
  }

  private async boot(): Promise<void> {
    try {
      await this.rendering.initRenderer();
      if (this.isDisposed) return;

      this.resourcesLoader = new ResourcesLoader(this.rendering.renderer);

      const rapierPromise = import('@dimforge/rapier3d');
      const resourcesPromise = this.resourcesLoader.load(
        [
          [
            'paletteTexture',
            '/assets/palette.png',
            'texture',
            (tex) => {
              tex.minFilter = THREE.NearestFilter;
              tex.magFilter = THREE.NearestFilter;
              tex.generateMipmaps = false;
              tex.colorSpace = THREE.SRGBColorSpace;
            },
          ],
          [
            'foliageTexture',
            '/assets/foliage/foliageSDF.png',
            'texture',
            (tex) => {
              tex.minFilter = THREE.NearestFilter;
              tex.magFilter = THREE.NearestFilter;
              tex.generateMipmaps = false;
            },
          ],
          [
            'terrainTexture',
            '/assets/terrain/terrain.png',
            'texture',
            (tex) => {
              tex.flipY = false;
            },
          ],
          [
            'floorSlabsTexture',
            '/assets/floor/slabs.png',
            'texture',
            (tex) => {
              tex.wrapS = THREE.RepeatWrapping;
              tex.wrapT = THREE.RepeatWrapping;
              tex.minFilter = THREE.LinearFilter;
              tex.magFilter = THREE.LinearFilter;
              tex.generateMipmaps = false;
            },
          ],
          [
            'behindTheSceneStarsTexture',
            '/assets/behindTheScene/stars.png',
            'texture',
            (tex) => {
              tex.colorSpace = THREE.SRGBColorSpace;
              tex.minFilter = THREE.NearestFilter;
              tex.magFilter = THREE.NearestFilter;
              tex.generateMipmaps = false;
              tex.wrapS = THREE.RepeatWrapping;
              tex.wrapT = THREE.RepeatWrapping;
            },
          ],
          [
            'interactivePointsKeyIconEnterTexture',
            '/assets/interactivePoints/interactivePointsKeyIconEnter.png',
            'texture',
            (tex) => {
              tex.minFilter = THREE.NearestFilter;
              tex.magFilter = THREE.NearestFilter;
              tex.generateMipmaps = false;
            },
          ],
          ['respawnsReferencesModel', '/assets/respawns/respawnsReferences-compressed.glb', 'gltf'],
          ['terrainModel', '/assets/terrain/terrain-compressed.glb', 'gltf'],
          ['sceneryModel', '/assets/scenery/scenery-compressed.glb', 'gltf'],
          ['areasModel', '/assets/areas/areas-compressed.glb', 'gltf'],
          ['vehicle', '/assets/vehicle/default-compressed.glb', 'gltf'],
          ['birchTreesVisualModel', '/assets/birchTrees/birchTreesVisual-compressed.glb', 'gltf'],
          ['birchTreesReferencesModel', '/assets/birchTrees/birchTreesReferences-compressed.glb', 'gltf'],
          ['oakTreesVisualModel', '/assets/oakTrees/oakTreesVisual-compressed.glb', 'gltf'],
          ['oakTreesReferencesModel', '/assets/oakTrees/oakTreesReferences-compressed.glb', 'gltf'],
          ['cherryTreesVisualModel', '/assets/cherryTrees/cherryTreesVisual-compressed.glb', 'gltf'],
          ['cherryTreesReferencesModel', '/assets/cherryTrees/cherryTreesReferences-compressed.glb', 'gltf'],
          ['bushesReferencesModel', '/assets/bushes/bushesReferences-compressed.glb', 'gltf'],
          ['flowersReferencesModel', '/assets/flowers/flowersReferences-compressed.glb', 'gltf'],
          ['playgroundVisualModel', '/assets/playground/playgroundVisual-compressed.glb', 'gltf'],
          ['playgroundPhysicalModel', '/assets/playground/playgroundPhysical-compressed.glb', 'gltf'],
          ['benchesModel', '/assets/benches/benches-compressed.glb', 'gltf'],
          ['bricksModel', '/assets/bricks/bricks-compressed.glb', 'gltf'],
          ['fencesModel', '/assets/fences/fences-compressed.glb', 'gltf'],
          ['explosiveCratesModel', '/assets/explosiveCrates/explosiveCrates-compressed.glb', 'gltf'],
          ['lanternsModel', '/assets/lanterns/lanterns-compressed.glb', 'gltf'],
          ['poleLightsModel', '/assets/poleLights/poleLights-compressed.glb', 'gltf'],
        ],
        (remaining, total) => {
          const pct = Math.round(((total - remaining) / total) * 88);
          this.callbacks.onLoadProgress(pct);
        }
      );

      const [loadedResources, rapier] = await Promise.all([resourcesPromise, rapierPromise]);
      if (this.isDisposed) return;

      this.resources = loadedResources;
      this.RAPIER = rapier;
      this.callbacks.onLoadProgress(95);

      this.dayCycles = new DayCycles(this);
      this.noises = new Noises(this.rendering.renderer);
      this.wind = new Wind(this);
      this.water = new Water();
      this.tracks = new Tracks(this);
      this.terrain = new Terrain(this);
      this.view = new View(this);
      this.rendering.setupPostprocessing(this.view.camera);
      this.fog = new Fog(this);
      this.lighting = new Lighting(this);
      this.reveal = new Reveal(this);
      this.materials = new Materials(this);
      this.physics = new Physics(this);
      this.objects = new Objects(this);
      this.respawns = new Respawns(this, 'landing');
      this.physicalVehicle = new PhysicsVehicle(this);
      this.zones = new Zones(this);
      this.player = new Player(this);
      this.interactivePoints = new InteractivePoints(this);

      // Spawn at exact folio-2025 Landing respawn before constructing World so Floor/Grass snap cleanly
      const spawn = this.respawns.getDefault();
      this.player.respawn(spawn.position.x, spawn.position.z, spawn.rotation);

      this.world = new World(this);

      this.world.areas.events.on('openMap', () => this.callbacks.onOpenMap());
      this.world.areas.events.on('openControls', () => this.callbacks.onOpenControls());
      this.world.areas.events.on('resetWorld', () => this.resetVehicle());

      this.player.events.on('achievement', (id: string) => this.callbacks.onAchievement(id));
      this.player.events.on('honk', () => this.callbacks.onHonk());
      this.physicalVehicle.events.on('jump', () => this.callbacks.onJump());

      this.ticker.events.on(
        'tick',
        () => {
          this.inputs.update();
        },
        0
      );

      this.ticker.events.on(
        'tick',
        () => {
          this.inputs.endFrame();
          this.telemetryAccum += this.ticker.delta;
          if (this.telemetryAccum >= 0.1) {
            this.telemetryAccum = 0;
            const closest = this.respawns.getClosest(this.player.position);
            this.callbacks.onTelemetry({
              x: this.player.position.x,
              y: this.player.position.y,
              z: this.player.position.z,
              angle: this.player.rotationY,
              speedKmh: Math.round(this.physicalVehicle.xzSpeed * 6.5),
              boosting: this.player.boosting > 0,
              nearestSpot: closest?.label || 'Island Trail',
              stats: this.rendering.getStats(),
            });
          }
        },
        999
      );

      this.rendering.start();
      this.reveal.playIntroWave(spawn.position.x, spawn.position.z);

      this.callbacks.onLoadProgress(100);
      this.callbacks.onReady();
    } catch (err) {
      console.error('Failed to boot 3D Engine:', err);
    }
  }

  getRespawnSpots(): RespawnPoint[] {
    return this.respawns?.getMapSpots() || [];
  }

  teleportTo(x: number, z: number, rotation?: number): void {
    this.player?.respawn(x, z, rotation);
  }

  teleportToName(name: string): void {
    const pt = this.respawns?.getByName(name) || this.respawns?.getDefault();
    if (pt) {
      this.player?.respawn(pt.position.x, pt.position.z, pt.rotation);
    }
  }

  resetVehicle(): void {
    const spawn = this.respawns?.getDefault();
    this.player?.respawn(spawn?.position.x, spawn?.position.z, spawn?.rotation);
    this.objects?.resetAll();
  }

  setPaint(paint: PaintName): void {
    this.world?.visualVehicle?.setPaint(paint);
  }

  setDayMode(mode: DayMode): void {
    this.dayCycles?.setMode(mode);
  }

  setQuality(level: 'high' | 'medium' | 'low'): void {
    if (!this.quality) return;
    if (level === 'low') {
      this.quality.changeLevel(1);
      this.viewport.setMaxPixelRatio(1.0);
    } else if (level === 'medium') {
      this.quality.changeLevel(1);
      this.viewport.setMaxPixelRatio(1.35);
    } else {
      this.quality.changeLevel(0);
      this.viewport.setMaxPixelRatio(2.0);
    }
  }

  dispose(): void {
    this.isDisposed = true;
    this.inputs.destroy();
    this.viewport.destroy();
    this.noises?.dispose();
    this.terrain?.dispose();
    this.tracks?.dispose();
    this.resourcesLoader?.dispose();
    this.rendering.dispose();
  }
}
