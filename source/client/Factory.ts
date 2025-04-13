import { CoreModule } from "./core/Core";

export class dzFactoryStatic {
  constructor() {
  }

  public async create() {
    const module = CoreModule();

    await module.start();

    return 0;
  }
}

export const DriftZone = new dzFactoryStatic();
