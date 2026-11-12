import { Floor } from './Floor';
import { WaterSurface } from './WaterSurface';
import { Grass } from './Grass';
import { VisualVehicle } from './VisualVehicle';
import { Scenery } from './Scenery';
import { Areas } from './Areas';
import type { GameContext } from '../GameContext';

export class World {
  floor!: Floor;
  waterSurface!: WaterSurface;
  grass!: Grass;
  visualVehicle!: VisualVehicle;
  scenery!: Scenery;
  areas!: Areas;

  constructor(private game: GameContext) {
    this.visualVehicle = new VisualVehicle(this.game, this.game.resources.vehicle.scene);
    this.floor = new Floor(this.game);
    this.waterSurface = new WaterSurface(this.game);
    this.grass = new Grass(this.game);
    this.scenery = new Scenery(this.game);
    this.areas = new Areas(this.game);
  }
}
