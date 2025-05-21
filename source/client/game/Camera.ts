import { BaseEntity } from "../ecs/BaseEntity";
import type { World } from "./World";

export class Camera extends BaseEntity {
  constructor (world: World) {
    super(world);
  }

  initialize(): void {
    
  }
}