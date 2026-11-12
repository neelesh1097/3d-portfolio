import * as THREE from 'three/webgpu';
import type { GameContext } from './GameContext';

export interface RespawnPoint {
  name: string;
  label: string;
  position: THREE.Vector3;
  rotation: number;
}

const LABELS: Record<string, string> = {
  landing: 'Spawn Hub (Neelesh)',
  bonfire: 'Campfire Plaza',
  controls: 'Controls Board',
  circuit: 'Grand Prix Circuit',
  bowling: 'Bowling Alley',
  cookie: 'Cookie Stand',
  bridge: 'Lagoon Bridge',
  toilet: 'Outhouse Trail',
  altar: 'Stone Altar',
  achievements: 'Waterfall Cove',
  behindTheScene: 'Studio Stage',
  timeMachine: 'Time Machine',
  career: 'East Overlook',
  projects: 'Forge Courtyard',
  lab: 'Alchemy Clearing',
  social: 'North Island',
};

export class Respawns {
  items = new Map<string, RespawnPoint>();
  defaultName: string;

  constructor(private game: GameContext, defaultName = 'landing') {
    this.defaultName = defaultName;
    this.parseModel();
  }

  private parseModel(): void {
    const model = this.game.resources.respawnsReferencesModel?.scene;
    if (!model) return;

    for (const child of model.children) {
      child.rotation.reorder('YXZ');
      let name = child.name.replace(/^respawn(.+)$/i, '$1');
      name = name.charAt(0).toLowerCase() + name.slice(1);
      if (name === 'onlyFans' || name === 'test') continue;

      this.items.set(name, {
        name,
        label: LABELS[name] || name.charAt(0).toUpperCase() + name.slice(1),
        position: new THREE.Vector3(
          name === 'landing' ? 41.0 : name === 'circuit' ? -15.5 : child.position.x,
          3.2,
          name === 'landing' ? 38.6 : name === 'circuit' ? 26.0 : child.position.z
        ),
        rotation: name === 'circuit' ? Math.PI * 0.5 : child.rotation.y,
      });
    }
  }

  getByName(name: string): RespawnPoint | undefined {
    return this.items.get(name);
  }

  getDefault(): RespawnPoint {
    return (
      this.items.get(this.defaultName) || {
        name: 'landing',
        label: 'Spawn Hub',
        position: new THREE.Vector3(39.53, 3.2, 37.83),
        rotation: 0.22,
      }
    );
  }

  getClosest(position: { x: number; z: number }): RespawnPoint | null {
    let closest: RespawnPoint | null = null;
    let bestDist = Infinity;
    this.items.forEach((item) => {
      const d = Math.hypot(item.position.x - position.x, item.position.z - position.z);
      if (d < bestDist) {
        bestDist = d;
        closest = item;
      }
    });
    return closest;
  }

  getMapSpots(): RespawnPoint[] {
    const order = [
      'landing',
      'circuit',
      'bowling',
      'cookie',
      'bridge',
      'altar',
      'toilet',
      'achievements',
      'timeMachine',
      'behindTheScene',
    ];
    const out: RespawnPoint[] = [];
    for (const key of order) {
      const p = this.items.get(key);
      if (p) out.push(p);
    }
    return out;
  }
}

