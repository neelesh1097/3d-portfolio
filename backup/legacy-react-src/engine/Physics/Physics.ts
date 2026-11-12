import * as THREE from 'three/webgpu';
import type RAPIER from '@dimforge/rapier3d';
import type { GameContext } from '../GameContext';

export interface ColliderDescription {
  shape: 'cuboid' | 'ball' | 'cylinder' | 'trimesh' | 'hull' | 'heightfield';
  parameters: any[];
  position?: { x: number; y: number; z: number };
  quaternion?: { x: number; y: number; z: number; w: number };
  mass?: number;
  centerOfMass?: { x: number; y: number; z: number };
  friction?: number;
  restitution?: number;
  category?: 'floor' | 'object' | 'bumper';
}

export interface PhysicalDescription {
  type?: 'dynamic' | 'fixed' | 'kinematicPositionBased' | 'kinematicVelocityBased';
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number; w: number };
  canSleep?: boolean;
  sleeping?: boolean;
  enabled?: boolean;
  linearDamping?: number;
  angularDamping?: number;
  waterGravityMultiplier?: number;
  friction?: number;
  frictionRule?: 'average' | 'min' | 'max' | 'multiply';
  restitution?: number;
  mass?: number;
  category?: 'floor' | 'object' | 'bumper';
  contactThreshold?: number;
  onCollision?: (force: number, position: { x: number; y: number; z: number }) => void;
  colliders: ColliderDescription[];
}

export interface PhysicalEntity {
  type: 'dynamic' | 'fixed' | 'kinematicPositionBased' | 'kinematicVelocityBased';
  body: RAPIER.RigidBody;
  colliders: RAPIER.Collider[];
  linearDamping: number;
  angularDamping: number;
  waterGravityMultiplier: number;
  onCollision?: (force: number, position: { x: number; y: number; z: number }) => void;
  initialState: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number; w: number };
    sleeping: boolean;
  };
}

export class Physics {
  world: RAPIER.World;
  eventQueue: RAPIER.EventQueue;
  physicals: PhysicalEntity[] = [];
  dynamicPhysicals: PhysicalEntity[] = [];

  groups = {
    all: 0b0000000000000001,
    object: 0b0000000000000010,
    bumper: 0b0000000000000100,
  };

  categories = {
    floor: (this.groups.all << 16) | this.groups.all,
    object: ((this.groups.all | this.groups.object) << 16) | (this.groups.all | this.groups.bumper),
    bumper: (this.groups.bumper << 16) | this.groups.object,
  };

  frictionRules: Record<string, number>;

  constructor(private game: GameContext) {
    const R = this.game.RAPIER;
    this.world = new R.World({ x: 0.0, y: -9.81, z: 0.0 });
    this.eventQueue = new R.EventQueue(true);

    this.frictionRules = {
      average: R.CoefficientCombineRule.Average,
      min: R.CoefficientCombineRule.Min,
      max: R.CoefficientCombineRule.Max,
      multiply: R.CoefficientCombineRule.Multiply,
    };

    this.game.ticker.events.on(
      'tick',
      () => {
        this.update();
      },
      3
    );
  }

  getPhysical(desc: PhysicalDescription): PhysicalEntity {
    const R = this.game.RAPIER;
    const type = desc.type ?? 'dynamic';
    const linearDamping = desc.linearDamping ?? 0.1;
    const angularDamping = desc.angularDamping ?? 0.1;
    const waterGravityMultiplier = desc.waterGravityMultiplier ?? -1.5;

    let rigidBodyDesc: RAPIER.RigidBodyDesc;
    if (type === 'fixed') rigidBodyDesc = R.RigidBodyDesc.fixed();
    else if (type === 'kinematicPositionBased')
      rigidBodyDesc = R.RigidBodyDesc.kinematicPositionBased();
    else if (type === 'kinematicVelocityBased')
      rigidBodyDesc = R.RigidBodyDesc.kinematicVelocityBased();
    else rigidBodyDesc = R.RigidBodyDesc.dynamic();

    if (desc.position) {
      rigidBodyDesc.setTranslation(desc.position.x, desc.position.y, desc.position.z);
    }
    if (desc.rotation) {
      rigidBodyDesc.setRotation(desc.rotation);
    }
    if (typeof desc.canSleep !== 'undefined') {
      rigidBodyDesc.setCanSleep(desc.canSleep);
    }
    rigidBodyDesc.setLinearDamping(linearDamping);
    rigidBodyDesc.setAngularDamping(angularDamping);
    if (typeof desc.sleeping !== 'undefined') {
      rigidBodyDesc.setSleeping(desc.sleeping);
    }
    if (typeof desc.enabled !== 'undefined') {
      rigidBodyDesc.setEnabled(desc.enabled);
    }

    const body = this.world.createRigidBody(rigidBodyDesc);
    const colliders: RAPIER.Collider[] = [];
    const identityQuat = new THREE.Quaternion();

    for (const colDesc of desc.colliders) {
      let cDesc: RAPIER.ColliderDesc | null = null;
      if (colDesc.shape === 'cuboid') {
        cDesc = R.ColliderDesc.cuboid(
          colDesc.parameters[0],
          colDesc.parameters[1],
          colDesc.parameters[2]
        );
      } else if (colDesc.shape === 'ball') {
        cDesc = R.ColliderDesc.ball(colDesc.parameters[0]);
      } else if (colDesc.shape === 'cylinder') {
        cDesc = R.ColliderDesc.cylinder(colDesc.parameters[0], colDesc.parameters[1]);
      } else if (colDesc.shape === 'trimesh') {
        cDesc = R.ColliderDesc.trimesh(colDesc.parameters[0], colDesc.parameters[1]);
      } else if (colDesc.shape === 'hull') {
        cDesc = R.ColliderDesc.convexHull(colDesc.parameters[0]);
      } else {
        cDesc = R.ColliderDesc.heightfield(
          colDesc.parameters[0],
          colDesc.parameters[1],
          colDesc.parameters[2],
          colDesc.parameters[3]
        );
      }
      if (!cDesc) continue;

      if (colDesc.position) {
        cDesc.setTranslation(colDesc.position.x, colDesc.position.y, colDesc.position.z);
      }
      if (colDesc.quaternion) {
        cDesc.setRotation(colDesc.quaternion);
      }

      cDesc.setDensity(0.1);

      if (typeof colDesc.mass !== 'undefined') {
        if (colDesc.centerOfMass) {
          cDesc.setMassProperties(
            colDesc.mass,
            colDesc.centerOfMass,
            { x: 1, y: 1, z: 1 },
            identityQuat
          );
        } else {
          cDesc.setMass(colDesc.mass);
        }
      }
      if (typeof desc.mass !== 'undefined') {
        cDesc.setMass(desc.mass / Math.max(1, desc.colliders.length));
      }

      const friction = desc.friction ?? colDesc.friction ?? 0.2;
      cDesc.setFriction(friction);

      if (desc.frictionRule) {
        cDesc.setFrictionCombineRule(this.frictionRules[desc.frictionRule]);
      }

      const restitution = desc.restitution ?? colDesc.restitution ?? 0.15;
      cDesc.setRestitution(restitution);

      const category = desc.category ?? colDesc.category ?? 'object';
      cDesc.setCollisionGroups(this.categories[category]);

      if (typeof desc.onCollision === 'function' || typeof desc.contactThreshold !== 'undefined') {
        cDesc.setActiveEvents(R.ActiveEvents.CONTACT_FORCE_EVENTS);
        cDesc.setContactForceEventThreshold(desc.contactThreshold ?? 15);
      }

      const collider = this.world.createCollider(cDesc, body);
      colliders.push(collider);
    }

    const pos = body.translation();
    const rot = body.rotation();

    const physical: PhysicalEntity = {
      type,
      body,
      colliders,
      linearDamping,
      angularDamping,
      waterGravityMultiplier,
      onCollision: desc.onCollision,
      initialState: {
        position: { x: pos.x, y: pos.y, z: pos.z },
        rotation: { x: rot.x, y: rot.y, z: rot.z, w: rot.w },
        sleeping: body.isSleeping(),
      },
    };

    this.physicals.push(physical);
    if (type === 'dynamic') {
      this.dynamicPhysicals.push(physical);
    }

    return physical;
  }

  update(): void {
    this.world.timestep = this.game.ticker.deltaScaled;

    for (let i = 0; i < this.dynamicPhysicals.length; i++) {
      const physical = this.dynamicPhysicals[i];
      if (!physical.body.isEnabled() || physical.body.isSleeping()) continue;

      const t = physical.body.translation();
      const inWater = t.y < this.game.water.surfaceElevation;
      if (inWater) {
        physical.body.setLinearDamping(1.2);
        physical.body.setAngularDamping(1.2);
      } else {
        physical.body.setLinearDamping(physical.linearDamping);
        physical.body.setAngularDamping(physical.angularDamping);
      }
    }

    this.world.step(this.eventQueue);

    this.eventQueue.drainContactForceEvents((event) => {
      const collider1 = this.world.getCollider(event.collider1());
      const collider2 = this.world.getCollider(event.collider2());
      if (!collider1 || !collider2) return;

      const body1 = collider1.parent();
      const body2 = collider2.parent();
      if (!body1 || !body2) return;

      const cb1 = (body1.userData as any)?.object?.physical?.onCollision;
      const cb2 = (body2.userData as any)?.object?.physical?.onCollision;

      if (typeof cb1 === 'function' || typeof cb2 === 'function') {
        const mass1 = body1.mass();
        const mass2 = body2.mass();
        const denom = Math.max(0.1, mass1 + mass2);
        const force = event.maxForceMagnitude() / denom;

        const p1 = body1.translation();
        const p2 = body2.translation();
        const bodyPosition = p1.x === 0 && p1.y === 0 && p1.z === 0 ? p2 : p1;

        if (typeof cb1 === 'function') cb1(force, bodyPosition);
        if (typeof cb2 === 'function') cb2(force, bodyPosition);
      }
    });
  }
}

