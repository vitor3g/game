import { Model } from "./model";
import { ModelInfo } from "./model-info";

export class Models {
  private static modelMap = new Map<number, Model>();

  public static registerModel(info: ModelInfo): Model {
    const model = new Model(info);
    this.modelMap.set(info.id, model);
    return model;
  }

  public static getModelById(id: number): Model | undefined {
    return this.modelMap.get(id);
  }

  public getModelCount(): number {
    return Models.modelMap.size;
  }

  public static replaceModel(info: ModelInfo): Model {
    const model = new Model(info);
    this.modelMap.set(info.id, model);
    return model;
  }
}
