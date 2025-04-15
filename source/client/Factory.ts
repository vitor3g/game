import { CoreModule } from "./core/Core";

export class dzFactoryStatic {
  constructor() {
  }

  public async create() {
    await this._bootstrapAmmoPhysics();

    const module = CoreModule();

    await module.start();

    return 0;
  }

  private async _bootstrapAmmoPhysics() {
    await new Promise((resolve) => {
      import('ammojs-typed')
        .then((Module) => Module.default())
        .then((ammo) => {
          window.Ammo = ammo;

          resolve(ammo)
        })
    })
  }
}

export const DriftZone = new dzFactoryStatic();
