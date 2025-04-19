import { BaseEntity } from '@/client/ecs/BaseEntity';
import type { IGameWorld } from '@/client/ecs/interfaces';
import { SkyComponent } from './SkyComponent';

export class SkyEntity extends BaseEntity {
  private readonly skyComponent: SkyComponent;
  constructor(world: IGameWorld, name = 'SkyEntity') {
    super(world, name);

    this.tags.add('environment');

    this.skyComponent = new SkyComponent(this);
  }

  initialize(): void {
    super.initialize();

    this.addComponent(this.skyComponent);
  }
}
