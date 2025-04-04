
import type { PlayerEntity } from "./entities/player-entity";

export class PlayerController {
  private readonly player: PlayerEntity;

  constructor(localPlayer: PlayerEntity) {
    this.player = localPlayer;
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
      vehicle.applyEngineForce(-800);
      vehicle.setBrake(0);
    } else if (input.isKeyDown("KeyS")) {
      vehicle.applyEngineForce(300);
      vehicle.setBrake(0);
    } else {
      vehicle.applyEngineForce(0);
      vehicle.setBrake(10);
    }
  }
}
