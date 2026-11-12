import * as THREE from 'three/webgpu';
import { Events } from './Events';
import type { GameContext } from './GameContext';

export class Player {
  events = new Events();
  accelerating = 0;
  steering = 0;
  boosting = 0;
  braking = 0;

  position = new THREE.Vector3(0, 1.5, 0);
  position2 = new THREE.Vector2(0, 0);
  rotationY = 0;
  distanceDriven = 0;

  private boostHoldSeconds = 0;
  private hasDrivenFirstTime = false;
  private boostAchievementSent = false;
  private airAchievementSent = false;

  constructor(private game: GameContext) {
    this.game.inputs.events.on('jump', (action: any) => {
      if (action.active) {
        const pv = this.game.physicalVehicle;
        if (pv.wheels.inContactCount > 0 || pv.upsideDown.active) {
          pv.jump();
          if (!this.airAchievementSent) {
            this.airAchievementSent = true;
            this.events.trigger('achievement', ['stunt_jumper']);
          }
        }
      }
    });

    this.game.inputs.events.on('respawn', (action: any) => {
      if (action.active) {
        this.respawn();
      }
    });

    this.game.inputs.events.on('honk', (action: any) => {
      if (action.active) {
        this.events.trigger('honk');
      }
    });

    this.game.ticker.events.on(
      'tick',
      () => {
        this.updatePrePhysics();
      },
      1
    );

    this.game.ticker.events.on(
      'tick',
      () => {
        this.updatePostPhysics();
      },
      6
    );
  }

  respawn(x?: number, z?: number, rotationY?: number): void {
    const def = this.game.respawns?.getDefault();
    const rx = x ?? def?.position.x ?? 39.53;
    const rz = z ?? def?.position.z ?? 37.83;
    const ry = rotationY ?? def?.rotation ?? 0.22;
    const surfaceY = this.game.terrain?.getHeightAt(rx, rz) ?? 0;
    this.game.physicalVehicle.moveTo({ x: rx, y: Math.max(surfaceY + 2.0, 2.5), z: rz }, ry);
    this.position.set(rx, Math.max(surfaceY + 2.0, 2.5), rz);
    this.position2.set(rx, rz);
    this.rotationY = ry;
    this.game.view?.snapTo(rx, 0.5, rz);
    this.events.trigger('respawn');
  }

  updatePrePhysics(): void {
    const actions = this.game.inputs.actions;
    const forward = actions.get('forward')?.active ? 1 : 0;
    const backward = actions.get('backward')?.active ? 1 : 0;
    const left = actions.get('left')?.active ? 1 : 0;
    const right = actions.get('right')?.active ? 1 : 0;
    const boost = actions.get('boost')?.active ? 1 : 0;
    const brake = actions.get('brake')?.active ? 1 : 0;

    this.accelerating = forward - backward;
    this.steering = left - right;
    this.boosting = boost && (forward > 0 || this.game.physicalVehicle.speed > 1.5) ? 1 : 0;
    this.braking = brake;

    if (this.boosting > 0) {
      this.boostHoldSeconds += this.game.ticker.delta;
      if (this.boostHoldSeconds >= 1.2 && !this.boostAchievementSent) {
        this.boostAchievementSent = true;
        this.events.trigger('achievement', ['nitro_boost']);
      }
    } else {
      this.boostHoldSeconds = 0;
    }

    if (!this.hasDrivenFirstTime && Math.abs(this.accelerating) > 0) {
      this.hasDrivenFirstTime = true;
      this.events.trigger('achievement', ['first_drive']);
    }
  }

  updatePostPhysics(): void {
    const pv = this.game.physicalVehicle;
    const prevX = this.position.x;
    const prevZ = this.position.z;

    this.position.copy(pv.position);
    this.position2.set(pv.position.x, pv.position.z);
    this.rotationY = pv.yRotation;

    const stepDist = Math.hypot(this.position.x - prevX, this.position.z - prevZ);
    if (stepDist < 10) {
      this.distanceDriven += stepDist;
    }

    // Air jump ramp detection
    if (pv.wheels.inContactCount === 0 && pv.position.y > 2.4 && !this.airAchievementSent) {
      this.airAchievementSent = true;
      this.events.trigger('achievement', ['stunt_jumper']);
    }

    // Out of bounds / deep ocean auto-rescue
    if (
      pv.position.y < this.game.water.depthElevation - 2 ||
      Math.hypot(pv.position.x, pv.position.z) > 85
    ) {
      this.respawn(0, 0, Math.PI * 0.5);
    }
  }
}
