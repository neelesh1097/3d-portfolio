import * as THREE from 'three/webgpu';
import { color, uniform } from 'three/tsl';
import { Foliage } from './Foliage';
import type { GameContext } from '../GameContext';

export class Trees {
  leaves!: Foliage;
  bodies!: THREE.InstancedMesh;

  private bodyMesh: THREE.Mesh | null = null;
  private leafMeshes: THREE.Mesh[] = [];

  constructor(
    private game: GameContext,
    visualRoot: THREE.Object3D,
    referenceChildren: THREE.Object3D[],
    colorAHex: string,
    colorBHex: string
  ) {
    visualRoot.traverse((child: any) => {
      if (child.isMesh) {
        if (child.name.startsWith('treeLeaves')) {
          this.leafMeshes.push(child);
        } else if (child.name.startsWith('treeBody')) {
          this.bodyMesh = child;
        }
      }
    });

    if (!this.bodyMesh || referenceChildren.length === 0) return;

    const references: THREE.Object3D[] = referenceChildren.map((child) => {
      child.updateMatrix();
      child.updateMatrixWorld(true);
      const ref = new THREE.Object3D();
      ref.position.copy(child.position);
      ref.rotation.copy(child.rotation);
      ref.scale.copy(child.scale);
      ref.updateMatrix();
      ref.updateMatrixWorld();
      return ref;
    });

    // Instanced trunks
    this.game.materials.updateObject(this.bodyMesh);
    this.bodies = new THREE.InstancedMesh(
      this.bodyMesh.geometry,
      this.bodyMesh.material,
      references.length
    );
    this.bodies.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    this.bodies.castShadow = true;
    this.bodies.receiveShadow = true;
    for (let i = 0; i < references.length; i++) {
      this.bodies.setMatrixAt(i, references[i].matrix);
    }
    this.bodies.instanceMatrix.needsUpdate = true;
    this.game.scene.add(this.bodies);

    // Instanced canopies
    const leafRefs: THREE.Object3D[] = [];
    for (const treeRef of references) {
      for (const leaf of this.leafMeshes) {
        leaf.updateMatrix();
        const finalMat = leaf.matrix.clone().premultiply(treeRef.matrixWorld);
        const leafRef = new THREE.Object3D();
        leafRef.applyMatrix4(finalMat);
        leafRef.updateMatrix();
        leafRefs.push(leafRef);
      }
    }

    const colorA = uniform(color(colorAHex));
    const colorB = uniform(color(colorBHex));
    this.leaves = new Foliage(this.game, leafRefs, colorA, colorB, true);

    // Trunk colliders in Rapier matching folio-2025
    for (const ref of references) {
      this.game.objects.add(null, {
        type: 'fixed',
        position: { x: ref.position.x, y: ref.position.y + 2.5, z: ref.position.z },
        rotation: ref.quaternion,
        friction: 0.7,
        colliders: [{ shape: 'cylinder', parameters: [2.5, 0.18], category: 'object' }],
      });
    }
  }
}
