import { BaseEntity } from '@/client/ecs/BaseEntity';
import type { IGameWorld } from '@/client/ecs/interfaces';
import { VehicleChassis } from './VehicleChassis';
import { VehiclePhysics } from './VehiclePhysics';

export class VehicleEntity extends BaseEntity {
  constructor(world: IGameWorld, name = 'VehicleEntity') {
    super(world, name);

    this.addComponent(new VehicleChassis(this));
    this.addComponent(new VehiclePhysics(this));
  }
}
