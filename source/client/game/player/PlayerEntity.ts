import { BaseEntity } from '@/client/ecs/BaseEntity';
import type { GameWorld } from '../GameWorld';

export class PlayerEntity extends BaseEntity {
  constructor(world: GameWorld, name = 'PlayerEntity') {
    super(world, name);
  }
}
