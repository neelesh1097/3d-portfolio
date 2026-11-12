import * as THREE from 'three/webgpu';
import { Events } from './Events';
import type { GameContext } from './GameContext';

export interface ZoneItem {
  id: string;
  type: 'sphere' | 'cylinder';
  position: THREE.Vector3;
  radius: number;
  isIn: boolean;
  events: Events;
}

export class Zones {
  items: ZoneItem[] = [];

  constructor(private game: GameContext) {
    this.game.ticker.events.on(
      'tick',
      () => {
        this.update();
      },
      8
    );
  }

  create(
    id: string,
    type: 'sphere' | 'cylinder',
    position: THREE.Vector3,
    radius: number
  ): ZoneItem {
    const zone: ZoneItem = {
      id,
      type,
      position: position.clone(),
      radius,
      isIn: false,
      events: new Events(),
    };
    this.items.push(zone);
    return zone;
  }

  update(): void {
    const p = this.game.player.position;

    for (let i = 0; i < this.items.length; i++) {
      const zone = this.items[i];
      const distance =
        zone.type === 'cylinder'
          ? Math.hypot(p.x - zone.position.x, p.z - zone.position.z)
          : p.distanceTo(zone.position);

      if (distance < zone.radius) {
        if (!zone.isIn) {
          zone.isIn = true;
          zone.events.trigger('enter', [zone]);
        }
      } else if (zone.isIn) {
        zone.isIn = false;
        zone.events.trigger('leave', [zone]);
      }
    }
  }
}

