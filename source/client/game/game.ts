import { GameWorld } from './GameWorld';
import { Physics } from './Physics';

export class Game {
  private readonly gameWorld: GameWorld;
  private readonly physics: Physics;

  constructor() {
    this.physics = new Physics();
    this.gameWorld = new GameWorld(
      'game-world',
      g_core.getGraphics().getRendererScene(),
    );
  }

  public async start() {
    await this.physics.start();
    this.gameWorld.initialize();
  }

  public getPhysics() {
    return this.physics.getPhysics();
  }

  public getGameWorld() {
    return this.gameWorld;
  }
}
