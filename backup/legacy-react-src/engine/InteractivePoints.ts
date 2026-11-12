import * as THREE from 'three/webgpu';
import {
  color,
  distance,
  Fn,
  max,
  mix,
  step,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
} from 'three/tsl';
import gsap from 'gsap';
import { TextCanvas } from './TextCanvas';
import type { GameContext } from './GameContext';

export interface InteractivePointItem {
  id: string;
  position: THREE.Vector3;
  group: THREE.Group;
  isOpen: boolean;
  isConcealed: boolean;
  threshold: any;
  lineOffset: any;
  labelOffset: any;
  interactCallback: () => void;
  enterCallback?: () => void;
  leaveCallback?: () => void;
}

export class InteractivePoints {
  items: InteractivePointItem[] = [];
  activeItem: InteractivePointItem | null = null;

  private planeGeo = new THREE.PlaneGeometry(1.75, 1.75);
  private labelGeo = new THREE.PlaneGeometry(1, 0.9, 1, 1);
  private backColor = uniform(color('#0f1d2e'));
  private frontColor = uniform(color('#43d9f5'));
  private textColor = uniform(color('#f4f7fa'));

  constructor(private game: GameContext) {
    this.labelGeo.translate(0.5, 0, 0);

    this.game.inputs.events.on('interact', (action: any) => {
      if (action.active && this.activeItem && this.activeItem.isOpen) {
        this.activeItem.interactCallback();
      }
    });

    this.game.ticker.events.on(
      'tick',
      () => {
        this.update();
      },
      9
    );
  }

  create(
    id: string,
    position: THREE.Vector3,
    text: string,
    interactCallback: () => void,
    enterCallback?: () => void,
    leaveCallback?: () => void
  ): InteractivePointItem {
    const group = new THREE.Group();
    group.rotation.reorder('YXZ');
    group.rotation.x = -Math.PI * 0.14;
    group.rotation.y = Math.PI * 0.25;
    group.position.copy(position);
    this.game.scene.add(group);

    const threshold = uniform(0);
    const lineOffset = uniform(0);
    const labelOffset = uniform(0);

    // Rotating diamond indicator plane
    const iconMat = new THREE.MeshBasicNodeMaterial({
      transparent: true,
      depthTest: false,
    });
    iconMat.outputNode = Fn(() => {
      const d = vec2(uv().sub(0.5).abs());
      const manhattan = d.x.add(d.y);
      const outer = step(manhattan, threshold.mul(0.48));
      const inner = step(manhattan, threshold.mul(0.32));
      const border = outer.sub(inner);

      outer.lessThan(0.5).discard();
      const fill = mix(this.backColor, this.frontColor, border);
      return vec4(fill, 0.92);
    })();

    const iconMesh = new THREE.Mesh(this.planeGeo, iconMat);
    iconMesh.renderOrder = 7;
    group.add(iconMesh);

    // Key prompt badge ("E")
    if (this.game.resources.interactivePointsKeyIconEnterTexture) {
      const keyMat = new THREE.MeshBasicNodeMaterial({
        transparent: true,
        depthTest: false,
      });
      keyMat.outputNode = Fn(() => {
        const iconAlpha = texture(
          this.game.resources.interactivePointsKeyIconEnterTexture,
          vec2(uv().x, uv().y.oneMinus())
        ).r;
        iconAlpha.mul(threshold).lessThan(0.35).discard();
        return vec4(this.textColor, 1);
      })();
      const keyMesh = new THREE.Mesh(this.planeGeo, keyMat);
      keyMesh.scale.setScalar(0.52);
      keyMesh.position.z = 0.02;
      keyMesh.renderOrder = 8;
      group.add(keyMesh);
    }

    // Crisp label banner
    const textCanvas = new TextCanvas('Space Grotesk', '700', 22, 220, 48, 2, 'left', 26);
    textCanvas.updateText(text);
    const labelWidth = Math.max(1.9, (textCanvas.getMeasure().width / 440) * 4.2 + 0.6);

    const labelMat = new THREE.MeshBasicNodeMaterial({
      transparent: true,
      depthTest: false,
    });
    labelMat.outputNode = Fn(() => {
      const textMask = texture(textCanvas.texture, vec2(uv().x, uv().y.oneMinus())).r;
      const slideMask = step(uv().x, labelOffset);
      slideMask.lessThan(0.5).discard();

      const bg = mix(this.backColor, this.textColor, textMask);
      return vec4(bg, max(0.88, textMask));
    })();

    const labelMesh = new THREE.Mesh(this.labelGeo, labelMat);
    labelMesh.scale.set(labelWidth, 0.7, 1);
    labelMesh.position.set(0.92, 0, 0.01);
    labelMesh.renderOrder = 7;
    group.add(labelMesh);

    const item: InteractivePointItem = {
      id,
      position: position.clone(),
      group,
      isOpen: false,
      isConcealed: true,
      threshold,
      lineOffset,
      labelOffset,
      interactCallback,
      enterCallback,
      leaveCallback,
    };

    // Subtle concealed pulse dot when far
    gsap.set(threshold, { value: 0.38 });

    this.items.push(item);
    return item;
  }

  update(): void {
    const p2 = this.game.player.position2;
    let closest: InteractivePointItem | null = null;
    let minDist = Infinity;

    for (const item of this.items) {
      const d = Math.hypot(p2.x - item.position.x, p2.y - item.position.z);
      if (d < 5.5 && d < minDist) {
        minDist = d;
        closest = item;
      }

      // Gentle float animation
      item.group.position.y =
        item.position.y + Math.sin(this.game.ticker.elapsed * 2.2 + item.position.x) * 0.12;
    }

    if (closest !== this.activeItem) {
      if (this.activeItem) {
        const prev = this.activeItem;
        prev.isOpen = false;
        gsap.to(prev.threshold, { value: 0.38, duration: 0.25, overwrite: true });
        gsap.to(prev.labelOffset, { value: 0, duration: 0.2, overwrite: true });
        prev.leaveCallback?.();
      }

      this.activeItem = closest;

      if (closest) {
        closest.isOpen = true;
        gsap.to(closest.threshold, { value: 1.0, duration: 0.32, ease: 'back.out(1.7)', overwrite: true });
        gsap.to(closest.labelOffset, { value: 1.0, duration: 0.28, ease: 'power2.out', overwrite: true });
        closest.enterCallback?.();
      }
    }
  }
}
