import { Models } from "@/client/core/models";
import type { RigidBody } from "@/client/physics/rigid-body";
import { Entity, type EntityProps } from "../entity";
import { ModelInfo } from "../model-info";

export type ObjectEntityProps = EntityProps & {
  objectId: number;
  modelInfo: ConstructorParameters<typeof ModelInfo>[0];
  rigidBody: RigidBody;
};

/**
 * ObjectEntity is a concrete implementation of the base Entity.
 * It can be used to represent any game object that has a mesh and/or rigidBody.
 */
export class ObjectEntity extends Entity<ObjectEntityProps> {
  constructor(props: ObjectEntityProps, id?: string) {
    super(props, id);

    const modelInfo = new ModelInfo(props.modelInfo);
    this.props.model = Models.registerModel(modelInfo);
  }

  public getModelInfo() {
    return this.props.model.modelInfo;
  }

  /**
   * Override update method to sync physics and visuals.
   */
  public override update(): void {
    const { rigidBody, mesh } = this.props;
    if (!rigidBody || !mesh) return;

    const body = rigidBody.getBody();

    // Posição
    mesh.position.copy(body.position);

    // Rotação (quaternion)
    mesh.quaternion.copy(body.quaternion);

    super.update();
  }
}
