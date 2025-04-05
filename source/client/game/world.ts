import { ulid } from "ulid";
import { VehiclePhysics } from "../physics/vehicle-physics";
import { PlayerCameraEntity } from "./entities/player-camera-entity";
import { PlayerEntity } from "./entities/player-entity";
import { VehicleEntity } from "./entities/vehicle-entity";
import type { Game } from "./game";
import { PlayerController } from "./player-controller";

export class World {
  constructor(private readonly g_game: Game) {}

  public createGameWorld() {
    this.g_game.getBuildings().createTestMap();

    const vehicleRay = new VehiclePhysics();

    const vehicleEntity = new VehicleEntity({
      model_id: ulid(),
      raycasted_vehicle: vehicleRay,
    });

    vehicleEntity.addTag('vehicle')

    const cameraEntity = new PlayerCameraEntity({
      smoothness: 0.1,
      domElement: g_core.getGraphics().getRenderer().renderer.domElement
    });


    const player = new PlayerEntity({
      vehicle: vehicleEntity,
    })


    const controller = new PlayerController(player, cameraEntity)


    cameraEntity.setCameraTarget(player);

    player.setController(controller);

    g_core.getGraphics().getRenderer().camera = cameraEntity.camera;

    player.spawn()
  }
}