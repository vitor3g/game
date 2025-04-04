import type { VehiclePhysics } from "@/client/physics/vehicle-physics";
import { Entity } from "../entity";

export interface VehicleEntityProps {
  model_id: string;
  raycasted_vehicle: VehiclePhysics;
}


export class VehicleEntity extends Entity<VehicleEntityProps> {
  constructor(props: VehicleEntityProps, id?: string) {
    super(props, id)
  }

  public update() {
    if (this.props.raycasted_vehicle) {
      this.props.raycasted_vehicle.updateVisuals();
    }
  }
}