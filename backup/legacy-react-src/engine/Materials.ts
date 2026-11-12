import * as THREE from 'three/webgpu';
import {
  color,
  float,
  Fn,
  luminance,
  mix,
  texture,
  uniform,
  uv,
  vec4,
} from 'three/tsl';
import type { GameContext } from './GameContext';
import { MeshDefaultMaterial } from './Materials/MeshDefaultMaterial';

export class Materials {
  list = new Map<string, any>();
  gradientTexture!: THREE.Texture;

  constructor(private game: GameContext) {
    this.createGradientTexture();
    this.createPalette();

    this.createEmissiveGradient('emissiveOrangeRadialGradient', '#ff8641', '#ff3e00', 1.7, true);
    this.createEmissiveGradient('emissivePurpleRadialGradient', '#454bbc', '#ff2eb4', 1.7, true);
    this.createEmissiveGradient('emissiveBlueRadialGradient', '#91f0ff', '#128fff', 1.7, true);
    this.createEmissiveGradient('emissiveGreenRadialGradient', '#f8ffa6', '#46e068', 1.5, true);
    this.createEmissiveGradient('emissiveWhiteRadialGradient', '#ffffff', '#666666', 2.4, false);

    this.createGradient('redGradient', '#ff3a3a', '#721551');
    this.createGradient('cyanGradient', '#43d9f5', '#0e528a');
    this.createGradient('orangeGradient', '#ff940d', '#af0071');
    this.createGradient('whiteGradient', '#ffffff', '#b5b5b5');
    this.createGradient('blackGradient', '#626262', '#262526');
    this.createColor('darkGray', '#23262e');
  }

  private createGradientTexture(): void {
    const height = 16;
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = height;

    this.gradientTexture = new THREE.Texture(canvas);
    this.gradientTexture.colorSpace = THREE.SRGBColorSpace;

    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0.0, '#43d9f5');
    gradient.addColorStop(0.45, '#f5b84b');
    gradient.addColorStop(1.0, '#3b1578');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, height);
    this.gradientTexture.needsUpdate = true;
  }

  private createPalette(): void {
    const material = new MeshDefaultMaterial(this.game, {
      colorNode: texture(this.game.resources.paletteTexture).rgb,
    });
    this.save('palette', material);
  }

  save(name: string, material: any): void {
    this.list.set(name, material);
  }

  createColor(name: string, hex: string): MeshDefaultMaterial {
    if (this.list.has(name)) return this.list.get(name);
    const mat = new MeshDefaultMaterial(this.game, {
      colorNode: color(hex),
    });
    this.save(name, mat);
    return mat;
  }

  createEmissive(name: string, hex = '#ffffff', intensityVal = 2.2): THREE.MeshBasicNodeMaterial {
    if (this.list.has(name)) return this.list.get(name);
    const baseColor = uniform(color(hex));
    const intensity = uniform(intensityVal);
    const material = new THREE.MeshBasicNodeMaterial({ transparent: true });
    material.colorNode = baseColor.div(luminance(baseColor)).mul(intensity);
    material.fog = false;
    this.save(name, material);
    return material;
  }

  createEmissiveGradient(
    name: string,
    hexA = '#ffffff',
    hexB = '#ff0000',
    intensityVal = 2.0,
    normalize = true
  ): THREE.MeshBasicNodeMaterial {
    const colorA = uniform(color(hexA));
    const colorB = uniform(color(hexB));
    const intensity = uniform(intensityVal);

    const material = new THREE.MeshBasicNodeMaterial({ transparent: true });
    let mixedColor = mix(colorA, colorB, uv().sub(0.5).length().mul(2));
    if (normalize) {
      mixedColor = mixedColor.div(luminance(mixedColor));
    }

    material.outputNode = Fn(() => {
      const outColor = vec4(mixedColor.mul(intensity), 1);
      outColor.assign(MeshDefaultMaterial.revealDiscardNodeBuilder(this.game, outColor));
      return outColor;
    })();
    material.fog = false;
    this.save(name, material);
    return material;
  }

  createGradient(name: string, hexA = '#43d9f5', hexB = '#0e528a'): MeshDefaultMaterial {
    const colorA = uniform(new THREE.Color(hexA));
    const colorB = uniform(new THREE.Color(hexB));
    const baseColor = mix(colorA, colorB, uv().y);
    const material = new MeshDefaultMaterial(this.game, {
      colorNode: baseColor,
    });
    this.save(name, material);
    return material;
  }

  getFromName(name: string, baseMaterial?: any): any {
    if (this.list.has(name)) {
      return this.list.get(name);
    }
    if (!baseMaterial) {
      return this.list.get('palette');
    }
    const material = this.createFromMaterial(baseMaterial);
    this.save(name || `mat_${this.list.size}`, material);
    return material;
  }

  createFromMaterial(baseMaterial: any): any {
    if (
      baseMaterial.isMeshLambertNodeMaterial ||
      baseMaterial.isMeshStandardMaterial ||
      baseMaterial.isMeshBasicMaterial ||
      baseMaterial.isMeshLambertMaterial
    ) {
      const baseColor = baseMaterial.map
        ? texture(baseMaterial.map).rgb
        : color(baseMaterial.color || 0xffffff);

      const alphaNode = baseMaterial.alphaMap
        ? texture(baseMaterial.alphaMap).r
        : baseMaterial.transparent && baseMaterial.map
          ? texture(baseMaterial.map).a
          : float(baseMaterial.opacity ?? 1);

      const material = new MeshDefaultMaterial(this.game, {
        colorNode: baseColor,
        alphaNode,
        hasCoreShadows: true,
        hasDropShadows: true,
        side: baseMaterial.side ?? THREE.FrontSide,
        transparent: Boolean(baseMaterial.transparent || baseMaterial.alphaMap),
      });
      (material as any).map = baseMaterial.map;
      return material;
    }
    return baseMaterial;
  }

  updateObject(root: THREE.Object3D): void {
    root.traverse((child: any) => {
      if (child.isMesh && child.material) {
        if (!child.material.userData?.prevent) {
          child.material = this.getFromName(child.material.name, child.material);
        }
      }
    });
  }
}
