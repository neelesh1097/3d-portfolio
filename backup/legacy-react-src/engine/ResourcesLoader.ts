import * as THREE from 'three/webgpu';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';

export type ResourceType = 'texture' | 'textureKtx' | 'draco' | 'gltf';

export type ResourceEntry = [
  name: string,
  url: string,
  type: ResourceType,
  modifier?: (resource: any) => void
];

export class ResourcesLoader {
  private loaders = new Map<ResourceType, any>();
  private cache = new Map<string, any>();

  constructor(private renderer: any) {}

  getLoader(type: ResourceType): any {
    if (this.loaders.has(type)) {
      return this.loaders.get(type);
    }

    let loader: any = null;
    if (type === 'texture') {
      loader = new THREE.TextureLoader();
    } else if (type === 'textureKtx') {
      const ktx2 = new KTX2Loader();
      ktx2.setTranscoderPath('/assets/basis/');
      ktx2.detectSupport(this.renderer);
      loader = ktx2;
    } else if (type === 'draco') {
      const draco = new DRACOLoader();
      draco.setDecoderPath('/assets/draco/');
      draco.preload();
      loader = draco;
    } else if (type === 'gltf') {
      const dracoLoader = this.getLoader('draco');
      const ktx2Loader = this.getLoader('textureKtx');
      const gltf = new GLTFLoader();
      gltf.setDRACOLoader(dracoLoader);
      gltf.setKTX2Loader(ktx2Loader);
      loader = gltf;
    }

    this.loaders.set(type, loader);
    return loader;
  }

  load(
    files: ResourceEntry[],
    onProgress?: (remaining: number, total: number) => void
  ): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
      let remaining = files.length;
      if (remaining === 0) {
        resolve({});
        return;
      }

      const loaded: Record<string, any> = {};
      const step = () => {
        remaining--;
        if (onProgress) onProgress(remaining, files.length);
        if (remaining === 0) resolve(loaded);
      };

      for (const entry of files) {
        const [name, url, type, modifier] = entry;
        if (this.cache.has(url)) {
          loaded[name] = this.cache.get(url);
          step();
          continue;
        }

        const loader = this.getLoader(type);
        loader.load(
          url,
          (resource: any) => {
            if (modifier) modifier(resource);
            loaded[name] = resource;
            this.cache.set(url, resource);
            step();
          },
          undefined,
          (err: any) => {
            console.error(`ResourcesLoader failed to load ${url}:`, err);
            reject(err);
          }
        );
      }
    });
  }

  dispose(): void {
    const draco = this.loaders.get('draco') as DRACOLoader | undefined;
    draco?.dispose();
    const ktx2 = this.loaders.get('textureKtx') as KTX2Loader | undefined;
    ktx2?.dispose();
    this.cache.clear();
    this.loaders.clear();
  }
}

