import * as THREE from 'three/webgpu';

export class References {
  items = new Map<string, THREE.Object3D[]>();

  constructor(model?: THREE.Object3D) {
    if (model) {
      this.parse(model);
    }
  }

  parse(object: THREE.Object3D): void {
    object.traverse((child) => {
      const name = child.name;
      const matches = name.match(/^ref(?:erence)?([^0-9]+)([0-9]+)?$/);
      if (matches) {
        const referenceName = matches[1].charAt(0).toLowerCase() + matches[1].slice(1);
        const existing = this.items.get(referenceName);
        if (existing) {
          existing.push(child);
        } else {
          this.items.set(referenceName, [child]);
        }
      }
    });
  }

  getStartingWith(searched: string): Map<string, THREE.Object3D[]> {
    const out = new Map<string, THREE.Object3D[]>();
    this.items.forEach((value, name) => {
      if (name.startsWith(searched)) {
        const stripped = name.slice(searched.length);
        const key = stripped.charAt(0).toLowerCase() + stripped.slice(1);
        out.set(key, value);
      }
    });
    return out;
  }
}

