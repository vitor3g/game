import { Logger } from "@/common/logger";
import { Renderer } from "./renderer";

export class Graphics {
  private readonly logger: Logger;
  private readonly renderer: Renderer;

  constructor() {
    this.logger = new Logger("dp::graphics");
    this.renderer = new Renderer(this);
  }

  public async start() {
    this.renderer.start();
  }

  public getLogger() {
    return this.logger;
  }

  public getRenderer() {
    return this.renderer;
  }
}
