import { Logger } from "@/common/logger";
import { Renderer } from "./renderer";

export class Graphics {
  private readonly logger: Logger;
  private readonly renderer: Renderer;

  constructor() {
    this.logger = new Logger("dz::graphics");
    this.renderer = new Renderer(this);
  }

  public async start() {
    this.renderer.start();
  }

  public getLogger() {
    return this.logger;
  }

  public getRendererScene() {
    return this.renderer.scene;
  }

  public getRenderer() {
    return this.renderer;
  }
}
