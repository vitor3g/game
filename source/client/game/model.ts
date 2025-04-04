import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { ModelInfo } from "./model-info";

export class Model {
  public readonly modelInfo: ModelInfo;
  public mesh: THREE.Object3D | null = null;

  constructor(info: ModelInfo) {
    this.modelInfo = info;
  }

  public async loadModelAsync(): Promise<THREE.Object3D> {
    const loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
      loader.load(this.modelInfo.path, (gltf) => {
        this.mesh = gltf.scene;

        this.mesh.scale.setScalar(this.modelInfo.scale);
        this.mesh.position.set(
          this.modelInfo.position.x,
          this.modelInfo.position.y,
          this.modelInfo.position.z
        );
        this.mesh.rotation.set(
          this.modelInfo.rotation.x,
          this.modelInfo.rotation.y,
          this.modelInfo.rotation.z
        );

        console.log(`Modelo carregado: ${this.modelInfo.path}`);
        resolve(this.mesh);
      }, undefined, (error) => {
        console.error("Erro ao carregar modelo:", error);
        reject(error);
      });
    });
  }


  public setPosition(x: number, y: number, z: number) {
    this.modelInfo.position = { x, y, z };
    if (this.mesh) {
      this.mesh.position.set(x, y, z);
    }
  }

  public setRotation(x: number, y: number, z: number) {
    this.modelInfo.rotation = { x, y, z };
    if (this.mesh) {
      this.mesh.rotation.set(x, y, z);
    }
  }

  public getMesh(): THREE.Object3D {
    return this.mesh!;
  }

  public setScale(scale: number) {
    this.modelInfo.scale = scale;
    if (this.mesh) {
      this.mesh.scale.setScalar(scale);
    }
  }

  public getScale() {
    return this.modelInfo.scale;
  }

  public getRotation() {
    return this.modelInfo.rotation;
  }
}
