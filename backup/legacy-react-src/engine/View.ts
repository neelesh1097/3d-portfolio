import * as THREE from 'three/webgpu';
import gsap from 'gsap';
import { clamp, lerp, remap, smoothstep } from './utilities/maths';
import type { GameContext } from './GameContext';

export class View {
  position = new THREE.Vector3();
  delta = new THREE.Vector3();
  idealRatio = 1920 / 1080;
  ratioOverflow = 0;

  camera!: THREE.PerspectiveCamera;
  defaultCamera!: THREE.PerspectiveCamera;

  focusPoint = {
    trackedPosition: new THREE.Vector3(0, 0, 0),
    isTracking: true,
    position: new THREE.Vector3(0, 0, 0),
    smoothedPosition: new THREE.Vector3(0, 0, 0),
    easing: 1,
    lookAhead: 1.65,
    magnet: {
      active: true,
      multiplier: 0.25,
    },
  };

  zoom = {
    baseRatio: 0.52,
    ratio: 0.52,
    smoothedRatio: 0.52,
    speedAmplitude: -0.26,
    speedEdge: { min: 4, max: 24 },
    sensitivity: 0.045,
  };

  spherical = {
    phi: Math.PI * 0.305,
    theta: Math.PI * 0.25,
    radius: {
      edges: { min: 15, max: 32 },
      current: 22,
      nonIdealRatioOffset: 8,
    },
    offset: new THREE.Vector3(),
  };

  roll = {
    value: 0,
    velocity: 0,
    speed: 0,
    damping: 4,
    pullStrength: 100,
    kickStrength: 0.08,
  };

  cinematic = {
    active: false,
    progress: 0,
    position: new THREE.Vector3(),
    target: new THREE.Vector3(),
    dummy: new THREE.PerspectiveCamera(),
  };

  optimalArea = {
    position: new THREE.Vector3(),
    basePosition: new THREE.Vector3(),
    nearPosition: new THREE.Vector3(),
    farPosition: new THREE.Vector3(),
    nearDistance: 12,
    farDistance: 72,
    radius: 30,
    raycaster: new THREE.Raycaster(),
    floorPlane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    quad2: [
      { base: new THREE.Vector2(), offseted: new THREE.Vector2() },
      { base: new THREE.Vector2(), offseted: new THREE.Vector2() },
      { base: new THREE.Vector2(), offseted: new THREE.Vector2() },
      { base: new THREE.Vector2(), offseted: new THREE.Vector2() },
    ],
  };

  private _ndc = new THREE.Vector2();
  private _tempOffset = new THREE.Vector3();
  private _mapMove = new THREE.Vector2();
  private _origin2 = new THREE.Vector2();

  constructor(private game: GameContext) {
    this.ratioOverflow = Math.max(1, this.idealRatio / this.game.viewport.ratio) - 1;

    this.camera = new THREE.PerspectiveCamera(25, this.game.viewport.ratio, 0.1, 240);
    this.spherical.offset.setFromSphericalCoords(
      this.spherical.radius.current,
      this.spherical.phi,
      this.spherical.theta
    );
    this.camera.position.copy(this.spherical.offset);
    this.defaultCamera = this.camera.clone();
    this.game.scene.add(this.camera);

    this.game.inputs.events.on('zoom', (action: any) => {
      this.zoom.baseRatio = clamp(this.zoom.baseRatio - action.value * this.zoom.sensitivity, 0, 1);
    });

    this.updateOptimalArea();
    this.update();

    this.game.ticker.events.on(
      'tick',
      () => {
        this.update();
      },
      7
    );

    this.game.viewport.events.on('change', () => {
      this.resize();
    });

    this.game.viewport.events.on(
      'throttleChange',
      () => {
        this.updateOptimalArea();
      },
      1
    );
  }

  snapTo(x: number, y: number, z: number): void {
    this.focusPoint.isTracking = true;
    this.focusPoint.trackedPosition.set(x, y, z);
    this.focusPoint.position.set(x, y, z);
    this.focusPoint.smoothedPosition.set(x, y, z);
    this.update();
  }

  kickRoll(strength = 1): void {
    this.roll.speed = strength * this.roll.kickStrength * (Math.random() < 0.5 ? -1 : 1);
  }

  startCinematic(position: THREE.Vector3, target: THREE.Vector3): void {
    this.cinematic.active = true;
    this.cinematic.position.copy(position);
    this.cinematic.target.copy(target);
    gsap.to(this.cinematic, { progress: 1, duration: 1.2, ease: 'power2.inOut', overwrite: true });
  }

  endCinematic(): void {
    this.cinematic.active = false;
    gsap.to(this.cinematic, { progress: 0, duration: 0.9, ease: 'power2.inOut', overwrite: true });
  }

  updateOptimalArea(): void {
    const savedPos = this.defaultCamera.position.clone();
    const savedQuat = this.defaultCamera.quaternion.clone();

    let radiusMax =
      this.spherical.radius.edges.max +
      this.ratioOverflow * this.spherical.radius.nonIdealRatioOffset;
    if (this.game.quality.level === 0) {
      radiusMax *= 1 - this.zoom.speedAmplitude;
    }

    this._tempOffset.setFromSphericalCoords(radiusMax, this.spherical.phi, this.spherical.theta);
    this.defaultCamera.position.copy(this._tempOffset);
    this.defaultCamera.lookAt(0, 0, 0);
    this.defaultCamera.updateProjectionMatrix();
    this.defaultCamera.updateWorldMatrix(true, false);

    // 4 corners of ground intersection
    this._ndc.set(1, -1);
    this.optimalArea.raycaster.setFromCamera(this._ndc, this.defaultCamera);
    this.optimalArea.raycaster.ray.intersectPlane(
      this.optimalArea.floorPlane,
      this.optimalArea.nearPosition
    );
    this.optimalArea.quad2[0].base.set(
      this.optimalArea.nearPosition.x,
      this.optimalArea.nearPosition.z
    );

    this._ndc.set(-1, 1);
    this.optimalArea.raycaster.setFromCamera(this._ndc, this.defaultCamera);
    this.optimalArea.raycaster.ray.intersectPlane(
      this.optimalArea.floorPlane,
      this.optimalArea.farPosition
    );
    this.optimalArea.quad2[2].base.set(
      this.optimalArea.farPosition.x,
      this.optimalArea.farPosition.z
    );
    const centerA = this.optimalArea.nearPosition.clone().lerp(this.optimalArea.farPosition, 0.5);

    this._ndc.set(-1, -1);
    this.optimalArea.raycaster.setFromCamera(this._ndc, this.defaultCamera);
    this.optimalArea.raycaster.ray.intersectPlane(
      this.optimalArea.floorPlane,
      this.optimalArea.nearPosition
    );
    this.optimalArea.quad2[3].base.set(
      this.optimalArea.nearPosition.x,
      this.optimalArea.nearPosition.z
    );

    this._ndc.set(1, 1);
    this.optimalArea.raycaster.setFromCamera(this._ndc, this.defaultCamera);
    this.optimalArea.raycaster.ray.intersectPlane(
      this.optimalArea.floorPlane,
      this.optimalArea.farPosition
    );
    this.optimalArea.quad2[1].base.set(
      this.optimalArea.farPosition.x,
      this.optimalArea.farPosition.z
    );
    const centerB = this.optimalArea.nearPosition.clone().lerp(this.optimalArea.farPosition, 0.5);

    this.optimalArea.basePosition.copy(centerA).lerp(centerB, 0.5);
    this.optimalArea.radius = this.optimalArea.basePosition.distanceTo(this.optimalArea.farPosition);

    this._ndc.set(0, -1);
    this.optimalArea.raycaster.setFromCamera(this._ndc, this.defaultCamera);
    this.optimalArea.raycaster.ray.intersectPlane(
      this.optimalArea.floorPlane,
      this.optimalArea.nearPosition
    );

    this._ndc.set(0, 1);
    this.optimalArea.raycaster.setFromCamera(this._ndc, this.defaultCamera);
    this.optimalArea.raycaster.ray.intersectPlane(
      this.optimalArea.floorPlane,
      this.optimalArea.farPosition
    );

    this.optimalArea.nearDistance = this.defaultCamera.position.distanceTo(
      this.optimalArea.nearPosition
    );
    this.optimalArea.farDistance = this.defaultCamera.position.distanceTo(
      this.optimalArea.farPosition
    );

    this.defaultCamera.position.copy(savedPos);
    this.defaultCamera.quaternion.copy(savedQuat);
  }

  resize(): void {
    this.ratioOverflow = Math.max(1, this.idealRatio / this.game.viewport.ratio) - 1;
    this.camera.aspect = this.game.viewport.width / Math.max(1, this.game.viewport.height);
    this.camera.updateProjectionMatrix();
    this.defaultCamera.aspect = this.camera.aspect;
    this.defaultCamera.updateProjectionMatrix();
  }

  update(): void {
    const pv = this.game.physicalVehicle;
    const dt = this.game.ticker.delta;

    if (pv) {
      // Look-ahead magnet along forward velocity
      const aheadScale = clamp(pv.xzSpeed / 12, 0, 1) * this.focusPoint.lookAhead;
      this.focusPoint.trackedPosition.set(
        pv.position.x + pv.forward.x * aheadScale,
        clamp(pv.position.y * 0.35, 0, 2.5),
        pv.position.z + pv.forward.z * aheadScale
      );
    }

    // Mouse drag panning in wandering mode
    if (this.game.inputs.pointer.down && !this.game.inputs.filters.has('modal')) {
      const dx = this.game.inputs.pointer.delta.x;
      const dy = this.game.inputs.pointer.delta.y;
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        this.focusPoint.isTracking = false;
        this._mapMove.set(dx, dy).rotateAround(this._origin2, -this.spherical.theta);
        const smallestSide = Math.min(this.game.viewport.width, this.game.viewport.height);
        this._mapMove.multiplyScalar(18 / Math.max(1, smallestSide));
        this.focusPoint.position.x -= this._mapMove.x;
        this.focusPoint.position.z -= this._mapMove.y;
      }
    }

    if (
      Math.abs(this.game.player?.accelerating ?? 0) > 0 ||
      Math.abs(this.game.player?.steering ?? 0) > 0
    ) {
      this.focusPoint.isTracking = true;
    }

    if (this.focusPoint.isTracking) {
      this.focusPoint.position.copy(this.focusPoint.trackedPosition);
    } else if (this.focusPoint.magnet.active) {
      const dx = this.focusPoint.trackedPosition.x - this.focusPoint.position.x;
      const dz = this.focusPoint.trackedPosition.z - this.focusPoint.position.z;
      const d = Math.hypot(dx, dz);
      const strength = d * this.focusPoint.magnet.multiplier;
      this.focusPoint.position.x += strength * dx * dt;
      this.focusPoint.position.z += strength * dz * dt;
    }

    const easing = remap(this.focusPoint.easing, 0, 1, 1, Math.min(1, dt * 8.5));
    const prevSmoothX = this.focusPoint.smoothedPosition.x;
    const prevSmoothZ = this.focusPoint.smoothedPosition.z;
    this.focusPoint.smoothedPosition.lerp(this.focusPoint.position, easing);

    const focusPointSpeed =
      Math.hypot(
        this.focusPoint.smoothedPosition.x - prevSmoothX,
        this.focusPoint.smoothedPosition.z - prevSmoothZ
      ) / Math.max(0.001, dt);

    const zoomSpeedRatio = smoothstep(
      focusPointSpeed,
      this.zoom.speedEdge.min,
      this.zoom.speedEdge.max
    );
    this.zoom.ratio = this.zoom.baseRatio;
    if (this.focusPoint.isTracking && this.game.quality.level === 0) {
      this.zoom.ratio += this.zoom.speedAmplitude * zoomSpeedRatio;
    }
    this.zoom.smoothedRatio = lerp(this.zoom.smoothedRatio, this.zoom.ratio, Math.min(1, dt * 8));

    const radiusMax =
      this.spherical.radius.edges.max +
      this.ratioOverflow * this.spherical.radius.nonIdealRatioOffset;
    this.spherical.radius.current = lerp(
      this.spherical.radius.edges.min,
      radiusMax,
      1 - this.zoom.smoothedRatio
    );
    this.spherical.offset.setFromSphericalCoords(
      this.spherical.radius.current,
      this.spherical.phi,
      this.spherical.theta
    );

    this.position.copy(this.focusPoint.smoothedPosition).add(this.spherical.offset);
    this.delta.copy(this.position).sub(this.defaultCamera.position);
    this.defaultCamera.position.copy(this.position);

    this.defaultCamera.rotation.set(0, 0, 0);
    this.defaultCamera.lookAt(this.focusPoint.smoothedPosition);

    const dtScaled = this.game.ticker.deltaScaled;
    this.roll.velocity = -this.roll.value * this.roll.pullStrength * dtScaled;
    this.roll.speed += this.roll.velocity;
    this.roll.value += this.roll.speed * dtScaled;
    this.roll.speed *= Math.max(0, 1 - this.roll.damping * dtScaled);
    this.defaultCamera.rotation.z += this.roll.value;

    if (this.cinematic.progress > 0) {
      this.cinematic.dummy.position.copy(this.cinematic.position);
      this.cinematic.dummy.lookAt(this.cinematic.target);
      this.defaultCamera.position.lerp(this.cinematic.dummy.position, this.cinematic.progress);
      this.defaultCamera.quaternion.slerp(this.cinematic.dummy.quaternion, this.cinematic.progress);
    }

    this.camera.position.copy(this.defaultCamera.position);
    this.camera.quaternion.copy(this.defaultCamera.quaternion);
    this.camera.updateMatrixWorld();
    this.defaultCamera.updateMatrixWorld();

    this.optimalArea.position
      .copy(this.optimalArea.basePosition)
      .add(
        this._tempOffset.set(
          this.focusPoint.smoothedPosition.x,
          0,
          this.focusPoint.smoothedPosition.z
        )
      );

    for (const point of this.optimalArea.quad2) {
      point.offseted.x = point.base.x + this.focusPoint.position.x;
      point.offseted.y = point.base.y + this.focusPoint.position.z;
    }
  }
}

