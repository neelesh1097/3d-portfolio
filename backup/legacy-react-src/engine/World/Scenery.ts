import * as THREE from 'three/webgpu';
import seedrandom from 'seedrandom';
import { color, float, Fn, PI, positionLocal, positionWorld, texture, uniform, uv, vec3 } from 'three/tsl';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial';
import { InstancedGroup } from '../InstancedGroup';
import { References } from '../References';
import { Trees } from './Trees';
import { Foliage } from './Foliage';
import type { GameContext } from '../GameContext';

const flowerRng = seedrandom('flowers');

export interface ExplosiveCrateItem {
  object: any;
  exploded: boolean;
  position: THREE.Vector3;
}

export class Scenery {
  references = new References();
  roadColor = uniform(color('#383039'));
  glitterVariation = uniform(0);

  dynamicInstancedObjects: any[] = [];
  explosiveCrates: ExplosiveCrateItem[] = [];

  constructor(private game: GameContext) {
    this.buildSceneryModel();
    this.buildPlayground();
    this.buildBushes();
    this.buildTrees();
    this.buildFlowers();
    this.buildBricks();
    this.buildFences();
    this.buildBenches();
    this.buildLanterns();
    this.buildPoleLights();
    this.buildExplosiveCrates();

    this.game.ticker.events.on(
      'tick',
      () => {
        this.update();
      },
      10
    );
  }

  private buildSceneryModel(): void {
    const model = this.game.resources.sceneryModel?.scene;
    if (!model) return;

    const children = [...model.children];
    for (const child of children) {
      if (typeof child.userData.prevent === 'undefined' || child.userData.prevent === false) {
        this.game.objects.addFromModel(
          child,
          {},
          {
            position: child.position.clone(),
            rotation: child.quaternion.clone(),
            sleeping: true,
            mass: child.userData.mass,
            colliders: [],
          }
        );
      }
      this.references.parse(child);
    }

    // Road glitter shader from folio-2025 Scenery.js
    const roadMeshes = this.references.items.get('road');
    const roadMesh = roadMeshes?.[0] as THREE.Mesh | undefined;
    if (roadMesh) {
      const glitterScarcity = uniform(100);
      const glitterIntensity = uniform(0.3);
      const glitterPerlinFreq = uniform(0.05);
      const glitterHashFreq = uniform(0.2);

      const colorNode = Fn(() => {
        const glitter = float(0).toVar();
        const hashUv = positionWorld.xz.mul(glitterHashFreq);
        const hashVal = texture(this.game.noises.hash, hashUv)
          .r.mul(2)
          .add(this.glitterVariation)
          .mod(2)
          .sub(1)
          .abs();
        glitter.addAssign(hashVal);
        glitter.assign(glitter.pow(glitterScarcity));
        glitter.mulAssign(glitterIntensity);

        const perlin = texture(this.game.noises.perlin, positionWorld.xz.mul(glitterPerlinFreq)).r;
        glitter.mulAssign(perlin);
        glitter.mulAssign(uv().y.mul(PI).sin());

        return vec3(this.roadColor.add(glitter));
      })();

      roadMesh.material = new MeshDefaultMaterial(this.game, {
        colorNode,
        hasLightBounce: false,
        hasWater: false,
      });
    }
  }

  private buildPlayground(): void {
    const visual = this.game.resources.playgroundVisualModel?.scene;
    if (visual) {
      for (const child of [...visual.children]) {
        this.game.materials.updateObject(child);
        child.traverse((c: any) => {
          if (c.isMesh) {
            c.castShadow = true;
            c.receiveShadow = true;
          }
        });
        this.game.scene.add(child);
      }
    }

    const physical = this.game.resources.playgroundPhysicalModel?.scene;
    if (physical) {
      for (const child of [...physical.children]) {
        this.game.objects.addFromModel(
          child,
          {},
          {
            position: child.position.clone(),
            rotation: child.quaternion.clone(),
            sleeping: true,
            mass: child.userData.mass,
            colliders: [],
          }
        );
      }
    }
  }

  private buildBushes(): void {
    const refs = this.game.resources.bushesReferencesModel?.scene?.children;
    if (!refs || refs.length === 0) return;
    new Foliage(
      this.game,
      refs,
      uniform(color('#b4b536')),
      uniform(color('#d8cf3b')),
      false
    );
  }

  private buildTrees(): void {
    const r = this.game.resources;
    if (r.birchTreesVisualModel && r.birchTreesReferencesModel) {
      new Trees(
        this.game,
        r.birchTreesVisualModel.scene,
        r.birchTreesReferencesModel.scene.children,
        '#ff4f2b',
        '#ff903f'
      );
    }
    if (r.oakTreesVisualModel && r.oakTreesReferencesModel) {
      new Trees(
        this.game,
        r.oakTreesVisualModel.scene,
        r.oakTreesReferencesModel.scene.children,
        '#b4b536',
        '#d8cf3b'
      );
    }
    if (r.cherryTreesVisualModel && r.cherryTreesReferencesModel) {
      new Trees(
        this.game,
        r.cherryTreesVisualModel.scene,
        r.cherryTreesReferencesModel.scene.children,
        '#ff6d6d',
        '#ff9990'
      );
    }
  }

  private buildFlowers(): void {
    const refNodes = this.game.resources.flowersReferencesModel?.scene?.children;
    if (!refNodes || refNodes.length === 0) return;

    const matrices: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();

    for (const ref of refNodes) {
      const count = 3 + Math.floor(flowerRng() * 7);
      for (let j = 0; j < count; j++) {
        dummy.rotation.set(0, Math.PI * 2 * flowerRng(), 0);
        dummy.position.set(
          ref.position.x + (flowerRng() - 0.5) * 3,
          ref.position.y,
          ref.position.z + (flowerRng() - 0.5) * 3
        );
        dummy.scale.setScalar(0.65 + flowerRng() * 0.4);
        dummy.updateMatrix();
        matrices.push(dummy.matrix.clone());
      }
    }

    const planes: THREE.PlaneGeometry[] = [];
    for (let i = 0; i < 6; i++) {
      const plane = new THREE.PlaneGeometry(0.11, 0.11);
      const spherical = new THREE.Spherical(1, Math.PI * 0.22 * flowerRng(), Math.PI * 2 * flowerRng());
      const dir = new THREE.Vector3().setFromSpherical(spherical);
      const pos = dir.clone().setLength(0.95 + (flowerRng() - 0.5) * 0.45);
      pos.y -= 0.7;

      const mat4 = new THREE.Matrix4();
      mat4.lookAt(dir, new THREE.Vector3(), new THREE.Vector3(0, 1, 0));
      mat4.setPosition(pos);
      mat4.scale(new THREE.Vector3(1, 1, 1).setScalar(0.9 + flowerRng() * 0.5));
      plane.applyMatrix4(mat4);
      planes.push(plane);
    }

    const geo = mergeGeometries(planes);
    geo.deleteAttribute('uv');

    const mat = new MeshDefaultMaterial(this.game, {
      side: THREE.DoubleSide,
      colorNode: uniform(color('#fff7df')),
      hasWater: false,
    });
    const wind = this.game.wind.offsetNode(positionLocal.xz);
    mat.positionNode = positionLocal.add(
      vec3(wind.x, 0, wind.y).mul(positionLocal.y.clamp(0, 1))
    );

    const inst = new THREE.InstancedMesh(geo, mat, matrices.length);
    inst.receiveShadow = true;
    for (let i = 0; i < matrices.length; i++) {
      inst.setMatrixAt(i, matrices[i]);
    }
    inst.instanceMatrix.needsUpdate = true;
    this.game.scene.add(inst);
  }

  private buildBricks(): void {
    const children = this.game.resources.bricksModel?.scene?.children;
    if (!children || children.length === 0) return;

    const [base, references] = InstancedGroup.getBaseAndReferencesFromInstances(children);
    base.traverse((c: any) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
      }
    });
    this.game.materials.updateObject(base);

    for (const ref of references) {
      const obj = this.game.objects.add(
        { model: ref, updateMaterials: false, castShadow: false, receiveShadow: false, parent: null },
        {
          type: 'dynamic',
          position: ref.position.clone(),
          rotation: ref.quaternion.clone(),
          friction: 0.7,
          mass: 0.1,
          sleeping: true,
          colliders: [{ shape: 'cuboid', parameters: [0.75 * 0.75, 0.5 * 0.75, 0.75], category: 'object' }],
          waterGravityMultiplier: -1,
        }
      );
      this.dynamicInstancedObjects.push(obj);
    }

    new InstancedGroup(this.game, references, base, true);
  }

  private buildFences(): void {
    const children = this.game.resources.fencesModel?.scene?.children;
    if (!children || children.length === 0) return;

    const [base, references] = InstancedGroup.getBaseAndReferencesFromInstances(children);
    const [, physDesc] = this.game.objects.getFromModel(base, {}, { colliders: [] });
    const colliders = physDesc?.colliders || [{ shape: 'cuboid', parameters: [1.1, 0.55, 0.15] }];

    base.traverse((c: any) => {
      c.name = c.name.replace(/[0-9]+$/i, '');
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
      }
    });
    this.game.materials.updateObject(base);

    for (const ref of references) {
      const obj = this.game.objects.add(
        { model: ref, updateMaterials: false, castShadow: false, receiveShadow: false, parent: null },
        {
          type: 'dynamic',
          position: ref.position.clone(),
          rotation: ref.quaternion.clone(),
          friction: 0.7,
          mass: 0.1,
          sleeping: true,
          colliders,
          waterGravityMultiplier: -1,
        }
      );
      this.dynamicInstancedObjects.push(obj);
    }

    new InstancedGroup(this.game, references, base, true);
  }

  private buildBenches(): void {
    const children = this.game.resources.benchesModel?.scene?.children;
    if (!children || children.length === 0) return;

    const [base, references] = InstancedGroup.getBaseAndReferencesFromInstances(children);
    const [, physDesc] = this.game.objects.getFromModel(base, {}, { colliders: [] });
    const colliders = physDesc?.colliders || [{ shape: 'cuboid', parameters: [1.1, 0.5, 0.45] }];

    base.traverse((c: any) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
      }
    });
    this.game.materials.updateObject(base);

    for (const ref of references) {
      const obj = this.game.objects.add(
        { model: ref, updateMaterials: false, castShadow: false, receiveShadow: false, parent: null },
        {
          type: 'dynamic',
          position: ref.position.clone(),
          rotation: ref.quaternion.clone(),
          friction: 0.7,
          mass: 0.1,
          sleeping: true,
          colliders,
          waterGravityMultiplier: -1,
        }
      );
      this.dynamicInstancedObjects.push(obj);
    }

    new InstancedGroup(this.game, references, base, true);
  }

  private buildLanterns(): void {
    const children = this.game.resources.lanternsModel?.scene?.children;
    if (!children || children.length === 0) return;

    const [base, references] = InstancedGroup.getBaseAndReferencesFromInstances(children);
    base.traverse((c: any) => {
      c.name = c.name.replace(/[0-9]+$/i, '');
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
      }
    });
    this.game.materials.updateObject(base);

    for (const ref of references) {
      const obj = this.game.objects.add(
        { model: ref, updateMaterials: false, castShadow: false, receiveShadow: false, parent: null },
        {
          type: 'dynamic',
          position: ref.position.clone(),
          rotation: ref.quaternion.clone(),
          friction: 0.7,
          mass: 0.1,
          sleeping: true,
          colliders: [{ shape: 'cuboid', parameters: [0.35, 0.5, 0.35], category: 'object' }],
          waterGravityMultiplier: -1,
        }
      );
      this.dynamicInstancedObjects.push(obj);
    }

    new InstancedGroup(this.game, references, base, true);
  }

  private buildPoleLights(): void {
    const children = this.game.resources.poleLightsModel?.scene?.children;
    if (!children || children.length === 0) return;

    const [base, references] = InstancedGroup.getBaseAndReferencesFromInstances(children);
    base.traverse((c: any) => {
      c.name = c.name.replace(/[0-9]+$/i, '');
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
      }
    });
    this.game.materials.updateObject(base);
    new InstancedGroup(this.game, references, base, false);

    for (const ref of references) {
      this.game.objects.add(null, {
        type: 'fixed',
        position: ref.position.clone(),
        rotation: ref.quaternion.clone(),
        colliders: [{ shape: 'cuboid', parameters: [0.2, 1.7, 0.2], category: 'object' }],
      });
    }
  }

  private buildExplosiveCrates(): void {
    const children = this.game.resources.explosiveCratesModel?.scene?.children;
    if (!children || children.length === 0) return;

    const [base, references] = InstancedGroup.getBaseAndReferencesFromInstances(children);
    base.traverse((c: any) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
      }
    });
    this.game.materials.updateObject(base);
    const group = new InstancedGroup(this.game, references, base, true);

    for (const ref of references) {
      const crate: ExplosiveCrateItem = {
        object: null,
        exploded: false,
        position: ref.position.clone(),
      };
      crate.object = this.game.objects.add(
        { model: ref, updateMaterials: false, castShadow: false, receiveShadow: false, parent: null },
        {
          type: 'dynamic',
          position: ref.position.clone(),
          rotation: ref.quaternion.clone(),
          friction: 0.7,
          mass: 0.02,
          sleeping: true,
          colliders: [{ shape: 'cuboid', parameters: [0.5, 0.5, 0.5], category: 'object' }],
          waterGravityMultiplier: -1,
          contactThreshold: 0,
          onCollision: () => {
            if (crate.exploded) return;
            crate.exploded = true;
            this.game.objects.disable(crate.object);
            ref.scale.setScalar(0.0001);
            (ref as any).needsUpdate = true;
            group.needsUpdate = true;

            const pv = this.game.physicalVehicle;
            const delta = pv.position.clone().sub(crate.position);
            const dist = delta.length();
            if (dist < 6.5) {
              delta.y = Math.max(delta.y, 0.75);
              delta.normalize().multiplyScalar((1 - dist / 6.5) * 16);
              pv.chassis.physical.body.applyImpulse(delta, true);
            }
          },
        }
      );
      this.dynamicInstancedObjects.push(crate.object);
      this.explosiveCrates.push(crate);
    }
  }

  update(): void {
    this.glitterVariation.value +=
      this.game.ticker.deltaScaled * 0.004 + this.game.view.delta.length() * 0.004;

    for (let i = 0; i < this.dynamicInstancedObjects.length; i++) {
      const obj = this.dynamicInstancedObjects[i];
      if (obj?.physical && obj?.visual && !obj.physical.body.isSleeping() && obj.physical.body.isEnabled()) {
        obj.visual.object3D.needsUpdate = true;
      }
    }
  }
}
