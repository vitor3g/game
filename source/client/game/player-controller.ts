import type { PlayerCameraEntity } from "./entities/player-camera-entity";
import type { PlayerEntity } from "./entities/player-entity";

export class PlayerController {
  private readonly player: PlayerEntity;
  private readonly camera: PlayerCameraEntity;

  constructor(localPlayer: PlayerEntity, camera: PlayerCameraEntity) {
    this.player = localPlayer;
    this.camera = camera;
  }

  public update(): void {
    const input = g_core.getKeybinds();
    const vehicle = this.player.getVehicle().props.raycasted_vehicle;

    let steering = 0;
    if (input.isKeyDown("KeyA")) {
      steering = Math.PI / 8;
    } else if (input.isKeyDown("KeyD")) {
      steering = -Math.PI / 8;
    }
    vehicle.setSteeringValue(steering);

    if (input.isKeyDown("KeyW")) {
      vehicle.applyEngineForce(-200);
      vehicle.setBrake(0);
    } else if (input.isKeyDown("KeyS")) {
      vehicle.applyEngineForce(60);
      vehicle.setBrake(0);
    } else {
      vehicle.applyEngineForce(0);
      vehicle.setBrake(10);
    }
    this.camera.update()
  }
}
