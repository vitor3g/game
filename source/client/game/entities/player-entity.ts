import { Entity } from "../entity";
import type { PlayerController } from "../player-controller";
import type { VehicleEntity } from "./vehicle-entity";

export interface PlayerEntityProps {
  vehicle: VehicleEntity;
  controller?: PlayerController;
}


export class PlayerEntity extends Entity<PlayerEntityProps> {
  constructor(props: PlayerEntityProps, id?: string) {
    super(props, id)
  }

  public spawn() {
    g_core.getGame().getEntityManager().add(this);
    g_core.getGame().getEntityManager().add(this.props.vehicle);
  }

  public setController(controller: PlayerController) {
    this.props.controller = controller;
  }

  public getVehicle() {
    return this.props.vehicle;
  }

  public update(): void {
    if (this.props.controller) {
      this.props.controller.update();
    }
  }
}