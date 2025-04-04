import * as CANNON from "cannon-es";
import { Vector3 } from "three";

/**
* Creates an actual CANNON.Box, not a descriptive object.
* CANNON.Box expects "halfExtents".
*/
export function createBoxCollider(size: Vector3): CANNON.Box {
  const halfExtents = new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2);
  return new CANNON.Box(halfExtents);
}