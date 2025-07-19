import { AmmoPhysics } from '@enable3d/ammo-physics';
import { CommonEvents } from '../enums/CommonEventsEnum';

export class Physics {
  private readonly physics: AmmoPhysics;

  constructor() {
    this.physics = new AmmoPhysics(g_core.getGraphics().getRenderer().scene);
  }

  public async initialize() {
    g_core
      .getInternalNet()
      .on(CommonEvents.EVENT_UPDATE, this.update.bind(this));
  }

  private update(dt: number) {
    this.physics.update(dt * 1000); 
  }

  public getAmmo(): AmmoPhysics {
    return this.physics;
  }
}
