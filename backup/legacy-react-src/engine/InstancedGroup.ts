import * as THREE from 'three/webgpu';
import type { GameContext } from './GameContext';

const _tempMatrix = new THREE.Matrix4();

export class InstancedGroup {
  references: THREE.Object3D[];
  group: THREE.Object3D;
  count: number;
  needsUpdate = false;
  meshes: Array<{ localMatrix: THREE.Matrix4; instance: THREE.InstancedMesh }> = [];

  static getReferencesFromChildren(children: THREE.Object3D[]): THREE.Object3D[] {
    const references: THREE.Object3D[] = [];
    for (const child of children) {
      const reference = new THREE.Object3D() as any;
      reference.position.copy(child.position);
      reference.rotation.copy(child.rotation);
      reference.scale.copy(child.scale);
      reference.needsUpdate = true;
      references.push(reference);
    }
    return references;
  }

  static getBaseAndReferencesFromInstances(
    instances: THREE.Object3D[]
  ): [THREE.Object3D, THREE.Object3D[]] {
    const base = instances[0].clone();
    base.position.set(0, 0, 0);
    base.rotation.set(0, 0, 0);
    const references = InstancedGroup.getReferencesFromChildren(instances);
    return [base, references];
  }

  constructor(
    private game: GameContext,
    references: THREE.Object3D[],
    group: THREE.Object3D,
    autoUpdate = true
  ) {
    this.references = references;
    this.group = group;
    this.count = references.length;

    this.setupMeshes();

    if (autoUpdate) {
      this.game.ticker.events.on(
        'tick',
        () => {
          this.update();
        },
        13
      );
    }

    this.update(true);
  }

  private setupMeshes(): void {
    this.group.traverse((child: any) => {
      if (child.isMesh) {
        child.updateMatrix();
        child.updateWorldMatrix(true, false);

        const instancedMesh = new THREE.InstancedMesh(child.geometry, child.material, this.count);
        instancedMesh.name = child.name;
        instancedMesh.castShadow = child.castShadow;
        instancedMesh.receiveShadow = child.receiveShadow;
        instancedMesh.frustumCulled = false;
        this.game.scene.add(instancedMesh);

        this.meshes.push({
          localMatrix: child.matrix.clone(),
          instance: instancedMesh,
        });
      }
    });
  }

  update(force = false): void {
    let updated = 0;

    for (let i = 0; i < this.references.length; i++) {
      const ref = this.references[i] as any;
      if (force || this.needsUpdate || ref.needsUpdate) {
        updated++;
        ref.needsUpdate = false;
        ref.updateMatrixWorld();

        for (let m = 0; m < this.meshes.length; m++) {
          const item = this.meshes[m];
          _tempMatrix.copy(item.localMatrix).premultiply(ref.matrixWorld);
          item.instance.setMatrixAt(i, _tempMatrix);
        }
      }
    }

    if (updated > 0) {
      for (const item of this.meshes) {
        item.instance.instanceMatrix.needsUpdate = true;
      }
    }

    this.needsUpdate = false;
  }
}
