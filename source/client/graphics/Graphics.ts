import type { ContextLogger } from '../core/Console';
import { Gui } from './GUI';
import { Renderer } from './Renderer';

export class Graphics {
  private readonly logger: ContextLogger;
  private readonly renderer: Renderer;
  private readonly gui: Gui;

  constructor() {
    this.logger = g_core.getConsole().NewLoggerCtx('dz::graphics');
    this.renderer = new Renderer(this);
    this.gui = new Gui(this);
  }

  public async initialize() {
    this.renderer.initialize();

    await this.gui.initialize();
  }

  public getLogger() {
    return this.logger;
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
