import { Logger } from "@/common/logger";
import { CoreModule } from "./core/core";

export class dpFactoryStatic {
  private readonly logger!: Logger;

  constructor() {
    this.logger = new Logger("dp::factory");
  }

  public async create() {
    const module = CoreModule();

    module.start();

    this.logger.log("drift paradise module initialized");

    return 0;
  }
}

export const DriftParadise = new dpFactoryStatic();
