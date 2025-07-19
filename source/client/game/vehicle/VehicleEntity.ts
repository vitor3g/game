import { BaseEntity } from '@/client/ecs/BaseEntity';
import { VehicleChassis } from './VehicleChassis';
import { VehiclePhysics } from './VehiclePhysics';
import { VehicleController } from './VehicleController';
import { VehicleCamera } from './VehicleCamera';

export interface VehicleProps {
  id: number;
  model: string;
}

export abstract class Vehicle extends BaseEntity {
  private readonly chassis: VehicleChassis;
  private readonly physics: VehiclePhysics;

  constructor(
    name: string,
    public readonly props: VehicleProps,
  ) {
    super(g_core.getClient().getClientGame().getWorld(), name);

    this.chassis = new VehicleChassis(this, this.props);
    this.physics = new VehiclePhysics(this);

    this.addComponent(this.chassis);
    this.addComponent(this.physics);
  }

  public warpIntoVehicle() {
    this.addComponent(
      new VehicleCamera(this, {
        distance: 5,
        smoothing: 0.2,
        sensitivity: 0.1,
        height: 1,
      }),
    );

    this.addScript(new VehicleController(this));
  }

  public setPosition(x: number, y: number, z: number): boolean {
    return this.physics.setPosition(x, y, z);
  }

  public setRotation(x: number, y: number, z: number): boolean {
    return this.physics.setRotation(x, y, z);
  }
}
