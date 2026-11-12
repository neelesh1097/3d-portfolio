import * as THREE from 'three/webgpu';
import type { GameContext } from './GameContext';
import type { PhysicalDescription, PhysicalEntity } from './Physics/Physics';

export interface VisualDescription {
  model?: THREE.Object3D;
  updateMaterials?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  parent?: THREE.Object3D | null;
}

export interface GameObject {
  visual: {
    object3D: THREE.Object3D;
    parent: THREE.Object3D | null;
  } | null;
  physical: PhysicalEntity | null;
  needsUpdate: boolean;
  reseting: boolean;
}

export class Objects {
  list = new Map<number, GameObject>();
  dynamicList: GameObject[] = [];
  private key = 0;

  constructor(private game: GameContext) {
    this.game.ticker.events.on(
      'tick',
      () => {
        this.update();
      },
      4
    );
  }

  add(
    visualDescription: VisualDescription | null = null,
    physicalDescription: PhysicalDescription | null = null
  ): GameObject {
    const obj: GameObject = {
      visual: null,
      physical: null,
      needsUpdate: false,
      reseting: false,
    };

    if (visualDescription && visualDescription.model) {
      const updateMaterials = visualDescription.updateMaterials ?? true;
      const castShadow = visualDescription.castShadow ?? true;
      const receiveShadow = visualDescription.receiveShadow ?? true;
      const parent =
        visualDescription.parent !== undefined ? visualDescription.parent : this.game.scene;

      if (updateMaterials) {
        this.game.materials.updateObject(visualDescription.model);
      }

      if (castShadow || receiveShadow) {
        visualDescription.model.traverse((child: any) => {
          if (child.isMesh) {
            if (castShadow) child.castShadow = true;
            if (receiveShadow) child.receiveShadow = true;
          }
        });
      }

      if (parent !== null) {
        parent.add(visualDescription.model);
      }

      obj.visual = {
        object3D: visualDescription.model,
        parent,
      };
    }

    if (physicalDescription) {
      obj.physical = this.game.physics.getPhysical(physicalDescription);
      (obj.physical.body as any).userData = { object: obj };
    }
    if (obj.visual) {
      obj.visual.object3D.userData.object = obj;
    }

    this.key++;
    this.list.set(this.key, obj);
    if (obj.physical && obj.visual && obj.physical.type === 'dynamic') {
      this.dynamicList.push(obj);
    }

    if (obj.visual && obj.physical) {
      if (
        physicalDescription?.sleeping ||
        physicalDescription?.enabled === false ||
        obj.physical.type === 'fixed'
      ) {
        const t = obj.physical.body.translation();
        const r = obj.physical.body.rotation();
        obj.visual.object3D.position.set(t.x, t.y, t.z);
        obj.visual.object3D.quaternion.set(r.x, r.y, r.z, r.w);
      }
    }

    return obj;
  }

  getFromModel(
    model: THREE.Object3D,
    visualDescription: VisualDescription = {},
    physicalDescription: PhysicalDescription = { colliders: [] }
  ): [VisualDescription, PhysicalDescription | null] {
    const name = model.name;
    const isPhysical = /physical/i.test(name);
    const cleanUpRegexp = /physical|fixed|dynamic|kinematicPositionBased/gi;
    const colliders: any[] = [];
    const physDesc: PhysicalDescription = {
      ...physicalDescription,
      colliders,
    };

    if (isPhysical) {
      if (typeof physDesc.type === 'undefined') {
        physDesc.type = 'fixed';
        if (/dynamic/i.test(name)) physDesc.type = 'dynamic';
        else if (/kinematicPositionBased/i.test(name)) physDesc.type = 'kinematicPositionBased';
      }

      if (typeof model.userData.restitution !== 'undefined') {
        physDesc.restitution = model.userData.restitution;
      }
      if (typeof model.userData.friction !== 'undefined') {
        physDesc.friction = model.userData.friction;
      }
      if (typeof model.userData.category !== 'undefined') {
        physDesc.category = model.userData.category;
      }

      model.name = name.replaceAll(cleanUpRegexp, '');

      const children = [...model.children];
      for (const child of children as any[]) {
        const col: any = {
          position: child.position.clone(),
          quaternion: child.quaternion.clone(),
        };
        if (/^trimesh/i.test(child.name) && child.geometry) {
          col.shape = 'trimesh';
          col.parameters = [
            child.geometry.attributes.position.array,
            child.geometry.index?.array ||
              new Uint32Array(
                Array.from({ length: child.geometry.attributes.position.count }, (_, idx) => idx)
              ),
          ];
        } else if (/^hull/i.test(child.name) && child.geometry) {
          col.shape = 'hull';
          col.parameters = [
            child.geometry.attributes.position.array,
            child.geometry.index?.array,
          ];
        } else if (/^cuboid/i.test(child.name)) {
          col.shape = 'cuboid';
          col.parameters = [
            Math.max(0.02, Math.abs(child.scale.x) * 0.5),
            Math.max(0.02, Math.abs(child.scale.y) * 0.5),
            Math.max(0.02, Math.abs(child.scale.z) * 0.5),
          ];
        } else if (/^tube/i.test(child.name)) {
          col.shape = 'cylinder';
          col.parameters = [
            Math.max(0.02, Math.abs(child.scale.y) * 0.5),
            Math.max(0.02, Math.abs(child.scale.x) * 0.5),
          ];
        } else if (/^ball/i.test(child.name)) {
          col.shape = 'ball';
          col.parameters = [Math.max(0.02, Math.abs(child.scale.y) * 0.5)];
        }

        if (typeof child.userData.restitution !== 'undefined') {
          col.restitution = child.userData.restitution;
        }
        if (typeof child.userData.friction !== 'undefined') {
          col.friction = child.userData.friction;
        }
        if (typeof child.userData.category !== 'undefined') {
          col.category = child.userData.category;
        }

        if (col.shape) {
          colliders.push(col);
          child.removeFromParent();
        }
      }
    }

    return [{ ...visualDescription, model }, isPhysical && colliders.length > 0 ? physDesc : null];
  }

  addFromModel(
    model: THREE.Object3D,
    visualDescription: VisualDescription = {},
    physicalDescription: PhysicalDescription = { colliders: [] }
  ): GameObject {
    const [vis, phys] = this.getFromModel(model, visualDescription, physicalDescription);
    return this.add(vis, phys);
  }

  disable(obj: GameObject): void {
    if (obj.physical) {
      obj.physical.body.setLinvel({ x: 0, y: 0, z: 0 }, false);
      obj.physical.body.setAngvel({ x: 0, y: 0, z: 0 }, false);
      obj.physical.body.resetForces(true);
      obj.physical.body.resetTorques(true);
      obj.physical.body.setEnabled(false);
    }
    if (obj.visual) {
      obj.visual.object3D.removeFromParent();
    }
  }

  enable(obj: GameObject): void {
    if (obj.physical) {
      obj.physical.body.setEnabled(true);
    }
    if (obj.visual && obj.visual.parent && obj.visual.parent !== obj.visual.object3D.parent) {
      obj.visual.parent.add(obj.visual.object3D);
    }
  }

  resetObject(obj: GameObject): void {
    if (!obj.physical || obj.physical.type !== 'dynamic') return;
    const init = obj.physical.initialState;
    obj.physical.body.setTranslation(init.position, true);
    obj.physical.body.setRotation(init.rotation, true);
    obj.physical.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    obj.physical.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    if (init.sleeping) obj.physical.body.sleep();

    if (obj.visual) {
      obj.visual.object3D.position.set(init.position.x, init.position.y, init.position.z);
      obj.visual.object3D.quaternion.set(
        init.rotation.x,
        init.rotation.y,
        init.rotation.z,
        init.rotation.w
      );
      (obj.visual.object3D as any).needsUpdate = true;
    }
  }

  resetAll(): void {
    this.dynamicList.forEach((obj) => this.resetObject(obj));
  }

  update(): void {
    const viewPos = this.game.view.optimalArea.position;
    const radius = this.game.view.optimalArea.radius + 8;

    for (let i = 0; i < this.dynamicList.length; i++) {
      const obj = this.dynamicList[i];
      const physical = obj.physical!;
      const visual = obj.visual!;

      if (!physical.body.isEnabled()) continue;
      if (physical.body.isSleeping()) continue;

      const t = physical.body.translation();
      const r = physical.body.rotation();

      visual.object3D.position.set(t.x, t.y, t.z);
      visual.object3D.quaternion.set(r.x, r.y, r.z, r.w);
      (visual.object3D as any).needsUpdate = true;

      if (t.y < this.game.water.depthElevation - 1) {
        this.resetObject(obj);
        continue;
      }

      if (Math.hypot(t.x - viewPos.x, t.z - viewPos.z) > radius) {
        physical.body.sleep();
      }
    }
  }
}
