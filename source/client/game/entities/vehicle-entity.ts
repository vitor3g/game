import type { VehiclePhysics } from "@/client/physics/vehicle-physics";
import * as THREE from "three";
import { Entity } from "../entity";

export interface VehicleEntityProps {
  model_id: string;
  raycasted_vehicle: VehiclePhysics;
}


export class VehicleEntity extends Entity<VehicleEntityProps> {
  constructor(props: VehicleEntityProps, id?: string) {
    super(props, id)
  }

  public getChassis() {
    return this.props.raycasted_vehicle.getChassisMesh();
  }

  public getSpeed() {
    return this.props.raycasted_vehicle.getSpeed();
  }

  public getSpeedKmh() {
    return this.props.raycasted_vehicle.getSpeedKmh()
  }

  public getPosition() {
    return this.props.raycasted_vehicle.chassisMesh.position;
  }

  public getRotation() {
    return new THREE.Euler().setFromQuaternion(
      this.props.raycasted_vehicle.chassisMesh.quaternion
    );
  }


  public update() {
    if (this.props.raycasted_vehicle) {
      this.props.raycasted_vehicle.updateVisuals();
    }
  }
}