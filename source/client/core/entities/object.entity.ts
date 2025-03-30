import { RigidBody } from "@/client/physics/rigid-body";
import { Entity, type EntityProps } from "../entity";

export type ObjectEntityProps = EntityProps & {
  objectId: number;
  modelId: number;
  rigidBody: RigidBody;
};

export class ObjectEntity extends Entity<ObjectEntityProps> {
  constructor(props: ObjectEntityProps, id?: string) {
    super(props, id);
  }

  public getModelId() {
    return this.props.modelId;
  }

  public getRigidBody(): RigidBody {
    return this.props.rigidBody;
  }

  public override update(): void {
    const { mesh } = this.props;
    if (!mesh || !this.props.rigidBody) return;

    const body = this.props.rigidBody.getBody();
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);

    super.update();
  }
}
