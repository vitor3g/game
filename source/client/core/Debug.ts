import CannonDebugger from 'cannon-es-debugger';
import { CommonEvents } from "../enums/CommonEventsEnum";

export class Debug {
  private _showFps = false;
  private _showPhysicsDebug = false;
  private physicsDebug: any;


  constructor() {
    this.physicsDebug = CannonDebugger(g_core.getGraphics().getRenderer().scene, g_core.getGame().getPhysicsSystem(), {})


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
      this.physicsDebug.update()
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