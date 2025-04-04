import { Logger } from "@/common/logger";
import { Gui } from "./gui/gui";
import { Renderer } from "./renderer";
import { TickManager } from "./tick-manager";

export class Graphics {
  private readonly logger: Logger;
  private readonly renderer: Renderer;
  private readonly gui: Gui;
  private readonly tickManager: TickManager;

  constructor() {
    this.logger = new Logger("dz::graphics");
    this.tickManager = new TickManager();
    this.renderer = new Renderer(this);
    this.gui = new Gui(this);
  }

  public async start() {
    this.renderer.start();

    await this.gui.start();
  }

  public getLogger() {
    return this.logger;
  }

  public getTickManager() {
    return this.tickManager;
  }

  public getRendererScene() {
    return this.renderer.scene;
  }

  public getGUI() {
    return this.gui;
  }

  public getRenderer() {
    return this.renderer;
  }
}