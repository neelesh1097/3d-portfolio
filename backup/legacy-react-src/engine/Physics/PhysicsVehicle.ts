import * as THREE from 'three/webgpu';
import type RAPIER from '@dimforge/rapier3d';
import { Events } from '../Events';
import { lerp, smallestAngle } from '../utilities/maths';
import type { GameContext } from '../GameContext';
import type { PhysicalEntity } from './Physics';

export interface WheelPhysicalState {
  inContact: boolean;
  contactPoint: THREE.Vector3 | null;
  suspensionLength: number;
  lastTouchTime: number;
  basePosition: THREE.Vector3;
}

export class PhysicsVehicle {
  events = new Events();

  steeringAmplitude = 0.54;
  engineForceAmplitude = 420;
  boostMultiplier = 2.1;
  topSpeed = 9.5;
  topSpeedBoost = 36;
  brakeAmplitude = 36;
  idleBrake = 0.06;
  reverseBrake = 0.42;

  sideward = new THREE.Vector3(0, 0, 1);
  upward = new THREE.Vector3(0, 1, 0);
  forward = new THREE.Vector3(1, 0, 0);
  position = new THREE.Vector3(0, 2.2, 1.2);
  quaternion = new THREE.Quaternion();
  velocity = new THREE.Vector3();
  direction = new THREE.Vector3(1, 0, 0);
  speed = 0;
  xzSpeed = 0;
  forwardRatio = 1;
  goingForward = true;
  forwardSpeed = 0;

  xRotation = 0;
  yRotation = 0;
  zRotation = 0;

  chassis!: {
    physical: PhysicalEntity;
    mass: number;
  };
  controller!: RAPIER.DynamicRayCastVehicleController;

  wheels = {
    inContactCount: 0,
    justTouchedCount: 0,
    items: [] as WheelPhysicalState[],
    settings: {
      offset: { x: 0.9, y: 0, z: 0.75 },
      radius: 0.4,
      directionCs: { x: 0, y: -1, z: 0 },
      axleCs: { x: 0, y: 0, z: 1 },
      frictionSlip: 0.92,
      maxSuspensionForce: 150,
      maxSuspensionTravel: 2,
      sideFrictionStiffness: 3.1,
      suspensionCompression: 10,
      suspensionRelaxation: 2.7,
      suspensionStiffness: 24,
      suspensionRestLength: 0.88,
    },
  };

  stop = {
    active: true,
    lowThreshold: 0.04,
    highThreshold: 0.7,
  };

  upsideDown = {
    active: false,
    ratio: 0,
    threshold: 0.3,
  };

  flip = {
    force: 4.8,
    inAir: false,
    previousXAngle: 0,
    accumulatedXAngle: 0,
    previousZAngle: 0,
    accumulatedZAngle: 0,
  };

  private _newPos = new THREE.Vector3();
  private _euler = new THREE.Euler();
  private _down = new THREE.Vector3(0, -1, 0);
  private _up = new THREE.Vector3(0, 1, 0);

  constructor(private game: GameContext) {
    this.createChassis();
    this.controller = this.game.physics.world.createVehicleController(this.chassis.physical.body);
    this.createWheels();

    this.game.ticker.events.on(
      'tick',
      () => {
        this.updatePrePhysics();
      },
      2
    );

    this.game.ticker.events.on(
      'tick',
      () => {
        this.updatePostPhysics();
      },
      5
    );
  }

  private createChassis(): void {
    const object = this.game.objects.add(null, {
      type: 'dynamic',
      position: this.position,
      friction: 0.4,
      rotation: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI * 0.65),
      colliders: [
        {
          shape: 'cuboid',
          mass: 2.5,
          parameters: [1.3, 0.4, 0.85],
          position: { x: 0, y: -0.1, z: 0 },
          centerOfMass: { x: 0, y: -0.5, z: 0 },
        },
        {
          shape: 'cuboid',
          mass: 0,
          parameters: [0.5, 0.15, 0.65],
          position: { x: 0, y: 0.4, z: 0 },
        },
        {
          shape: 'cuboid',
          mass: 0,
          parameters: [1.5, 0.5, 0.9],
          position: { x: 0.1, y: -0.2, z: 0 },
          category: 'bumper',
        },
      ],
      canSleep: false,
      waterGravityMultiplier: 0,
      onCollision: (force) => {
        this.events.trigger('collision', [force]);
      },
    });

    this.chassis = {
      physical: object.physical!,
      mass: object.physical!.body.mass(),
    };
  }

  private createWheels(): void {
    const s = this.wheels.settings;
    const positions = [
      new THREE.Vector3(s.offset.x, s.offset.y, s.offset.z),
      new THREE.Vector3(s.offset.x, s.offset.y, -s.offset.z),
      new THREE.Vector3(-s.offset.x, s.offset.y, s.offset.z),
      new THREE.Vector3(-s.offset.x, s.offset.y, -s.offset.z),
    ];

    for (let i = 0; i < 4; i++) {
      this.controller.addWheel(
        positions[i],
        s.directionCs,
        s.axleCs,
        s.suspensionRestLength,
        s.radius
      );
      this.controller.setWheelFrictionSlip(i, s.frictionSlip);
      this.controller.setWheelMaxSuspensionForce(i, s.maxSuspensionForce);
      this.controller.setWheelMaxSuspensionTravel(i, s.maxSuspensionTravel);
      this.controller.setWheelSideFrictionStiffness(i, s.sideFrictionStiffness);
      this.controller.setWheelSuspensionCompression(i, s.suspensionCompression);
      this.controller.setWheelSuspensionRelaxation(i, s.suspensionRelaxation);
      this.controller.setWheelSuspensionStiffness(i, s.suspensionStiffness);

      this.wheels.items.push({
        inContact: false,
        contactPoint: null,
        suspensionLength: s.suspensionRestLength,
        lastTouchTime: this.game.ticker.elapsed,
        basePosition: positions[i],
      });
    }
  }

  jump(): void {
    this.flip.accumulatedXAngle = 0;
    this.flip.accumulatedZAngle = 0;

    const sidewardDot = this._up.dot(this.sideward);
    const forwardDot = this._up.dot(this.forward);
    const upwardDot = this._up.dot(this.upward);

    const impulse = { x: 0, y: this.flip.force * this.chassis.mass, z: 0 };
    this.chassis.physical.body.applyImpulse(impulse, true);

    if (
      Math.abs(upwardDot) > Math.abs(sidewardDot) &&
      Math.abs(upwardDot) > Math.abs(forwardDot)
    ) {
      if (upwardDot < 0) {
        // Self-right when upside down
        const torque = new THREE.Vector3(0.9 * this.chassis.mass, 0, 0);
        torque.applyQuaternion(this.quaternion);
        this.chassis.physical.body.applyTorqueImpulse(torque, true);
      }
    } else {
      const torque = new THREE.Vector3(
        sidewardDot * 0.45 * this.chassis.mass,
        0,
        -forwardDot * 0.8 * this.chassis.mass
      );
      torque.applyQuaternion(this.quaternion);
      this.chassis.physical.body.applyTorqueImpulse(torque, true);
    }

    this.events.trigger('jump');
  }

  moveTo(position: { x: number; y: number; z: number }, rotationY = 0): void {
    const quat = new THREE.Quaternion().setFromAxisAngle(this._up, rotationY);
    this.chassis.physical.body.setTranslation(position, true);
    this.chassis.physical.body.setRotation(quat, true);
    this.chassis.physical.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    this.chassis.physical.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    this.position.set(position.x, position.y, position.z);
    this.quaternion.copy(quat);
  }

  updatePrePhysics(): void {
    const dtScaled = this.game.ticker.deltaScaled;
    const player = this.game.player;

    const topSpeed = lerp(this.topSpeed, this.topSpeedBoost, player.boosting);
    const overflowSpeed = Math.max(0, this.speed - topSpeed);
    let engineForce =
      ((player.accelerating * (1 + player.boosting * this.boostMultiplier) * this.engineForceAmplitude) /
        (1 + overflowSpeed)) *
      dtScaled;

    let brake = player.braking;
    if (!player.braking && Math.abs(player.accelerating) < 0.1) {
      brake = this.idleBrake;
    }

    if (
      this.speed > 0.5 &&
      ((player.accelerating > 0 && !this.goingForward) ||
        (player.accelerating < 0 && this.goingForward))
    ) {
      brake = this.reverseBrake;
      engineForce = 0;
    }

    brake *= this.brakeAmplitude * dtScaled;
    const steer = player.steering * this.steeringAmplitude;

    this.controller.setWheelSteering(0, steer);
    this.controller.setWheelSteering(1, steer);

    for (let i = 0; i < 4; i++) {
      this.controller.setWheelBrake(i, brake);
      this.controller.setWheelEngineForce(i, engineForce);
    }

    const delta =
      this.game.quality.level === 1 ? 1 / 60 : Math.min(1 / 60, this.game.ticker.deltaAverage);
    this.controller.updateVehicle(delta);
  }

  updatePostPhysics(): void {
    const t = this.chassis.physical.body.translation();
    const r = this.chassis.physical.body.rotation();

    this._newPos.set(t.x, t.y, t.z);
    this.velocity.copy(this._newPos).sub(this.position);
    if (this.velocity.lengthSq() > 1e-8) {
      this.direction.copy(this.velocity).normalize();
    }
    this.position.copy(this._newPos);
    this.quaternion.set(r.x, r.y, r.z, r.w);

    this.sideward.set(0, 0, 1).applyQuaternion(this.quaternion);
    this.upward.set(0, 1, 0).applyQuaternion(this.quaternion);
    this.forward.set(1, 0, 0).applyQuaternion(this.quaternion);

    const dtScaled = Math.max(0.001, this.game.ticker.deltaScaled);
    this.speed = this.velocity.length() / dtScaled;
    this.xzSpeed = Math.hypot(this.velocity.x, this.velocity.z) / dtScaled;
    this.forwardRatio = this.direction.dot(this.forward);
    this.goingForward = this.forwardRatio > 0.5;
    this.forwardSpeed = this.speed * this.forwardRatio;

    this.xRotation = this._euler.setFromQuaternion(this.quaternion, 'XYZ').x;
    this.yRotation = this._euler.setFromQuaternion(this.quaternion, 'YXZ').y;
    this.zRotation = this._euler.setFromQuaternion(this.quaternion, 'ZYX').z;

    let inContactCount = 0;
    for (let i = 0; i < 4; i++) {
      const wheel = this.wheels.items[i];
      const inContact = this.controller.wheelIsInContact(i);
      if (inContact && !wheel.inContact) {
        wheel.lastTouchTime = this.game.ticker.elapsed;
      }
      wheel.inContact = inContact;
      const cp = this.controller.wheelContactPoint(i);
      if (cp) {
        if (!wheel.contactPoint) wheel.contactPoint = new THREE.Vector3();
        wheel.contactPoint.set(cp.x, cp.y, cp.z);
      } else {
        wheel.contactPoint = null;
      }
      wheel.suspensionLength =
        this.controller.wheelSuspensionLength(i) ?? this.wheels.settings.suspensionRestLength;
      if (inContact) inContactCount++;
    }

    let justTouchedCount = 0;
    if (inContactCount > this.wheels.inContactCount) {
      for (const wheel of this.wheels.items) {
        if (wheel.lastTouchTime > this.game.ticker.elapsed - 0.2) justTouchedCount++;
      }
    }
    this.wheels.inContactCount = inContactCount;
    this.wheels.justTouchedCount = justTouchedCount;

    // Stop / start
    if (this.speed < this.stop.lowThreshold) {
      if (!this.stop.active) {
        this.stop.active = true;
        this.events.trigger('stop');
      }
    } else if (this.speed > this.stop.highThreshold) {
      if (this.stop.active) {
        this.stop.active = false;
        this.events.trigger('start');
      }
    }

    // Upside down
    this.upsideDown.ratio = this.upward.dot(this._down) * 0.5 + 0.5;
    if (this.upsideDown.ratio > this.upsideDown.threshold) {
      if (!this.upsideDown.active) {
        this.upsideDown.active = true;
        this.events.trigger('upsideDown');
      }
    } else if (this.upsideDown.active) {
      this.upsideDown.active = false;
      this.events.trigger('rightSideUp');
    }

    // Flip detection
    if (this.wheels.inContactCount === 0) {
      if (!this.flip.inAir) {
        this.flip.inAir = true;
        this.flip.previousXAngle = this.xRotation;
        this.flip.accumulatedXAngle = 0;
        this.flip.previousZAngle = this.zRotation;
        this.flip.accumulatedZAngle = 0;
      } else {
        this.flip.accumulatedXAngle += smallestAngle(this.flip.previousXAngle, this.xRotation);
        this.flip.previousXAngle = this.xRotation;
        this.flip.accumulatedZAngle += smallestAngle(this.flip.previousZAngle, this.zRotation);
        this.flip.previousZAngle = this.zRotation;
      }
    } else if (this.wheels.inContactCount >= 4 && this.flip.inAir) {
      this.flip.inAir = false;
      if (Math.abs(this.flip.accumulatedXAngle) < 1 && Math.abs(this.flip.accumulatedZAngle) > 4.8) {
        this.events.trigger('flip', [Math.sign(this.flip.accumulatedZAngle)]);
      }
    }
  }
}

