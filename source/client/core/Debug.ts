import { CommonEvents } from "../enums/CommonEventsEnum";

export class Debug {
  private _showFps = true;
  private _showPhysicsDebug = false;


  constructor() {
    g_core.getInternalNet().on(CommonEvents.EVENT_UPDATE, this.update.bind(this));

    g_core.getConsole().setMenuItems("Overlays", [
      {
        label: "Show FPS",
        callback: () => this.toggleFps(),
      }, {
        label: "Show Physics Debug",
        callback: () => this.togglePhysicsDebug(),
      }
    ])
  }

  public toggleFps() {
    this._showFps = !this._showFps;
  }

  public togglePhysicsDebug() {
    this._showPhysicsDebug = !this._showPhysicsDebug;

    if (this._showPhysicsDebug) {
      g_core.getGraphics().getRenderer().getPhysics().debug?.enable()

    } else {
      g_core.getGraphics().getRenderer().getPhysics().debug?.disable()
    }
  }

  public update() {

    const io = g_core.getGraphics().getGUI().getIO();

    if (!io) return;

    const fps = io.Framerate.toFixed(1);

    const domElement = g_core.getGraphics().getRenderer().renderer.domElement;
    const canvasHeight = domElement.height;

    const xPosition = 10;
    const yPosition = canvasHeight - 20;


    if (this._showPhysicsDebug) {
      g_core.getGraphics().getRenderer().getPhysics().updateDebugger();
    }

    if (this._showFps) {
      g_core
        .getGraphics()
        .getGUI()
        .getPrimitives()
        .addText(fps, xPosition, yPosition, "#090909");
    }
  }
}