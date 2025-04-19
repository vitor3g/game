import type { GameWorld } from '../GameWorld';
import { SkyEntity } from './sky/SkyEntity';

export class Ambience {
  private sky!: SkyEntity;

  constructor(private readonly g_gameWorld: GameWorld) {
    this.sky = new SkyEntity(this.g_gameWorld);
  }

  public async initialieze() {
    this.g_gameWorld.addEntity(this.sky);
    g_core.getDebug()._createDebugMap();
  }

  public getSky() {
    return this.sky;
  }
}
