import { Model } from "./model";
import { ModelInfo } from "./model-info";

export class Models {
  private modelMap = new Map<number, Model>();

  public registerModel(info: ModelInfo): Model {
    const model = new Model(info);
    this.modelMap.set(info.id, model);

    return model;
  }

  public getModelById(id: number): Model | undefined {
    return this.modelMap.get(id);
  }

  public getModelCount(): number {
    return this.modelMap.size;
  }

  public replaceModel(info: ModelInfo): Model {
    const model = new Model(info);
    this.modelMap.set(info.id, model);
    return model;
  }
}
