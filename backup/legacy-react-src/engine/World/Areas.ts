import * as THREE from 'three/webgpu';
import { Events } from '../Events';
import { References } from '../References';
import glyphsData from '../letterGlyphs.json';
import type { GameContext } from '../GameContext';

type GlyphCommand =
  | { type: 'M'; x: number; y: number }
  | { type: 'L'; x: number; y: number }
  | { type: 'Q'; x1: number; y1: number; x: number; y: number }
  | { type: 'C'; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
  | { type: 'Z' };

export class Areas {
  events = new Events();
  private airDancers: THREE.Object3D[] = [];
  private embers: Array<{ mesh: THREE.Mesh; base: THREE.Vector3; phase: number; speed: number; radius: number }> = [];

  constructor(private game: GameContext) {
    this.loadAreas();

    this.game.ticker.events.on(
      'tick',
      () => {
        this.update();
      },
      10
    );
  }

  private create3DLetterGeometry(char: string): THREE.ExtrudeGeometry {
    const cmds = (glyphsData as Record<string, GlyphCommand[]>)[char] || [];
    const path = new THREE.ShapePath();
    for (const cmd of cmds) {
      if (cmd.type === 'M') path.moveTo(cmd.x, -cmd.y);
      else if (cmd.type === 'L') path.lineTo(cmd.x, -cmd.y);
      else if (cmd.type === 'Q') path.quadraticCurveTo(cmd.x1, -cmd.y1, cmd.x, -cmd.y);
      else if (cmd.type === 'C') path.bezierCurveTo(cmd.x1, -cmd.y1, cmd.x2, -cmd.y2, cmd.x, -cmd.y);
    }
    const shapes = path.toShapes();
    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth: 0.46,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.03,
      bevelSegments: 2,
      curveSegments: 6,
    });
    geo.center();

    // Map all vertices to palette orange/white region (u = 0.7356, v = 0.5) exactly like Bruno Simon
    const count = geo.attributes.position.count;
    const uvs = new Float32Array(count * 2);
    for (let k = 0; k < count; k++) {
      uvs[k * 2 + 0] = 0.7356;
      uvs[k * 2 + 1] = 0.5;
    }
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.computeVertexNormals();
    return geo;
  }

  private loadAreas(): void {
    const modelRoot = this.game.resources.areasModel?.scene;
    if (!modelRoot) return;

    const topNodes = [...modelRoot.children];
    for (const areaGroup of topNodes) {
      const areaName = areaGroup.name || '';
      const refs = new References();
      const children = [...areaGroup.children];

      for (const child of children) {
        refs.parse(child);

        // Replace Bruno's 10 landing letters with Neelesh's exact 3D extruded letters
        if (areaName === 'landing' && /^refLettersPhysicalDynamic/i.test(child.name)) {
          continue;
        }

        // Only skip Bruno's personal text overlays in the career/projects/lab areas
        if (
          /^careerText/i.test(child.name) ||
          /^refBlackboardLabels/i.test(child.name) ||
          (areaName === 'projects' && /^text/i.test(child.name)) ||
          (areaName === 'lab' && /^text/i.test(child.name))
        ) {
          continue;
        }

        if (typeof child.userData.preventAutoAdd === 'undefined' || !child.userData.preventAutoAdd) {
          const obj = this.game.objects.addFromModel(
            child,
            {},
            {
              position: child.position.clone().add(areaGroup.position),
              rotation: child.quaternion.clone(),
              sleeping: true,
              mass: child.userData.mass,
              colliders: [],
            }
          );

          // In Circuit, disable track barrier & elevated road colliders when not racing
          if (
            areaName === 'circuit' &&
            (/^refRoadPhysicalFixed/i.test(child.name) || /^refRailsPhysicalFixed/i.test(child.name))
          ) {
            this.game.objects.disable(obj);
          }
        }
      }

      if (areaName === 'landing') {
        this.setupLandingLetters(areaGroup.position);
        this.setupLandingBonfire(areaGroup.position, refs);
        this.setupLandingPrompts(areaGroup.position, refs);
      } else if (areaName === 'circuit') {
        const dancers = refs.items.get('airDancers');
        if (dancers) {
          for (const d of dancers) this.airDancers.push(d);
        }
      }
    }
  }

  private setupLandingLetters(areaOffset: THREE.Vector3): void {
    // Exact 3D Extruded Letters in Pally-Bold spelling N E E L E S H
    // Positioned from left to right along the exact landing line of folio-2025:
    // start (left, near grass: -8.85, -2.53, 4.82) to end (right, near crates: -1.15, -2.53, 1.18)
    const letters = ['N', 'E', 'E', 'L', 'E', 'S', 'H'];
    const startLocal = new THREE.Vector3(-8.85, -2.53, 4.82);
    const endLocal = new THREE.Vector3(-1.15, -2.53, 1.18);
    const quat = new THREE.Quaternion(0, 0.21644, 0, 0.9763);
    const paletteMat = this.game.materials.getFromName('palette');

    const halfExtentsMap: Record<string, [number, number, number]> = {
      N: [0.65, 0.77, 0.27],
      E: [0.51, 0.75, 0.27],
      L: [0.48, 0.75, 0.27],
      S: [0.53, 0.78, 0.27],
      H: [0.62, 0.79, 0.27],
    };

    for (let i = 0; i < letters.length; i++) {
      const ch = letters[i];
      const alpha = letters.length > 1 ? i / (letters.length - 1) : 0.5;
      const localPos = new THREE.Vector3().lerpVectors(startLocal, endLocal, alpha);
      const worldPos = localPos.clone().add(areaOffset);

      const geo = this.create3DLetterGeometry(ch);
      const mesh = new THREE.Mesh(geo, paletteMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const halfExtents = halfExtentsMap[ch] || [0.55, 0.75, 0.27];

      this.game.objects.add(
        { model: mesh, updateMaterials: false },
        {
          type: 'dynamic',
          position: worldPos,
          rotation: quat.clone(),
          mass: 0.12,
          sleeping: true,
          colliders: [
            {
              shape: 'cuboid',
              parameters: halfExtents,
              category: 'object',
            },
          ],
        }
      );
    }
  }

  private setupLandingBonfire(areaOffset: THREE.Vector3, refs: References): void {
    const bonfireHash = refs.items.get('bonfireHashes')?.[0];
    if (bonfireHash) {
      const basePos = bonfireHash.position.clone().add(areaOffset);
      const emberMat = this.game.materials.getFromName('emissiveOrangeRadialGradient');
      const emberGeo = new THREE.BoxGeometry(0.11, 0.11, 0.11);
      for (let i = 0; i < 14; i++) {
        const m = new THREE.Mesh(emberGeo, emberMat);
        m.position.copy(basePos);
        this.game.scene.add(m);
        this.embers.push({
          mesh: m,
          base: basePos.clone(),
          phase: i * 0.52,
          speed: 0.75 + (i % 3) * 0.22,
          radius: 0.2 + (i % 4) * 0.1,
        });
      }
    }
  }

  private setupLandingPrompts(areaOffset: THREE.Vector3, refs: References): void {
    const kiosk = refs.items.get('kioskInteractivePoint')?.[0];
    if (kiosk) {
      this.game.interactivePoints.create(
        'map',
        kiosk.position.clone().add(areaOffset),
        'Map',
        () => this.events.trigger('openMap')
      );
    }

    const controls = refs.items.get('controlsInteractivePoint')?.[0];
    if (controls) {
      this.game.interactivePoints.create(
        'controls',
        controls.position.clone().add(areaOffset),
        'Controls',
        () => this.events.trigger('openControls')
      );
    }

    const bonfire = refs.items.get('bonfireInteractivePoint')?.[0];
    if (bonfire) {
      this.game.interactivePoints.create(
        'reset',
        bonfire.position.clone().add(areaOffset),
        'Reset World',
        () => this.events.trigger('resetWorld')
      );
    }
  }

  update(): void {
    const t = this.game.ticker.elapsed;
    for (let i = 0; i < this.embers.length; i++) {
      const e = this.embers[i];
      const life = ((t * e.speed + e.phase) % 1 + 1) % 1;
      e.mesh.position.set(
        e.base.x + Math.sin(t * 2.1 + e.phase) * e.radius,
        e.base.y + 0.15 + life * 2.4,
        e.base.z + Math.cos(t * 1.9 + e.phase) * e.radius
      );
      e.mesh.scale.setScalar((1 - life * 0.85) * 1.0);
    }

    for (let i = 0; i < this.airDancers.length; i++) {
      this.airDancers[i].rotation.z = Math.sin(t * 4.5 + i * 1.7) * 0.18;
    }
  }
}
