import * as CANNON from "cannon-es";
import * as THREE from "three";
import { BuildingCollider } from "../physics/building-collider";
import { createBoxCollider } from "../physics/utils/create-box-collider";
import { BuildingEntity } from "./entities/building-entity";


export class Buildings {
  private buildings = new Map<string, BuildingEntity>();

  public createStaticGeometryBuilding() {
    const geometry = new THREE.BoxGeometry(1000, 1, 1000);
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const mesh = new THREE.Mesh(geometry, material);

    const size = new THREE.Vector3(1000, 1, 1000);
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

  public createTestMap() {
    const mapLayout = [
      { pos: [0, 0.5, 0], size: [1000, 1, 1000], color: 0x888888 }, // chão

      // Caixas espalhadas (prédios ou obstáculos)
      //{ pos: [10, 1, 10], size: [4, 2, 4], color: 0xff5555 },
      //{ pos: [-15, 1, -5], size: [6, 2, 3], color: 0x55ff55 },
      //{ pos: [20, 1, -10], size: [5, 2, 5], color: 0x5555ff },
      //{ pos: [0, 1, 20], size: [4, 2, 6], color: 0xffff55 },
      //{ pos: [-10, 1, 15], size: [7, 2, 7], color: 0xff55ff },
      //{ pos: [30, 1, 0], size: [10, 2, 10], color: 0x55ffff },

      //// Paredes/limites
      //{ pos: [0, 1, -50], size: [100, 2, 2], color: 0x222222 },
      //{ pos: [0, 1, 50], size: [100, 2, 2], color: 0x222222 },
      //{ pos: [-50, 1, 0], size: [2, 2, 100], color: 0x222222 },
      //{ pos: [50, 1, 0], size: [2, 2, 100], color: 0x222222 },
    ];

    for (const { pos, size, color } of mapLayout) {
      const geometry = new THREE.BoxGeometry(...size);
      const material = new THREE.MeshStandardMaterial({ color });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(pos[0], pos[1], pos[2]);

      const shape = createBoxCollider(new THREE.Vector3(...size));
      const collider = new BuildingCollider(shape, new CANNON.Vec3(...pos));

      const building = new BuildingEntity({ mesh, collider });

      g_core.getGraphics().getRenderer().scene.add(mesh);
      g_core.getGame().getPhysics().getWorld().addBody(collider.getBody());


      g_core.getGame().getEntityManager().add(building)
      this.buildings.set(building.getModelId(), building);
    }
  }


  public getBuildingsCount() {
    return this.buildings.size;
  }
}
