import type { BuildingCollider } from "@/client/physics/building-collider";
import { RigidBody } from "@/client/physics/rigid-body";
import type { Object3D } from "three";
import { Entity, type EntityProps } from "../entity";

export type ObjectEntityProps = EntityProps & {
  collider: BuildingCollider;
  mesh: Object3D
};

export class BuildingEntity extends Entity<ObjectEntityProps> {
  constructor(props: ObjectEntityProps, id?: string) {
    super(props, id);
  }

  public getModelId() {
    return this.id;
  }

  public getRigidBody(): RigidBody {
    return this.props.rigidBody;
  }


  public override update(): void {
    const { mesh } = this.props;
    if (!mesh || !this.props.collider) return;

    const body = this.props.collider.getBody();
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);

    super.update();
  }
}
