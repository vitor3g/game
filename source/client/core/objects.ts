import { RigidBody } from "@/client/physics/rigid-body";
import { ObjectEntity } from "./entities/object.entity";
import { ModelInfo, type ModelInfoProps } from "./model-info";

// NOVO: importações do three-to-cannon
import * as CANNON from "cannon-es";
import { ShapeType, threeToCannon } from "three-to-cannon";

/**
 * Central registry for all ObjectEntity instances.
 */
export class Objects {
  private entities = new Map<number, ObjectEntity>();
  private idCounter = 0;

  public async createObject(params: {
    modelInfo: ModelInfoProps;
    mass?: number;
    shapeType?: ShapeType; // opcional: permite configurar o tipo de colisão
  }): Promise<ObjectEntity> {
    const model = g_core.getModels().registerModel(new ModelInfo(params.modelInfo));
    const rootObject = await model.loadModelAsync();

    const result = threeToCannon(rootObject as any, {
      type: params.shapeType ?? ShapeType.HULL,
    })

    if (!result?.shape) {
      throw new Error("Não foi possível gerar shape físico com three-to-cannon.");
    }

    const cannonBody = new CANNON.Body({
      mass: params.mass ?? 0,
    });

    // Adiciona shape com offset/rotação corretos
    cannonBody.addShape(result.shape, result.offset, result.orientation);

    const rigidBody = new RigidBody(cannonBody); // seu wrapper

    const objectId = this.idCounter++;
    const entity = new ObjectEntity({
      objectId,
      modelId: model.modelInfo.id,
      rigidBody,
      mesh: rootObject,
    });

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

  public getObjectCount(): number {
    return this.idCounter;
  }

  public clear(): void {
    this.entities.clear();
    this.idCounter = 0;
  }
}
