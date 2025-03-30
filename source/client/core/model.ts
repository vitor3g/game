import { ModelInfo } from "./model-info";

export class Model {
  public readonly modelInfo: ModelInfo;

  constructor(info: ModelInfo) {
    this.modelInfo = info;

    this.loadModel();
  }

  private loadModel() {
    console.log(`Carregando modelo de ${this.modelInfo.path}`);
  }

  public setPosition(x: number, y: number, z: number) {
    this.modelInfo.position = { x, y, z };
  }

  public setRotation(x: number, y: number, z: number) {
    this.modelInfo.rotation = { x, y, z };
  }

  public setScale(scale: number) {
    this.modelInfo.scale = scale;
  }

  public getScale() {
    return this.modelInfo.scale;
  }

  public getRotation() {
    return this.modelInfo.rotation;
  }
}
