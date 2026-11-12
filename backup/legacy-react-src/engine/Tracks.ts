import * as THREE from 'three/webgpu';
import {
  atan,
  float,
  Fn,
  mul,
  positionGeometry,
  sin,
  texture,
  uv,
  varying,
  vec2,
  vec3,
  vec4,
} from 'three/tsl';
import type { GameContext } from './GameContext';

export class Track {
  subdivisions = 96;
  timeThrottle = 1 / 30;
  lastTime = 0;
  thickness: number;
  channelVec3: any;
  distanceThrottle = 0.25;
  lastPosition = new THREE.Vector3(Infinity, Infinity, Infinity);
  dataTexture!: THREE.DataTexture;
  trail!: {
    geometry: THREE.PlaneGeometry;
    material: THREE.MeshBasicNodeMaterial;
    mesh: THREE.Mesh;
  };
  private dataArray: Float32Array;

  constructor(private game: GameContext, thickness = 0.5, channel: 'r' | 'g' | 'b' = 'r') {
    this.thickness = thickness;
    const channels = {
      r: vec3(1, 0, 0),
      g: vec3(0, 1, 0),
      b: vec3(0, 0, 1),
    };
    this.channelVec3 = channels[channel];
    this.dataArray = new Float32Array(this.subdivisions * 4);

    this.dataTexture = new THREE.DataTexture(
      this.dataArray,
      this.subdivisions,
      1,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    this.dataTexture.needsUpdate = true;

    this.createTrail();
  }

  private createTrail(): void {
    const geometry = new THREE.PlaneGeometry(1, 1, this.subdivisions, 1);
    geometry.translate(0.5, 0, 0);

    const material = new THREE.MeshBasicNodeMaterial({
      wireframe: false,
      depthTest: false,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });

    const trackData = varying(vec4());

    material.positionNode = Fn(() => {
      const fragmentSize = float(1).div(this.subdivisions);
      const ratio = uv().x.sub(fragmentSize.mul(0.5));
      const trackUV = vec2(ratio, 0.5);
      const trackUVNext = vec2(ratio.add(fragmentSize), 0.5);

      const data = texture(this.dataTexture, trackUV);
      const dataNext = texture(this.dataTexture, trackUVNext);
      trackData.assign(data);

      const tangent = dataNext.xz.sub(data.xz);
      const angle = atan(tangent.y, tangent.x);

      const offset = vec3(
        sin(angle).mul(positionGeometry.y).mul(this.thickness),
        0,
        angle.cos().mul(positionGeometry.y).mul(this.thickness).negate()
      );

      return vec3(data.x, 0, data.z).add(offset);
    })();

    material.outputNode = Fn(() => {
      const startAlpha = uv().x.smoothstep(0.0, 0.08);
      const endAlpha = uv().x.smoothstep(1.0, 0.35);
      const edgeAlpha = sin(uv().y.mul(Math.PI));
      const alpha = mul(startAlpha, endAlpha, edgeAlpha, trackData.w);
      return vec4(this.channelVec3.mul(alpha), 1);
    })();

    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    mesh.rotation.x = -Math.PI * 0.5;

    this.trail = { geometry, material, mesh };
  }

  update(position: THREE.Vector3 | null | undefined, touching: boolean): void {
    if (!position) return;

    const elapsed = this.game.ticker.elapsed;
    if (elapsed - this.lastTime < this.timeThrottle) return;
    if (this.lastPosition.distanceTo(position) < this.distanceThrottle) return;

    this.lastTime = elapsed;
    this.lastPosition.copy(position);

    const data = this.dataArray;
    for (let i = this.subdivisions - 1; i > 0; i--) {
      const i4 = i * 4;
      const p4 = (i - 1) * 4;
      data[i4 + 0] = data[p4 + 0];
      data[i4 + 1] = data[p4 + 1];
      data[i4 + 2] = data[p4 + 2];
      data[i4 + 3] = data[p4 + 3];
    }

    data[0] = position.x;
    data[1] = position.y;
    data[2] = position.z;
    data[3] = touching ? 1 : 0;

    this.dataTexture.needsUpdate = true;
  }

  dispose(): void {
    this.trail.geometry.dispose();
    this.trail.material.dispose();
    this.dataTexture.dispose();
  }
}

export class Tracks {
  resolution = 512;
  size = 40;
  halfSize = 20;
  tracks: Track[] = [];
  focusPoint = new THREE.Vector2();
  camera: THREE.OrthographicCamera;
  scene: THREE.Scene;
  renderTarget: THREE.RenderTarget;

  constructor(private game: GameContext) {
    this.camera = new THREE.OrthographicCamera(
      -this.halfSize,
      this.halfSize,
      this.halfSize,
      -this.halfSize,
      0.1,
      10
    );
    this.camera.position.y = 5;
    this.camera.rotation.x = -Math.PI * 0.5;

    this.scene = new THREE.Scene();
    this.scene.add(this.camera);

    this.renderTarget = new THREE.RenderTarget(this.resolution, this.resolution, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
    });

    this.game.ticker.events.on(
      'tick',
      () => {
        this.update();
      },
      9
    );
  }

  add(track: Track): Track {
    this.tracks.push(track);
    this.scene.add(track.trail.mesh);
    return track;
  }

  remove(track: Track): void {
    this.tracks = this.tracks.filter((t) => t !== track);
    track.trail.mesh.removeFromParent();
  }

  update(): void {
    this.camera.position.x = this.focusPoint.x;
    this.camera.position.z = this.focusPoint.y;

    const renderer = this.game.rendering.renderer;
    const rendererState = (THREE.RendererUtils.resetRendererState as any)(renderer);

    renderer.setPixelRatio(1);
    renderer.setRenderTarget(this.renderTarget);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);

    THREE.RendererUtils.restoreRendererState(renderer, rendererState);
  }

  dispose(): void {
    for (const t of this.tracks) t.dispose();
    this.renderTarget.dispose();
  }
}
