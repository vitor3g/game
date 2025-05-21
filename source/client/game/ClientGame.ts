import { Camera } from './Camera';
import { Physics } from './Physics';
import { World } from './World';

export class ClientGame {
  private readonly world: World;
  private readonly physics: Physics;

  constructor() {
    this.physics = new Physics();
    this.world = new World();

    const camera = new Camera(this.world);
    this.world.addEntity(camera);
  }

  public async initialize() {
    this.world.initialize();
  }

  public getWorld(): World {
    return this.world;
  }

  public getPhysics(): Physics {
    return this.physics;
  }
}
