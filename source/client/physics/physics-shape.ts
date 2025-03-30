import * as CANNON from "cannon-es";
import * as THREE from "three";


export class PhysicsShapeFactory {
  static fromMesh(mesh: THREE.Mesh): CANNON.Trimesh | null {
    const geometry = mesh.geometry;
    const posAttr = geometry.attributes.position;
    const indexAttr = geometry.index;

    if (!posAttr || !indexAttr) {
      console.warn("Geometry missing position or index attribute.");
      return null;
    }

    const vertices = Array.from(posAttr.array);
    const indices = Array.from(indexAttr.array);

    return new CANNON.Trimesh(vertices, indices);
  }
}
