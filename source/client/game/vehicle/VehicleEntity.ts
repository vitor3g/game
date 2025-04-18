import { BaseEntity } from "@/client/ecs/BaseEntity";
import type { IGameWorld } from "@/client/ecs/interfaces";
import { VehicleChassis } from "./VehicleChassis";
import { VehicleController } from "./VehicleController";
import { VehiclePhysics } from "./VehiclePhysics";
import { VehicleCamera } from "./VehicleCamera";

export class VehicleEntity extends BaseEntity {
  constructor(world: IGameWorld, name = "VehicleEntity") {
    super(world, name);


    this.addComponent(new VehicleChassis(this));
    this.addComponent(new VehiclePhysics(this));
    this.addScript(new VehicleController(this));

    // /* Camera */
    this.addComponent(new VehicleCamera(this, {
      distance: 5,
      smoothing: 0.2,
      sensitivity: 0.1,
      height: 1
    }))
  }
}