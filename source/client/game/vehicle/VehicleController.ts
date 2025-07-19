import { BaseScript } from '@/client/ecs/BaseScript';
import type { IGameEntity } from '@/client/ecs/interfaces';
import { VehiclePhysics } from './VehiclePhysics';

export class VehicleController extends BaseScript {
  private steering = 0;
  readonly type: string = 'VehicleController';

  constructor(entity: IGameEntity) {
    super(entity);
  }

  onUpdate(): void {
    const vehicle = this.entity.getComponent<VehiclePhysics>(VehiclePhysics);
    if (!vehicle) return;

    const keyboard = g_core.getKeybinds();

    const FRONT_LEFT = 0;
    const FRONT_RIGHT = 1;
    const BACK_LEFT = 2;
    const BACK_RIGHT = 3;

    let engineForce = 0;
    const steeringIncrement = 0.04;
    const steeringClamp = 0.3;
    const maxEngineForce = 5000;

    if (keyboard.isKeyDown('KeyW')) {
      engineForce = -maxEngineForce;
    } else if (keyboard.isKeyDown('KeyS')) {
      engineForce = maxEngineForce;
    } else {
      engineForce = 0;
    }

    if (keyboard.isKeyDown('KeyA')) {
      if (this.steering < steeringClamp) this.steering += steeringIncrement;
    } else if (keyboard.isKeyDown('KeyD')) {
      if (this.steering > -steeringClamp) this.steering -= steeringIncrement;
    } else {
      if (this.steering > 0) this.steering -= steeringIncrement / 2;
      if (this.steering < 0) this.steering += steeringIncrement / 2;
      if (Math.abs(this.steering) <= steeringIncrement) this.steering = 0;
    }

    vehicle.getVehicle().applyEngineForce(engineForce, BACK_LEFT);
    vehicle.getVehicle().applyEngineForce(engineForce, BACK_RIGHT);

    vehicle.getVehicle().setSteeringValue(this.steering, FRONT_LEFT);
    vehicle.getVehicle().setSteeringValue(this.steering, FRONT_RIGHT);
  }
}