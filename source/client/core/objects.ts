import type { RigidBody } from "@/client/physics/rigid-body";
import { ObjectEntity } from "./entities/object.entity";
import type { ModelInfo } from "./model-info";

/**
 * Central registry for all ObjectEntity instances.
 */
export class Objects {
  private static entities = new Map<number, ObjectEntity>();
  private static idCounter = 0;

  public static createObject(
    params: {
      modelInfo: ConstructorParameters<typeof ModelInfo>[0];
      rigidBody: RigidBody;
    },
    id?: string,
  ): ObjectEntity {
    const objectId = this.idCounter++;

    const entity = new ObjectEntity(
      {
        objectId,
        modelInfo: params.modelInfo,
        rigidBody: params.rigidBody,
      },
      id,
    );

    this.entities.set(objectId, entity);
    return entity;
  }

  public static getObjectById(objectId: number): ObjectEntity | undefined {
    return this.entities.get(objectId);
  }

  public static updateAll(): void {
    for (const entity of this.entities.values()) {
      entity.update();
    }
  }

  public getObjectCount() {
    return Objects.idCounter;
  }

  public static clear(): void {
    this.entities.clear();
    this.idCounter = 1;
  }
}
