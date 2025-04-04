import * as CANNON from "cannon-es";
import * as THREE from "three";
import { BuildingCollider } from "../physics/building-collider";
import { createBoxCollider } from "../physics/utils/create-box-collider";
import { BuildingEntity } from "./entities/building-entity";


export class Buildings {
  private buildings = new Map<string, BuildingEntity>();

  public createStaticGeometryBuilding() {
    const geometry = new THREE.BoxGeometry(10, 1, 10);
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const mesh = new THREE.Mesh(geometry, material);

    const size = new THREE.Vector3(10, 1, 10);
    const shape = createBoxCollider(size);

    const position = new CANNON.Vec3(0, 0, 0);

    const collider = new BuildingCollider(shape, position);
    const building = new BuildingEntity({
      collider,
      mesh
    })

    this.buildings.set(building.getModelId(), building);

    // TODO: REPLACE THIS TO STREAMABLE-ENTITY-BUILDING
    g_core.getGraphics().getRenderer().scene.add(mesh);

    return building;
  }

  public update() {

  };

  public getBuildingsCount() {
    return this.buildings.size;
  }
}
