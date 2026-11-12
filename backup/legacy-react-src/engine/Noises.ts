import * as THREE from 'three/webgpu';
import {
  If,
  vec2,
  vec3,
  vec4,
  mod,
  Fn,
  dot,
  sin,
  fract,
  length,
  mul,
  float,
  uv,
  floor,
  ceil,
  smoothstep,
  int,
  mix,
  Loop,
  viewportUV,
} from 'three/tsl';

const hash2D: any = Fn(([pImmutable]: any) => {
  const p = vec2(pImmutable).toVar();
  p.assign(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))));
  return fract(sin(p).mul(43758.5453123));
});

const voronoiNode: any = Fn(([uvImmutable, repeatImmutable]: any) => {
  const repeat = float(repeatImmutable).toVar();
  const st = vec2(uvImmutable).toVar();
  const cellId = vec2(0.0).toVar();
  st.mulAssign(repeat);
  const i = vec2(floor(st)).toVar();
  const f = vec2(fract(st)).toVar();
  const minDist = float(1.0).toVar();
  const minEdge = float(1.0).toVar();
  const bestId = vec2(0.0).toVar();

  Loop(
    { start: int(-1), end: int(1), condition: '<=' },
    { start: int(-1), end: int(1), condition: '<=' },
    ({ i: y, j: x }: any) => {
      const neighbor = vec2(x, y).toVar();
      const cell = vec2(mod(i.add(neighbor), repeat)).toVar();
      const point = vec2(hash2D(cell)).toVar();
      const diff = vec2(neighbor.add(point.sub(f))).toVar();
      const dist = float(length(diff)).toVar();

      If(dist.lessThan(minDist), () => {
        minEdge.assign(minDist);
        minDist.assign(dist);
        bestId.assign(i.add(neighbor));
      }).ElseIf(dist.lessThan(minEdge), () => {
        minEdge.assign(dist);
      });
    }
  );

  cellId.assign(fract(bestId.div(repeat)));
  return vec3(minDist, minEdge.sub(minDist), hash2D(cellId).x);
});

const modulo2D: any = Fn(([dividendImmutable, divisorImmutable]: any) => {
  const divisor = vec2(divisorImmutable).toVar();
  const dividend = vec2(dividendImmutable).toVar();
  const positiveDividend = vec2(mod(dividend, divisor).add(divisor)).toVar();
  return mod(positiveDividend, divisor);
});

const random2D: any = Fn(([valImmutable]: any) => {
  const value = vec2(valImmutable).toVar();
  value.assign(vec2(dot(value, vec2(127.1, 311.7)), dot(value, vec2(269.5, 183.3))));
  return float(-1.0).add(mul(2.0, fract(sin(value).mul(43758.5453123))));
});

const perlinNode: any = Fn(([uvImmutable, cellAmountImmutable, periodImmutable]: any) => {
  const period = vec2(periodImmutable).toVar();
  const cellAmount = float(cellAmountImmutable).toVar();
  const st = vec2(uvImmutable).toVar();
  st.assign(st.mul(float(cellAmount)));
  const cellsMin = vec2(floor(st)).toVar();
  const cellsMax = vec2(ceil(st)).toVar();
  const uvFract = vec2(fract(st)).toVar();
  cellsMin.assign(modulo2D(cellsMin, period));
  cellsMax.assign(modulo2D(cellsMax, period));
  const blur = vec2(smoothstep(0.0, 1.0, uvFract)).toVar();
  const ll = vec2(random2D(vec2(cellsMin.x, cellsMin.y))).toVar();
  const lr = vec2(random2D(vec2(cellsMax.x, cellsMin.y))).toVar();
  const ul = vec2(random2D(vec2(cellsMin.x, cellsMax.y))).toVar();
  const ur = vec2(random2D(vec2(cellsMax.x, cellsMax.y))).toVar();
  const fraction = vec2(fract(st)).toVar();

  return mix(
    mix(
      dot(ll, fraction.sub(vec2(int(0), int(0)))),
      dot(lr, fraction.sub(vec2(int(1), int(0)))),
      blur.x
    ),
    mix(
      dot(ul, fraction.sub(vec2(int(0), int(1)))),
      dot(ur, fraction.sub(vec2(int(1), int(1)))),
      blur.x
    ),
    blur.y
  )
    .mul(0.8)
    .add(0.5);
});

export class Noises {
  resolution = 128;
  voronoi!: THREE.Texture;
  perlin!: THREE.Texture;
  hash!: THREE.Texture;
  private quadMesh = new (THREE.QuadMesh as any)();
  private renderTargets: THREE.RenderTarget[] = [];

  constructor(private renderer: any) {
    this.createVoronoi();
    this.createPerlin();
    this.createHash();
  }

  private renderToTarget(rt: THREE.RenderTarget, material: THREE.MeshBasicNodeMaterial): void {
    this.quadMesh.material = material;
    const rendererState = (THREE.RendererUtils.resetRendererState as any)(this.renderer);
    this.renderer.setPixelRatio(1);
    this.renderer.setRenderTarget(rt);
    this.quadMesh.render(this.renderer);
    this.renderer.setRenderTarget(null);
    THREE.RendererUtils.restoreRendererState(this.renderer, rendererState);
  }

  private createVoronoi(): void {
    const rt = new THREE.RenderTarget(this.resolution, this.resolution, {
      depthBuffer: false,
      type: THREE.HalfFloatType,
    });
    this.renderTargets.push(rt);
    this.voronoi = rt.texture;
    this.voronoi.wrapS = THREE.RepeatWrapping;
    this.voronoi.wrapT = THREE.RepeatWrapping;

    const material = new THREE.MeshBasicNodeMaterial();
    material.outputNode = vec4(voronoiNode(uv(), 8), 0);
    this.renderToTarget(rt, material);
    material.dispose();
  }

  private createPerlin(): void {
    const rt = new THREE.RenderTarget(this.resolution, this.resolution, {
      depthBuffer: false,
      format: THREE.RedFormat,
      type: THREE.HalfFloatType,
    });
    this.renderTargets.push(rt);
    this.perlin = rt.texture;
    this.perlin.wrapS = THREE.RepeatWrapping;
    this.perlin.wrapT = THREE.RepeatWrapping;

    const material = new THREE.MeshBasicNodeMaterial();
    material.outputNode = vec4(
      perlinNode(uv(), 6.0, vec2(6.0, 6.0)).remap(0.1, 0.9, 0.0, 1.0),
      hash2D(uv().mul(128).floor().div(128)).x,
      0,
      0
    );
    this.renderToTarget(rt, material);
    material.dispose();
  }

  private createHash(): void {
    const rt = new THREE.RenderTarget(this.resolution, this.resolution, {
      depthBuffer: false,
      format: THREE.RedFormat,
      type: THREE.HalfFloatType,
    });
    this.renderTargets.push(rt);
    this.hash = rt.texture;
    this.hash.wrapS = THREE.RepeatWrapping;
    this.hash.wrapT = THREE.RepeatWrapping;
    this.hash.minFilter = THREE.NearestFilter;
    this.hash.magFilter = THREE.NearestFilter;
    this.hash.generateMipmaps = false;

    const material = new THREE.MeshBasicNodeMaterial();
    material.outputNode = vec4(hash2D(viewportUV).x, 0, 0, 0);
    this.renderToTarget(rt, material);
    material.dispose();
  }

  dispose(): void {
    for (const rt of this.renderTargets) rt.dispose();
    this.quadMesh.geometry.dispose();
  }
}
