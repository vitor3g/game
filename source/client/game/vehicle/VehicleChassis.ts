import { BaseComponent } from "@/client/ecs/BaseComponent";
import type { IGameEntity } from "@/client/ecs/interfaces";
import type { ExtendedMesh } from "@enable3d/ammo-physics";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

export class VehicleChassis extends BaseComponent {
  readonly type: string = "VehicleChassis";

  public chassisMesh!: ExtendedMesh;
  public tireMesh!: ExtendedMesh;

  constructor(entity: IGameEntity) {
    super(entity);
  }

  onInit(): void {
    const model = g_core.getAssetManager().get<GLTF>("a86");

    if (!model) return;



    model.scene.traverse(child => {
      if (child.isObject3D) {
        if (child.name === "Chassis") {
          this.chassisMesh = child as ExtendedMesh;
          this.chassisMesh.position.set(0, 5, 0);
        } else if (child.name === "S_wheel") {
          this.tireMesh = child as ExtendedMesh;


          this.tireMesh.receiveShadow = this.tireMesh.castShadow = true;

          // @ts-ignore
          this.tireMesh.geometry.center()
        }
      }

    })

    if (!this.chassisMesh || !this.tireMesh) return;


    g_core.getGraphics().getRenderer().getPhysics().add.existing(this.chassisMesh, { shape: "box", mass: 1200 });

    this.entity.object3D.add(this.chassisMesh);
  }
}