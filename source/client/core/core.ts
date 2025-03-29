import { Logger } from "@/common/logger";
import { Graphics } from "../graphics/graphics";

export class Core {
  private readonly logger: Logger;
  private readonly graphics: Graphics;

  constructor() {
    this.logger = new Logger("dp::core");
    this.graphics = new Graphics();

    this.logger.log("Core");
  }

  public async start() {
    this.graphics.start();
  }

  public getGraphics() {
    return this.graphics;
  }
}

export const CoreModule = () => new Core();
