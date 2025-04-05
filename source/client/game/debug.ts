import CannonDebugger from 'cannon-es-debugger';
import { VehicleEntity } from './entities/vehicle-entity';


export class Debug {
  private physics_debugger: any;

  constructor() {}

  public start() {
    this.physics_debugger = CannonDebugger(g_core.getGraphics().getRenderer().scene, g_core.getGame().getPhysics().getWorld(), {})
  }

  public update() {
    const io = g_core.getGraphics().getGUI().getIO();
    if (!io) return;

    const fps = io.Framerate.toFixed(1);

    const values = {
      fps: fps,
      keybindings: {
        mouse: {
          x: g_core.getKeybinds().getMousePosition().x,
          y: g_core.getKeybinds().getMousePosition().y,
        },
        active: g_core.getKeybinds().getActiveKeys(),
        pressed: g_core.getKeybinds().getCurrentKeyPressed()
      },

      currentVehicle: {
        speed: g_core.getGame().getEntityManager().getByTag<VehicleEntity>('vehicle')[0].getSpeed(),
        speedKmh: `${Math.floor(g_core.getGame().getEntityManager().getByTag<VehicleEntity>('vehicle')[0].getSpeedKmh())}/kmh`
      },
      buildings: g_core.getGame().getBuildings().getBuildingsCount(),
    };


    this.physics_debugger.update();


    g_core
      .getGraphics()
      .getGUI()
      .getPrimitiveList()
      .addText(JSON.stringify(values, null, 2), 10, 10, "#090909");
  }
}