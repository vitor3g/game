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
  constructor(
    name: string,
    public readonly props: VehicleProps,
  ) {
    super(g_core.getClient().getClientGame().getWorld(), name);

    this.addComponent(new VehicleChassis(this, this.props));
    this.addComponent(new VehiclePhysics(this));
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
}
