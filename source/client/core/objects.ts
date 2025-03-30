import { RigidBody } from "@/client/physics/rigid-body";
import { findFirstMesh } from "@/shared/shared.utils";
import { PhysicsShapeFactory } from "../physics/physics-shape";
import { ObjectEntity } from "./entities/object.entity";
import { ModelInfo, type ModelInfoProps } from "./model-info";

/**
 * Central registry for all ObjectEntity instances.
 */
export class Objects {
  private entities = new Map<number, ObjectEntity>();
  private idCounter = 0;

  constructor() {}

  public async createObject(params: {
    modelInfo: ModelInfoProps;
    mass?: number;
  }): Promise<ObjectEntity> {
    const model = g_core.getModels().registerModel(new ModelInfo(params.modelInfo));
    const rootObject = await model.loadModelAsync();

    const mesh = findFirstMesh(rootObject);
    if (!mesh) {
      throw new Error("Nenhum mesh encontrado no modelo carregado.");
    }

    const shape = PhysicsShapeFactory.fromMesh(mesh);
    if (!shape) {
      throw new Error("Não foi possível gerar shape físico a partir do mesh.");
    }

    const rigidBody = new RigidBody(shape, params.mass ?? 0);

    const objectId = this.idCounter++;
    const entity = new ObjectEntity({ objectId, modelId: model.modelInfo.id, rigidBody, });

    this.entities.set(objectId, entity);
    return entity;
  }



  public getObjectById(objectId: number): ObjectEntity | undefined {
    return this.entities.get(objectId);
  }

  public updateAll(): void {
    for (const entity of this.entities.values()) {
      entity.update();
    }
  }

  public getObjectCount() {
    return this.idCounter;
  }

  public clear(): void {
    this.entities.clear();
    this.idCounter = 1;
  }
}
