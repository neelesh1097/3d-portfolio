import * as THREE from 'three/webgpu';
import {
  cameraPosition,
  color,
  Fn,
  min,
  mix,
  normalWorld,
  positionWorld,
  screenCoordinate,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
} from 'three/tsl';
import gsap from 'gsap';
import { Track } from '../Tracks';
import { Trails, TrailItem } from '../Trails';
import { clamp, remapClamp } from '../utilities/maths';
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial';
import type { GameContext } from '../GameContext';

export type PaintName = 'cyan' | 'orange' | 'red' | 'white' | 'black' | 'flames' | 'abyssal';

export class VisualVehicle {
  parts: Record<string, any> = {};
  wheels: Array<{
    container: THREE.Object3D;
    suspension?: THREE.Object3D;
    cylinder?: THREE.Object3D;
    painted?: THREE.Mesh;
    groundTrack: Track;
  }> = [];
  wheelSteering = 0;

  mainGroundTrack!: Track;
  boostTrails!: {
    instance: Trails;
    leftReference: THREE.Object3D;
    rightReference: THREE.Object3D;
    left: TrailItem;
    right: TrailItem;
  };
  boostAnimation = {
    mix: 0,
    speed: 1.5,
    mixUniform: uniform(0),
  };

  paints: Record<PaintName, any> = {} as any;
  currentPaint: PaintName = 'cyan';
  screenPosition = new THREE.Vector2(0.5, 0.5);

  private blinkerState = { running: false, on: false };
  private backLightReverseMaterial: THREE.MeshBasicNodeMaterial;
  private tempVec = new THREE.Vector3();

  constructor(private game: GameContext, private model: THREE.Object3D) {
    this.backLightReverseMaterial = new THREE.MeshBasicNodeMaterial({ colorNode: vec3(2.2) });

    this.extractParts();
    this.setupMainGroundTrack();
    this.setupWheels();
    this.setupBlinkers();
    this.setupBoostTrails();
    this.setupBoostAnimation();
    this.setupPaints();

    this.game.ticker.events.on(
      'tick',
      () => {
        this.update();
      },
      8
    );
  }

  private extractParts(): void {
    const searchNames = [
      'bodyPainted',
      'chassis',
      'blinkerLeft',
      'blinkerRight',
      'stopLights',
      'backLights',
      'wheelContainer',
      'cell1',
      'cell2',
      'cell3',
      'energy',
    ];
    const regexes = searchNames.map((n) => new RegExp(`^(${n})`, 'i'));

    this.model.traverse((child: any) => {
      if (child.isMesh) {
        child.receiveShadow = true;
        child.castShadow = true;
        if (child.material) {
          child.material.shadowSide = THREE.BackSide;
        }
      }

      for (const rx of regexes) {
        const match = child.name.match(rx);
        if (match) {
          this.parts[match[1]] = child;
        }
      }
    });

    if (this.parts.chassis) {
      this.parts.chassis.rotation.reorder('YXZ');
      this.game.materials.updateObject(this.parts.chassis);
      this.game.scene.add(this.parts.chassis);
    }

    if (this.parts.blinkerLeft) this.parts.blinkerLeft.visible = false;
    if (this.parts.blinkerRight) this.parts.blinkerRight.visible = false;
    if (this.parts.stopLights) this.parts.stopLights.visible = false;
    if (this.parts.backLights) this.parts.backLights.visible = false;

    if (this.parts.wheelContainer) {
      this.game.materials.updateObject(this.parts.wheelContainer);
      this.parts.wheelContainer.removeFromParent();
    }
  }

  private setupPaints(): void {
    this.paints.cyan = this.game.materials.getFromName('cyanGradient');
    this.paints.red = this.game.materials.getFromName('redGradient');
    this.paints.orange = this.game.materials.getFromName('orangeGradient');
    this.paints.white = this.game.materials.getFromName('whiteGradient');
    this.paints.black = this.game.materials.getFromName('blackGradient');

    // Animated procedural flames paint
    {
      const material = this.paints.red.clone();
      const baseOutput = material.outputNode;
      const colorA = uniform(color('#ff9c20'));
      const colorB = uniform(color('#ff0000'));
      const emissiveStrength = uniform(6.5);

      material.outputNode = Fn(() => {
        const newUv = uv(1).toVar();
        const uv3 = newUv
          .sub(vec2(0, this.game.ticker.elapsedScaledUniform.mul(-0.075)))
          .mul(vec2(1.25, 0.45));
        const noise3 = texture(this.game.noises.voronoi, uv3).r;

        const uv4 = newUv
          .sub(vec2(0, this.game.ticker.elapsedScaledUniform.mul(-0.041)))
          .mul(vec2(1.66, 0.97));
        const noise4 = texture(this.game.noises.voronoi, uv4).r;

        const noiseFinal = min(noise3, noise4);
        const stepThreshold = newUv.y.oneMinus();
        const flameMix = noiseFinal.step(stepThreshold);
        const flameColor = mix(colorA, colorB, newUv.y).mul(emissiveStrength);
        baseOutput.rgb.assign(mix(baseOutput.rgb, flameColor, flameMix));
        return baseOutput;
      })();
      this.paints.flames = material;
    }

    // Cosmic abyssal paint
    {
      const material = new THREE.MeshBasicMaterial({ wireframe: false });
      const fresnelColor = uniform(color('#43d9f5'));
      const fresnelIntensity = uniform(18);
      const starsIntensity = uniform(8);

      material.outputNode = Fn(() => {
        const starsUv = screenCoordinate.div(256).fract();
        const starsColor = texture(this.game.resources.behindTheSceneStarsTexture, starsUv)
          .rgb.pow(2)
          .mul(starsIntensity);
        const viewDir = positionWorld.sub(cameraPosition).normalize();
        const fresnel = viewDir.dot(normalWorld).remapClamp(-0.2, -0.4, 1, 0);
        const finalColor = mix(starsColor, fresnelColor.mul(fresnelIntensity), fresnel);
        finalColor.assign(MeshDefaultMaterial.revealDiscardNodeBuilder(this.game, finalColor));
        return vec4(finalColor, 1);
      })();
      this.paints.abyssal = material;
    }

    this.setPaint('cyan');
  }

  setPaint(name: PaintName): void {
    const material = this.paints[name] || this.paints.cyan;
    this.currentPaint = name;

    if (this.parts.bodyPainted) {
      this.parts.bodyPainted.material = material;
    }
    for (const wheel of this.wheels) {
      if (wheel.painted) {
        wheel.painted.material = material;
      }
    }
  }

  private setupMainGroundTrack(): void {
    this.mainGroundTrack = this.game.tracks.add(new Track(this.game, 1.45, 'g'));
  }

  private setupWheels(): void {
    if (!this.parts.wheelContainer || !this.parts.chassis) return;

    for (let i = 0; i < 4; i++) {
      const container = this.parts.wheelContainer.clone(true);
      this.parts.chassis.add(container);

      let suspension: THREE.Object3D | undefined;
      let cylinder: THREE.Object3D | undefined;
      let painted: THREE.Mesh | undefined;

      container.traverse((child: any) => {
        if (child.name.match(/^wheelSuspension/i)) suspension = child;
        if (child.name.match(/^wheelCylinder/i)) cylinder = child;
        if (child.name.match(/^wheelPainted/i)) painted = child;
      });

      if (cylinder) cylinder.position.set(0, 0, 0);
      if (i === 0 || i === 2) container.rotation.y = Math.PI;

      const groundTrack = this.game.tracks.add(new Track(this.game, 0.48, 'r'));
      this.wheels.push({ container, suspension, cylinder, painted, groundTrack });
    }
  }

  private setupBlinkers(): void {
    if (!this.parts.blinkerLeft || !this.parts.blinkerRight) return;

    const blink = () => {
      this.blinkerState.on = !this.blinkerState.on;
      const leftActive = !!this.game.inputs.actions.get('left')?.active;
      const rightActive = !!this.game.inputs.actions.get('right')?.active;

      this.parts.blinkerLeft.visible = leftActive ? this.blinkerState.on : false;
      this.parts.blinkerRight.visible = rightActive ? this.blinkerState.on : false;

      if (!leftActive && !rightActive && !this.blinkerState.on) {
        this.blinkerState.running = false;
      } else {
        gsap.delayedCall(0.65, blink);
      }
    };

    const start = () => {
      if (this.blinkerState.running) return;
      this.blinkerState.running = true;
      this.blinkerState.on = true;
      this.parts.blinkerLeft.visible = !!this.game.inputs.actions.get('left')?.active;
      this.parts.blinkerRight.visible = !!this.game.inputs.actions.get('right')?.active;
      gsap.delayedCall(0.65, blink);
    };

    this.game.inputs.events.on('left', (action: any) => {
      if (action.active) start();
    });
    this.game.inputs.events.on('right', (action: any) => {
      if (action.active) start();
    });
  }

  private setupBoostTrails(): void {
    const trails = new Trails(this.game);
    const leftRef = new THREE.Object3D();
    leftRef.position.set(-1.42, 0.26, -0.52);
    this.parts.chassis?.add(leftRef);

    const rightRef = new THREE.Object3D();
    rightRef.position.set(-1.42, 0.26, 0.52);
    this.parts.chassis?.add(rightRef);

    const left = trails.create();
    const right = trails.create();
    leftRef.getWorldPosition(left.position);
    rightRef.getWorldPosition(right.position);

    this.boostTrails = {
      instance: trails,
      leftReference: leftRef,
      rightReference: rightRef,
      left,
      right,
    };
  }

  private setupBoostAnimation(): void {
    if (this.parts.energy && this.parts.energy.material?.outputNode) {
      const emissiveOut = this.game.materials.getFromName('emissiveBlueRadialGradient').outputNode;
      const defaultOut = this.parts.energy.material.outputNode;

      const mat = new THREE.MeshLambertNodeMaterial();
      mat.outputNode = mix(defaultOut, emissiveOut, this.boostAnimation.mixUniform);
      this.parts.energy.material = mat;
    }
  }

  update(): void {
    const pv = this.game.physicalVehicle;
    if (!pv || !this.parts.chassis) return;

    this.parts.chassis.position.copy(pv.position);
    this.parts.chassis.quaternion.copy(pv.quaternion);

    const dtScaled = this.game.ticker.deltaScaled;
    this.wheelSteering +=
      (this.game.player.steering * pv.steeringAmplitude - this.wheelSteering) *
      Math.min(1, dtScaled * 16);

    const wheelsRotation = (pv.forwardSpeed / pv.wheels.settings.radius) * 0.006;

    for (let i = 0; i < this.wheels.length; i++) {
      const vw = this.wheels[i];
      const pw = pv.wheels.items[i];

      if (vw.cylinder) {
        if (!this.game.player.braking || Math.abs(this.game.player.accelerating) > 0) {
          vw.cylinder.rotation.z += i === 0 || i === 2 ? wheelsRotation : -wheelsRotation;
        }
      }

      if (i === 0) vw.container.rotation.y = Math.PI + this.wheelSteering;
      if (i === 1) vw.container.rotation.y = this.wheelSteering;

      const wheelY = Math.min(pw.basePosition.y - pw.suspensionLength, -0.45);
      vw.container.position.x = pw.basePosition.x;
      vw.container.position.y +=
        (wheelY - vw.container.position.y) * Math.min(1, 25 * dtScaled);
      vw.container.position.z = pw.basePosition.z;

      if (vw.suspension) {
        vw.suspension.scale.y = Math.max(0.1, Math.abs(vw.container.position.y) - 0.5);
      }

      vw.groundTrack.update(pw.contactPoint, pw.inContact);
    }

    this.mainGroundTrack.update(pv.position, pv.position.y < 1.5);

    // Stop & reverse lights
    if (this.game.player.braking) {
      if (this.parts.stopLights) this.parts.stopLights.visible = true;
      if (this.parts.backLights) {
        this.parts.backLights.visible = true;
        this.parts.backLights.material = this.game.materials.getFromName(
          'emissiveOrangeRadialGradient'
        );
      }
    } else {
      if (this.parts.stopLights) this.parts.stopLights.visible = false;
      if (this.parts.backLights) {
        if (this.game.player.accelerating < 0) {
          this.parts.backLights.visible = true;
          this.parts.backLights.material = this.backLightReverseMaterial;
        } else {
          this.parts.backLights.visible = false;
        }
      }
    }

    // Boost trails & cell glow
    const trailAlpha = pv.goingForward && this.game.player.boosting > 0 ? 1 : 0;
    this.boostTrails.leftReference.getWorldPosition(this.boostTrails.left.position);
    this.boostTrails.left.alpha = trailAlpha;
    this.boostTrails.rightReference.getWorldPosition(this.boostTrails.right.position);
    this.boostTrails.right.alpha = trailAlpha;

    this.boostAnimation.mix = clamp(
      this.boostAnimation.mix + (this.game.player.boosting ? 1 : -1) * dtScaled * this.boostAnimation.speed,
      0,
      1
    );
    this.boostAnimation.mixUniform.value = 1 - Math.pow(1 - this.boostAnimation.mix, 7);

    if (this.parts.cell1 && this.parts.cell2 && this.parts.cell3) {
      this.parts.cell1.position.y = remapClamp(this.boostAnimation.mix, 0, 0.6, 0.2, 0);
      this.parts.cell3.position.y = remapClamp(this.boostAnimation.mix, 0.2, 0.8, 0.2, 0);
      this.parts.cell2.position.y = remapClamp(this.boostAnimation.mix, 0.4, 1, 0.2, 0);
    }

    // Screen position for foliage see-through
    this.tempVec.setFromMatrixPosition(this.parts.chassis.matrixWorld);
    this.tempVec.project(this.game.view.camera);
    this.screenPosition.set(this.tempVec.x * 0.5 + 0.5, this.tempVec.y * -0.5 + 0.5);
  }
}

