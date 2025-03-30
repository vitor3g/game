import { Entity, type EntityProps } from "../entity";

/**
* ObjectEntity is a concrete implementation of the base Entity.
* It can be used to represent any game object
* that has a mesh and/or rigidBody.
*/
export class ObjectEntity extends Entity {
  constructor(props: EntityProps, id?: string) {
    super(props, id);
  }

  /**
  * If necessary, you can override the update() method
  * to add logic specific to this entity.
  */
  public override update(): void {
    super.update();
  }
}
