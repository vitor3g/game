import { BaseEntity } from "@/client/ecs/BaseEntity";
import type { IGameWorld } from "@/client/ecs/interfaces";
import { CameraComponent } from "../common/components/CameraComponent";
import { VehicleChassis } from "./VehicleChassis";
import { VehicleController } from "./VehicleController";
import { VehiclePhysics } from "./VehiclePhysics";

export class VehicleEntity extends BaseEntity {
  constructor(world: IGameWorld, name = "VehicleEntity") {
    super(world, name);


    this.addComponent(new VehicleChassis(this));
    this.addComponent(new VehiclePhysics(this));
    this.addScript(new VehicleController(this));

    /* Camera */
    const cameraEntity = this.world.getEntity("MainCamera");
    if (!cameraEntity) return;

    const cameraComponent = cameraEntity.getComponent<CameraComponent>(CameraComponent);
    if (!cameraComponent) return;

    cameraComponent.setCameraTarget(this);
  }
}