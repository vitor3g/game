import { Renderer } from './Renderer';

export class Graphics {
  private readonly renderer: Renderer;

  constructor() {
    this.renderer = new Renderer();
  }

  public async initialize() {
    this.renderer.initialize();
  }
  
  public getRendererScene() {
    return this.renderer.scene;
  }

  public getRenderer() {
    return this.renderer;
  }
}
