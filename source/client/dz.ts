import { Logger } from "@/common/logger";
import { CoreModule } from "./core/core";

export class dzFactoryStatic {
  private readonly logger!: Logger;

  constructor() {
    this.logger = new Logger("dz::factory");
  }

  public async create() {
    const module = CoreModule();

    await module.start();

    this.logger.log("drift zone module initialized");

    return 0;
  }
}

export const DriftZone = new dzFactoryStatic();
