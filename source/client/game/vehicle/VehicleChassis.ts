import { BaseComponent } from "@/client/ecs/BaseComponent";
import type { IGameEntity } from "@/client/ecs/interfaces";
import type { ExtendedMesh } from "@enable3d/ammo-physics";
import { Color, MeshPhongMaterial } from "three"; // Import necessary Three.js classes
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

export class VehicleChassis extends BaseComponent {
  readonly type: string = "VehicleChassis";

  public chassisMesh!: ExtendedMesh;
  public tireMesh!: ExtendedMesh;
  private parts!: ExtendedMesh;

  constructor(entity: IGameEntity) {
    super(entity);
  }

  onInit(): void {
    const model = g_core.getAssetManager().get<GLTF>("s15");

    if (!model) return;

    const darkGlassMaterial = new MeshPhongMaterial({
      color: new Color(0x000000),
      transparent: true,
      opacity: 0.5,
      specular: new Color(0x111111),
      shininess: 90,
      reflectivity: 1.0,
    });

    model.scene.traverse((child) => {
      if (child.isObject3D) {
        const extendedChild = child as ExtendedMesh;

        if (extendedChild.name === "chassis_clo") {
          this.chassisMesh = extendedChild;

          if (!Array.isArray(this.chassisMesh.material)) {
            this.chassisMesh.material.opacity = 0;
          }
        } else if (extendedChild.name === "wheel") {
          this.tireMesh = extendedChild;
        } else if (extendedChild.name === "chassis_dummy") {
          this.parts = extendedChild;
        } else if (extendedChild.name.includes("glass")) {
          if (Array.isArray(extendedChild.material)) {
            extendedChild.material = extendedChild.material.map(() => darkGlassMaterial.clone());
          } else {
            extendedChild.material = darkGlassMaterial.clone();
          }
        }
      }
    });

    g_core.getGraphics().getRenderer().getPhysics().add.existing(this.chassisMesh, { shape: "convex", mass: 1200 });

    this.chassisMesh.add(this.parts);
    this.entity.object3D.add(this.chassisMesh);
  }
}