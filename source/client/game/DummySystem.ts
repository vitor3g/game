import { BaseSystem } from '@/client/ecs/BaseSystem';
import {
  SystemPriority,
  type IGameEntity,
  type IGameWorld,
} from '@/client/ecs/interfaces';
import type { Object3D } from 'three';

export class DummySystem extends BaseSystem {
  constructor(world: IGameWorld) {
    super(world, 'Dummy', SystemPriority.HIGH);
  }

  checkEntityCompatibility(entity: IGameEntity): boolean {
    return !!entity && !!entity.object3D;
  }

  getDummies(entity: IGameEntity): Object3D[] {
    const dummies: Object3D[] = [];

    if (!this.checkEntityCompatibility(entity)) {
      return dummies;
    }

    const object = entity.object3D;

    object.traverse((child) => {
      if (child.name?.toLowerCase().includes('dummy')) {
        dummies.push(child);
      }
    });

    return dummies;
  }

  getDummy(entity: IGameEntity, dummyName: string): Object3D | null {
    const dummies = this.getDummies(entity);
    return dummies.find((dummy) => dummy.name === dummyName) ?? null;
  }
}
