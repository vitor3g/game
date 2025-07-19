import { AmmoPhysics } from '@enable3d/ammo-physics';
import { CommonEvents } from '../enums/CommonEventsEnum';

export class Physics {
  private readonly physics: AmmoPhysics;

  constructor() {
    this.physics = new AmmoPhysics(g_core.getGraphics().getRenderer().scene);

    if (DRIFTZONE_DEBUG) {
      g_core
        .getGraphics()
        .getRenderer()
        .getPane()
        .addBinding(
          {
            physics: false,
          },
          'physics',
        )
        .on('change', (c) => {
          if (c.value) {
            this.physics.debug?.enable();
          } else {
            this.physics.debug?.disable();
          }
        });
    }
  }

  public async initialize() {
    g_core
      .getInternalNet()
      .on(CommonEvents.EVENT_UPDATE, this.update.bind(this));
  }

  private update(dt: number) {
    this.physics.update(dt);
    this.physics.updateDebugger();
  }

  public getAmmo(): AmmoPhysics {
    return this.physics;
  }
}
