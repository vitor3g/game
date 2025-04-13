import { CommonEvents } from "../enums/CommonEventsEnum";

export class Debug {
  private _showFps = false;

  constructor() {
    g_core.getInternalNet().on(CommonEvents.EVENT_UPDATE, this.update.bind(this));

    g_core.getConsole().setMenuItems("Overlays", [
      {
        label: "Show FPS",
        callback: () => this.toggleFps(),
      }
    ])
  }

  public toggleFps() {
    this._showFps = !this._showFps;
  }

  public update() {
    if (!this._showFps) return;

    const io = g_core.getGraphics().getGUI().getIO();

    if (!io) return;

    const fps = io.Framerate.toFixed(1);

    const domElement = g_core.getGraphics().getRenderer().renderer.domElement;
    const canvasHeight = domElement.height;

    const xPosition = 10;
    const yPosition = canvasHeight - 20;

    g_core
      .getGraphics()
      .getGUI()
      .getPrimitives()
      .addText(fps, xPosition, yPosition, "#090909");
  }
}