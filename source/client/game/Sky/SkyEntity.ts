import { BaseEntity } from "@/client/ecs/BaseEntity";
import type { IGameWorld } from "@/client/ecs/interfaces";
import { SkyComponent } from "./SkyComponent";

export class SkyEntity extends BaseEntity {
  constructor(world: IGameWorld, name = 'SkyEntity') {
    super(world, name);

    this.tags.add('environment');

    const skyComponent = new SkyComponent(this);
    this.addComponent(skyComponent)
  }
}