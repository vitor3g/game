import { ulid } from "ulid";
import { VehiclePhysics } from "../physics/vehicle-physics";
import { PlayerEntity } from "./entities/player-entity";
import { VehicleEntity } from "./entities/vehicle-entity";
import type { Game } from "./game";

export class World {
  constructor(private readonly g_game: Game) {}

  public createGameWorld() {
    const floorEntity = this.g_game.getBuildings().createStaticGeometryBuilding();
    this.g_game.getEntityManager().add(floorEntity);

    const vehicleRay = new VehiclePhysics();
    const vehicleEntity = new VehicleEntity({
      model_id: ulid(),
      raycasted_vehicle: vehicleRay,
    });

    const player = new PlayerEntity({
      vehicle: vehicleEntity
    })

    player.spawn()
  }
}